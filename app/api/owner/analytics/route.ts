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

    const [managers, clientsCount, trips, groupsCount] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'MANAGER' },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              managedClients: true,
              managedTrips: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.trip.findMany({
        select: {
          id: true,
          destination: true,
          groupId: true,
          startDate: true,
          createdAt: true,
        },
      }),
      prisma.travelGroup.count(),
    ]);

    const clientsByManager = managers.map((m) => ({
      name: m.name,
      clients: m._count.managedClients,
      trips: m._count.managedTrips,
    }));

    const individualTrips = trips.filter((t) => !t.groupId).length;
    const groupTrips = trips.filter((t) => Boolean(t.groupId)).length;

    // Agrupa viagens por mês (YYYY-MM) com base em startDate ou createdAt
    const monthMap = new Map<string, number>();
    const destinationMap = new Map<string, number>();

    for (const trip of trips) {
      const refDate = trip.startDate || trip.createdAt;
      const d = new Date(refDate);
      if (!Number.isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
      }

      const dest = trip.destination.trim();
      if (dest) {
        destinationMap.set(dest, (destinationMap.get(dest) ?? 0) + 1);
      }
    }

    const tripsByMonth = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));

    const topDestinations = Array.from(destinationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([destination, count]) => ({ destination, count }));

    return NextResponse.json(
      {
        summary: {
          managersCount: managers.length,
          clientsCount,
          tripsCount: trips.length,
          groupsCount,
          individualTrips,
          groupTrips,
        },
        clientsByManager,
        tripsByMonth,
        topDestinations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro em GET /api/owner/analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar métricas analíticas.' },
      { status: 500 }
    );
  }
}