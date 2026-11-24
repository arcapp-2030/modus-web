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
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const staffId = decoded.userId || decoded.id;
    if (!staffId) return null;

    const user = await prisma.user.findUnique({
      where: { id: staffId },
      select: { id: true, role: true, status: true },
    });

    if (
      !user ||
      user.status !== 'ACTIVE' ||
      (user.role !== 'MANAGER' && user.role !== 'ADMIN')
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const staff = await getAuthenticatedStaff();
    if (!staff) {
      return NextResponse.json(
        { error: 'Acesso restrito a usuários MANAGER ou ADMIN autenticados.' },
        { status: 403 }
      );
    }

    const trips = await prisma.trip.findMany({
      where: staff.role === 'ADMIN' ? {} : { managerId: staff.id },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        manager: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } },
        group: {
          select: {
            id: true,
            name: true,
            _count: { select: { members: true } },
          },
        },
        itinerary: true,
      },
    });

    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    console.error('Erro em GET /api/admin/trips:', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar viagens.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const staff = await getAuthenticatedStaff();
    if (!staff) {
      return NextResponse.json(
        { error: 'Acesso restrito a usuários MANAGER ou ADMIN autenticados.' },
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

    // MANAGER só cria viagem individual para clientes da sua carteira;
    // ADMIN pode criar para qualquer cliente da agência.
    if (userId && staff.role === 'MANAGER') {
      const link = await prisma.clientManager.findUnique({
        where: {
          managerId_clientId: {
            managerId: staff.id,
            clientId: String(userId),
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

    const targetManagerId =
      staff.role === 'ADMIN' &&
      typeof body.managerId === 'string' &&
      body.managerId.trim()
        ? body.managerId.trim()
        : staff.id;

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
        managerId: targetManagerId,
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