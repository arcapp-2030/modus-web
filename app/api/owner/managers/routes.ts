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
}

async function getAuthenticatedAdmin() {
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

  if (currentUser.role !== 'ADMIN') {
    return {
      error: 'Acesso restrito ao proprietário da agência (ADMIN).',
      status: 403 as const,
    };
  }

  return { admin: currentUser, status: 200 as const };
}

// --------------------------------------------------------
// GET /api/owner/managers
// Visão gerencial da agência: agentes, métricas e auditoria
// --------------------------------------------------------
export async function GET() {
  try {
    const auth = await getAuthenticatedAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [managers, totalClients, totalTrips, totalGroups, recentLogs] =
      await Promise.all([
        prisma.user.findMany({
          where: { role: 'MANAGER' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                managedClients: true,
                managedTrips: true,
                managedGroups: true,
              },
            },
          },
        }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.trip.count(),
        prisma.travelGroup.count(),
        prisma.auditLog.findMany({
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true,
              },
            },
          },
        }),
      ]);

    return NextResponse.json(
      {
        stats: {
          managersCount: managers.length,
          clientsCount: totalClients,
          tripsCount: totalTrips,
          groupsCount: totalGroups,
        },
        managers,
        recentLogs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro em GET /api/owner/managers:', error);
    return NextResponse.json(
      { error: 'Erro interno ao carregar dados da agência.' },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------
// POST /api/owner/managers
// Cria novo MANAGER ou promove usuário existente para MANAGER
// --------------------------------------------------------
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const phone =
      typeof body.phone === 'string' && body.phone.trim()
        ? body.phone.trim()
        : null;
    const city =
      typeof body.city === 'string' && body.city.trim()
        ? body.city.trim()
        : null;
    const state =
      typeof body.state === 'string' && body.state.trim()
        ? body.state.trim().toUpperCase()
        : null;

    if (!email) {
      return NextResponse.json(
        { error: 'O e-mail do agente é obrigatório.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        return NextResponse.json(
          { error: 'Este usuário já possui perfil ADMIN.' },
          { status: 400 }
        );
      }

      const promoted = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'MANAGER',
            status: 'ACTIVE',
            ...(name ? { name } : {}),
            ...(phone ? { phone } : {}),
            ...(city ? { city } : {}),
            ...(state ? { state } : {}),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            city: true,
            state: true,
            status: true,
            createdAt: true,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: auth.admin.id,
            action: 'ADMIN_PROMOTED_MANAGER',
            details: {
              targetUserId: updatedUser.id,
              targetEmail: updatedUser.email,
            },
          },
        });

        return updatedUser;
      });

      return NextResponse.json(
        {
          message: 'Usuário promovido a Agente (MANAGER) com sucesso!',
          manager: promoted,
        },
        { status: 200 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Informe o nome completo para cadastrar um novo agente.' },
        { status: 400 }
      );
    }

    const initialPassword =
      password.length >= 6
        ? password
        : `Agent#${Math.random().toString(36).slice(-8)}`;

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const createdManager = await prisma.$transaction(async (tx) => {
      const manager = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'MANAGER',
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
          phone: true,
          city: true,
          state: true,
          status: true,
          createdAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.admin.id,
          action: 'ADMIN_CREATED_MANAGER',
          details: {
            managerId: manager.id,
            managerEmail: manager.email,
          },
        },
      });

      return manager;
    });

    return NextResponse.json(
      {
        message: 'Novo agente (MANAGER) cadastrado com sucesso!',
        manager: createdManager,
        generatedPassword:
          password.length >= 6 ? undefined : initialPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro em POST /api/owner/managers:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar ou promover agente.' },
      { status: 500 }
    );
  }
}