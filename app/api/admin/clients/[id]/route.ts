import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    // Busca o cliente pelo ID e inclui todas as suas viagens e itinerários relacionados
    const client = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        trips: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            itinerary: {
              select: {
                id: true,
                title: true,
                subtitle: true,
                type: true,
                location: true,
                date: true,
                time: true,
                voucherFile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar detalhes do cliente:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar cliente' }, { status: 500 });
  }
}