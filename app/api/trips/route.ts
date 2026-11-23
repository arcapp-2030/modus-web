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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { userId },
          {
            group: {
              members: {
                some: { userId },
              },
            },
          },
        ],
      },
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { members: true },
            },
          },
        },
        itinerary: {
          orderBy: [{ date: 'asc' }, { time: 'asc' }, { createdAt: 'asc' }],
          include: {
            personalVouchers: {
              where: { userId },
              select: {
                id: true,
                fileUrl: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    // Normaliza o itinerário para que o frontend receba o voucher individual
    // (quando existir) ou o voucher coletivo do grupo
    const formattedTrips = trips.map((trip) => ({
      ...trip,
      isGroupTrip: Boolean(trip.groupId),
      itinerary: trip.itinerary.map((item) => {
        const personal = item.personalVouchers[0];
        return {
          id: item.id,
          tripId: item.tripId,
          title: item.title,
          subtitle: personal?.notes
            ? `${item.subtitle ? `${item.subtitle} • ` : ''}${personal.notes}`
            : item.subtitle,
          type: item.type,
          location: item.location,
          date: item.date,
          time: item.time,
          voucherFile: personal?.fileUrl || item.voucherFile || null,
          hasPersonalVoucher: Boolean(personal),
        };
      }),
    }));

    return NextResponse.json(formattedTrips, { status: 200 });
  } catch (error) {
    console.error('Erro em GET /api/trips:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar viagens do usuário.' },
      { status: 500 }
    );
  }
}