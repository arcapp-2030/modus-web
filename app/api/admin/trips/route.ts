import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';

// Helper para validar autenticação e permissão de agente/admin
function verifyAdmin(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );
    const token = cookies['modus_auth_token'];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        itinerary: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar viagens' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userSession: any = verifyAdmin(request);
    if (!userSession) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, destination, userId, itinerary } = body;

    if (!title || !destination || !userId) {
      return NextResponse.json(
        { error: 'Título, destino e cliente são obrigatórios.' },
        { status: 400 }
      );
    }

    const newTrip = await prisma.trip.create({
      data: {
        title,
        destination,
        userId,
        itinerary: {
          create: itinerary?.map((item: any) => ({
            title: item.title,
            subtitle: item.subtitle,
            type: item.type || 'tour',
            location: item.location,
            date: item.date,
            time: item.time,
            voucherFile: item.voucherFile || null,
          })) || [],
        },
      },
      include: { itinerary: true },
    });

    return NextResponse.json(
      { message: 'Viagem e itinerário cadastrados com sucesso!', trip: newTrip },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao cadastrar viagem:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar viagem' }, { status: 500 });
  }
}