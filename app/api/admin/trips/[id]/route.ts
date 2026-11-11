import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Retorna os dados de uma viagem específica com seu itinerário
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { itinerary: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Viagem não encontrada' }, { status: 404 });
    }

    return NextResponse.json(trip, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar viagem' }, { status: 500 });
  }
}

// PUT: Atualiza a viagem e substitui/atualiza os itens do itinerário
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { title, destination, itinerary } = await request.json();

    if (!title || !destination) {
      return NextResponse.json({ error: 'Título e destino são obrigatórios.' }, { status: 400 });
    }

    // Atualiza os dados principais da viagem e recria o itinerário associado
    const updatedTrip = await prisma.$transaction(async (tx) => {
      // Remove os itens antigos do itinerário para sincronizar com a nova lista enviada
      await tx.itineraryItem.deleteMany({
        where: { tripId: id },
      });

      // Atualiza a viagem e insere os novos itens do itinerário
      return await tx.trip.update({
        where: { id },
        data: {
          title,
          destination,
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
    });

    return NextResponse.json({ message: 'Viagem atualizada com sucesso!', trip: updatedTrip }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao atualizar viagem:', error);
    return NextResponse.json({ error: `Erro ao atualizar: ${error.message}` }, { status: 500 });
  }
}

// DELETE: Remove a viagem completamente
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ message: 'Viagem excluída com sucesso' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao excluir viagem' }, { status: 500 });
  }
}