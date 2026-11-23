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

async function getAuthenticatedStaff() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return { error: 'Não autenticado.', status: 401 as const };
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return { error: 'Sessão inválida ou expirada.', status: 401 as const };
  }

  const userId = decoded.userId || decoded.id;
  if (!userId) {
    return { error: 'Token inválido.', status: 401 as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    return { error: 'Usuário não encontrado ou inativo.', status: 401 as const };
  }

  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
    return {
      error: 'Acesso restrito a agentes (MANAGER) ou proprietário (ADMIN).',
      status: 403 as const,
    };
  }

  return { user, status: 200 as const };
}

// --------------------------------------------------------
// GET /api/admin/groups
// Lista grupos de viagem do MANAGER (ou todos para ADMIN)
// --------------------------------------------------------
export async function GET() {
  try {
    const auth = await getAuthenticatedStaff();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const whereClause =
      auth.user.role === 'ADMIN' ? {} : { managerId: auth.user.id };

    const groups = await prisma.travelGroup.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        members: {
          orderBy: { joinedAt: 'asc' },
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
        },
        trips: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Erro em GET /api/admin/groups:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar grupos de viagem.' },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------
// POST /api/admin/groups
// Cria um novo TravelGroup e vincula membros iniciais
// --------------------------------------------------------
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedStaff();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body.description === 'string' && body.description.trim()
        ? body.description.trim()
        : null;

    const memberIds: string[] = Array.isArray(body.memberIds)
      ? body.memberIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];

    const inviteCodes: string[] = Array.isArray(body.inviteCodes)
      ? body.inviteCodes
          .filter((code: unknown): code is string => typeof code === 'string')
          .map((code) => code.trim())
          .filter(Boolean)
      : [];

    if (!name) {
      return NextResponse.json(
        { error: 'O nome do grupo de viagem é obrigatório.' },
        { status: 400 }
      );
    }

    // Resolve usuários pelos inviteCodes informados
    const usersByInvite =
      inviteCodes.length > 0
        ? await prisma.user.findMany({
            where: {
              inviteCode: { in: inviteCodes },
              role: 'USER',
            },
            select: { id: true },
          })
        : [];

    // Garante que memberIds pertençam à carteira do MANAGER (ou qualquer USER se ADMIN)
    let validPortfolioIds: string[] = [];
    if (memberIds.length > 0) {
      if (auth.user.role === 'ADMIN') {
        const users = await prisma.user.findMany({
          where: { id: { in: memberIds }, role: 'USER' },
          select: { id: true },
        });
        validPortfolioIds = users.map((u) => u.id);
      } else {
        const links = await prisma.clientManager.findMany({
          where: {
            managerId: auth.user.id,
            clientId: { in: memberIds },
          },
          select: { clientId: true },
        });
        validPortfolioIds = links.map((l) => l.clientId);
      }
    }

    const uniqueUserIds = Array.from(
      new Set([...validPortfolioIds, ...usersByInvite.map((u) => u.id)])
    );

    const createdGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.travelGroup.create({
        data: {
          name,
          description,
          managerId: auth.user.id,
          ...(uniqueUserIds.length > 0
            ? {
                members: {
                  create: uniqueUserIds.map((userId) => ({ userId })),
                },
              }
            : {}),
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  inviteCode: true,
                },
              },
            },
          },
          trips: true,
        },
      });

      // Garante vínculo na carteira ClientManager para quem entrou via inviteCode
      for (const userId of uniqueUserIds) {
        await tx.clientManager.upsert({
          where: {
            managerId_clientId: {
              managerId: auth.user.id,
              clientId: userId,
            },
          },
          update: {},
          create: {
            managerId: auth.user.id,
            clientId: userId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'CREATED_TRAVEL_GROUP',
          details: {
            groupId: group.id,
            groupName: group.name,
            membersCount: uniqueUserIds.length,
          },
        },
      });

      return group;
    });

    return NextResponse.json(createdGroup, { status: 201 });
  } catch (error) {
    console.error('Erro em POST /api/admin/groups:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar grupo de viagem.' },
      { status: 500 }
    );
  }
}