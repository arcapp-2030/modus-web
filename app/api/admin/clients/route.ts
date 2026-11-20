import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';
const COOKIE_NAME = 'modus_auth_token';

interface TokenPayload {
  userId?: string;
  id?: string;
  email?: string;
  role?: string;
}

async function getAuthenticatedManager() {
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
    return { error: 'Token sem identificador de usuário.', status: 401 as const };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!currentUser || currentUser.status !== 'ACTIVE') {
    return { error: 'Usuário não encontrado ou inativo.', status: 401 as const };
  }

  if (currentUser.role !== 'MANAGER') {
    return {
      error: 'Acesso restrito a usuários com perfil MANAGER.',
      status: 403 as const,
    };
  }

  return { manager: currentUser, status: 200 as const };
}

// --------------------------------------------------------
// GET /api/admin/clients
// Retorna apenas os clientes vinculados ao MANAGER logado
// --------------------------------------------------------
export async function GET() {
  try {
    const auth = await getAuthenticatedManager();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const links = await prisma.clientManager.findMany({
      where: {
        managerId: auth.manager.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            inviteCode: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
            _count: {
              select: {
                individualTrips: true,
                groupMemberships: true,
              },
            },
          },
        },
      },
    });

    const clients = links.map((link) => ({
      ...link.client,
      linkedAt: link.createdAt,
      _count: {
        trips:
          (link.client._count?.individualTrips || 0) +
          (link.client._count?.groupMemberships || 0),
        individualTrips: link.client._count?.individualTrips || 0,
        groupMemberships: link.client._count?.groupMemberships || 0,
      },
    }));

    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error('Erro em GET /api/admin/clients:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar carteira de clientes.' },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------
// POST /api/admin/clients
// Cria um novo cliente (USER) com inviteCode UUID e vincula
// automaticamente ao MANAGER logado em ClientManager
// --------------------------------------------------------
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedManager();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null;
    const city = typeof body.city === 'string' && body.city.trim() ? body.city.trim() : null;
    const state = typeof body.state === 'string' && body.state.trim() ? body.state.trim().toUpperCase() : null;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail do cliente são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário cadastrado com este e-mail.' },
        { status: 409 }
      );
    }

    // Se o agente não informar senha inicial, gera uma senha provisória segura
    const initialPassword =
      password.length >= 6
        ? password
        : `Modus#${Math.random().toString(36).slice(-8)}`;

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const createdClient = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          phone,
          city,
          state,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          inviteCode: true,
          phone: true,
          city: true,
          state: true,
          status: true,
          createdAt: true,
        },
      });

      await tx.clientManager.create({
        data: {
          managerId: auth.manager.id,
          clientId: createdClient.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.manager.id,
          action: 'MANAGER_CREATED_CLIENT',
          details: {
            clientId: createdClient.id,
            clientEmail: createdClient.email,
            inviteCode: createdClient.inviteCode,
          },
        },
      });

      return createdClient;
    });

    return NextResponse.json(
      {
        message: 'Cliente cadastrado e vinculado à sua carteira com sucesso!',
        client: result,
        // Retorna a senha inicial apenas se tiver sido gerada automaticamente,
        // para que o agente possa repassar ao cliente caso deseje
        generatedPassword: password.length >= 6 ? undefined : initialPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro em POST /api/admin/clients:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar cliente.' },
      { status: 500 }
    );
  }
}