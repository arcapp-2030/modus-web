import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';
const COOKIE_NAME = 'modus_auth_token';

interface TokenPayload {
  userId?: string;
  id?: string;
}

async function verifyGroupAccess(groupId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { error: 'Não autenticado.', status: 401 as const };

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return { error: 'Sessão inválida.', status: 401 as const };
  }

  const userId = decoded.userId || decoded.id;
  if (!userId) return { error: 'Token inválido.', status: 401 as const };

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true },
  });

  if (!currentUser || currentUser.status !== 'ACTIVE') {
    return { error: 'Usuário inválido.', status: 401 as const };
  }

  if (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN') {
    return { error: 'Acesso negado.', status: 403 as const };
  }

  const group = await prisma.travelGroup.findUnique({
    where: { id: groupId },
    select: { id: true, managerId: true, name: true },
  });

  if (!group) {
    return { error: 'Grupo não encontrado.', status: 404 as const };
  }

  if (currentUser.role !== 'ADMIN' && group.managerId !== currentUser.id) {
    return {
      error: 'Você não tem permissão para gerenciar este grupo.',
      status: 403 as const,
    };
  }

  return { user: currentUser, group, status: 200 as const };
}

// --------------------------------------------------------
// POST /api/admin/groups/[id]/members
// Adiciona viajante ao grupo por inviteCode (UUID) ou userId
// --------------------------------------------------------
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await context.params;
    const access = await verifyGroupAccess(groupId);
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const inviteCode =
      typeof body.inviteCode === 'string' ? body.inviteCode.trim() : '';
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

    if (!inviteCode && !userId) {
      return NextResponse.json(
        { error: 'Informe o inviteCode (UUID) ou selecione um cliente.' },
        { status: 400 }
      );
    }

    const targetClient = await prisma.user.findFirst({
      where: {
        role: 'USER',
        ...(inviteCode ? { inviteCode } : { id: userId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        inviteCode: true,
      },
    });

    if (!targetClient) {
      return NextResponse.json(
        { error: 'Nenhum cliente encontrado com o código ou identificador informado.' },
        { status: 404 }
      );
    }

    // Se entrou por userId (sem inviteCode), exige vínculo prévio na carteira do MANAGER
    if (!inviteCode && access.user.role !== 'ADMIN') {
      const link = await prisma.clientManager.findUnique({
        where: {
          managerId_clientId: {
            managerId: access.user.id,
            clientId: targetClient.id,
          },
        },
      });

      if (!link) {
        return NextResponse.json(
          { error: 'Este cliente não pertence à sua carteira. Use o inviteCode dele para vincular.' },
          { status: 403 }
        );
      }
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetClient.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Este viajante já faz parte do grupo.' },
        { status: 409 }
      );
    }

    const member = await prisma.$transaction(async (tx) => {
      // Garante vínculo na carteira do agente responsável pelo grupo
      await tx.clientManager.upsert({
        where: {
          managerId_clientId: {
            managerId: access.group.managerId,
            clientId: targetClient.id,
          },
        },
        update: {},
        create: {
          managerId: access.group.managerId,
          clientId: targetClient.id,
        },
      });

      return tx.groupMember.create({
        data: {
          groupId,
          userId: targetClient.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              inviteCode: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: `${targetClient.name} adicionado ao grupo com sucesso!`,
        member,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro em POST /api/admin/groups/[id]/members:', error);
    return NextResponse.json(
      { error: 'Erro interno ao adicionar membro ao grupo.' },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------
// DELETE /api/admin/groups/[id]/members?userId=...
// Remove um viajante do grupo
// --------------------------------------------------------
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await context.params;
    const access = await verifyGroupAccess(groupId);
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Informe o userId do participante a remover.' },
        { status: 400 }
      );
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Participante removido do grupo.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro em DELETE /api/admin/groups/[id]/members:', error);
    return NextResponse.json(
      { error: 'Erro interno ao remover membro do grupo.' },
      { status: 500 }
    );
  }
}