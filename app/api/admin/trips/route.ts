import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';

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
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userSession: any = verifyAdmin(request);
    
    // Se quiser testar sem travar na verificação de admin por enquanto, 
    // comente temporariamente a linha abaixo:
    if (!userSession) {
      return NextResponse.json({ error: 'Não autorizado ou token inválido' }, { status: 401 });
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
  } catch (error: any) {
    console.error('ERRO DETALHADO AO SALVAR VIAGEM:', error);
    // Retorna a mensagem real do erro do Prisma para facilitar o diagnóstico
    return NextResponse.json(
      { error: `Erro interno: ${error.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}