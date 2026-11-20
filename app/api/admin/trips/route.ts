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

async function getManagerFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const managerId = decoded.userId || decoded.id;
    if (!managerId) return null;

    const user = await prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE' || user.role !== 'MANAGER') {
      return null;
    }

    return user.id;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const managerId = await getManagerFromCookie();
    if (!managerId) {
      return NextResponse.json(
        { error: 'Acesso restrito a usuários MANAGER autenticados.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, destination, userId, groupId, startDate, endDate, itinerary } = body;

    if (!title || !destination) {
      return NextResponse.json(
        { error: 'Título e destino são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!userId && !groupId) {
      return NextResponse.json(
        { error: 'Informe um cliente (userId) ou grupo (groupId) para a viagem.' },
        { status: 400 }
      );
    }

    // Se for viagem individual, garante que o cliente pertence à carteira do MANAGER
    if (userId) {
      const link = await prisma.clientManager.findUnique({
        where: {
          managerId_clientId: {
            managerId,
            clientId: userId,
          },
        },
      });

      if (!link) {
        return NextResponse.json(
          { error: 'Este cliente não está vinculado à sua carteira.' },
          { status: 403 }
        );
      }
    }

    const itineraryItems = Array.isArray(itinerary)
      ? itinerary.map((item: Record<string, unknown>) => ({
          title: String(item.title || ''),
          subtitle: item.subtitle ? String(item.subtitle) : null,
          type: String(item.type || 'flight'),
          location: item.location ? String(item.location) : null,
          date: item.date ? String(item.date) : null,
          time: item.time ? String(item.time) : null,
          voucherFile: item.voucherFile ? String(item.voucherFile) : null,
        }))
      : [];

    const createdTrip = await prisma.trip.create({
      data: {
        title: String(title).trim(),
        destination: String(destination).trim(),
        startDate: startDate ? new Date(String(startDate)) : null,
        endDate: endDate ? new Date(String(endDate)) : null,
        managerId,
        userId: userId ? String(userId) : null,
        groupId: groupId ? String(groupId) : null,
        itinerary: {
          create: itineraryItems,
        },
      },
      include: {
        itinerary: true,
      },
    });

    return NextResponse.json(createdTrip, { status: 201 });
  } catch (error) {
    console.error('Erro em POST /api/admin/trips:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar viagem.' },
      { status: 500 }
    );
  }
}