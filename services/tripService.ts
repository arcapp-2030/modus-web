import { api } from './api'; // Aponta para o seu services/api.ts existente

export interface ItineraryItem {
  id?: string;
  title: string;
  subtitle?: string;
  location?: string;
  date?: string;
  time?: string;
  voucher_file?: string | null;
}

export interface Trip {
  id: string;
  title: string;
  itinerary: ItineraryItem[];
}

export async function fetchClientTrips(): Promise<Trip[]> {
  try {
    // Exemplo estruturado ou chamada via sua instância do axios
    // const response = await api.get('/api/trips');
    // return response.data;

    return [
      {
        id: '1',
        title: 'Tóquio, Japão',
        itinerary: [
          {
            id: 'item-1',
            title: 'Voo JL048 para Haneda',
            subtitle: 'Embarque no terminal 3',
            location: 'Aeroporto Internacional de Guarulhos',
            date: '20 de Out, 2026',
            time: '23:15',
            voucher_file: null,
          },
        ],
      },
    ];
  } catch (error) {
    console.error('Erro ao buscar viagens:', error);
    return [];
  }
}