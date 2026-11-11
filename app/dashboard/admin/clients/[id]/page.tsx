'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Plane, MapPin } from 'lucide-react';

function ClientDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = use(params);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientDetails() {
      try {
        const res = await fetch(`/api/admin/clients/${clientId}`);
        if (res.ok) {
          const data = await res.json();
          setClient(data);
        }
      } catch (e) {
        console.error('Erro ao buscar detalhes do cliente:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchClientDetails();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xs text-slate-400">Carregando informações do cliente...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Perfil Resumido do Cliente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-sky-400 tracking-[2px] uppercase">
            PASSAGEIRO
          </span>
          <h1 className="text-2xl font-black mt-0.5">{client?.name || 'Cliente'}</h1>
          <p className="text-xs text-slate-400 mt-1">{client?.email}</p>
        </div>

        {/* Botão para Criar Viagem Exclusiva para ESTE Cliente */}
        <Link
          href={`/dashboard/admin/trips?clientId=${clientId}`}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-xs flex items-center gap-2"
        >
          <Plus size={16} /> Criar Nova Viagem Para Este Cliente
        </Link>
      </div>

      {/* Lista de Viagens do Cliente */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
          Viagens Cadastradas ({client?.trips?.length || 0})
        </h2>

        {!client?.trips || client.trips.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
            <Plane size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Este cliente ainda não tem nenhuma viagem planejada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {client.trips.map((trip: any) => (
             <Link
    key={trip.id}
    href={`/dashboard/admin/trips/${trip.id}/edit`}
    className="block bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-5 transition-all group"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">{trip.title}</h3>
      <span className="text-[10px] font-extrabold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
        {trip.itinerary?.length || 0} Eventos
      </span>
    </div>
    <div className="flex items-center gap-4 text-xs text-slate-400">
      <span className="flex items-center gap-1.5">
        <MapPin size={14} className="text-sky-400" /> {trip.destination}
      </span>
    </div>
  </Link> 
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-[#080d1a] text-white p-6 md:p-10 max-w-4xl mx-auto">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Voltar ao Painel
      </Link>

      <Suspense fallback={<div className="text-xs text-slate-400 py-20 text-center">Carregando painel...</div>}>
        <ClientDetailsContent params={params} />
      </Suspense>
    </div>
  );
}