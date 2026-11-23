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

async function requireAdmin() {
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

  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true },
  });

  if (!admin || admin.status !== 'ACTIVE') {
    return { error: 'Usuário inativo ou inexistente.', status: 401 as const };
  }

  if (admin.role !== 'ADMIN') {
    return { error: 'Acesso restrito ao ADMIN.', status: 403 as const };
  }

  return { admin, status: 200 as const };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const trips = await prisma.trip.findMany({
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { members: true },
            },
          },
        },
        _count: {
          select: { itinerary: true },
        },
      },
    });

    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    console.error('Erro em GET /api/owner/trips:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar viagens da empresa.' },
      { status: 500 }
    );
  }
}