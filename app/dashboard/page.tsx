'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Compass,
  MapPin,
  Menu,
  Plane,
  Sparkles,
} from 'lucide-react';
import Sidebar from '@/components/SideBar'; // Ajuste o caminho se necessário
import { API_BASE_URL } from '@/config/api'; // Ajuste o caminho se necessário
import { useSync } from '@/hooks/useSync'; // Ajuste o caminho se necessário
import {
  fetchClientTrips,
  ItineraryItem,
  Trip,
} from '@/services/tripService'; // Ajuste o caminho se necessário
import { useAuth } from '@/contexts/AuthContext'; // Ajuste o caminho se necessário

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [nextEvent, setNextEvent] = useState<ItineraryItem | null>(null);

  const { isSyncing, triggerSync } = useSync('trip-tokyo-2026');

  const loadData = useCallback(async () => {
    if (!session) return;

    try {
      const trips = await fetchClientTrips();
      if (trips.length > 0) {
        const trip = trips[0];
        setCurrentTrip(trip);
        if (trip.itinerary && trip.itinerary.length > 0) {
          setNextEvent(trip.itinerary[0]);
        } else {
          setNextEvent(null);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error.message);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openVoucher = (fileUrl?: string | null) => {
    if (!fileUrl) {
      alert('Nenhum voucher anexado para este evento.');
      return;
    }
    const cleanBase = API_BASE_URL.replace('/api', '');
    const fullUrl = `${cleanBase}/${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  const handleRefresh = async () => {
    await triggerSync();
    await loadData();
  };

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-white">
      <div className="flex-1 max-w-2xl mx-auto px-5 pt-3 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-[rgba(15,23,42,0.8)] border border-[rgba(51,65,85,0.6)] flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95"
          >
            <Menu size={20} className="text-sky-400" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-extrabold text-sky-400 tracking-[2px] uppercase block">
              MODUS
            </span>
            <h1 className="text-lg font-extrabold text-white tracking-tight">
              {currentTrip?.title || 'Sua Viagem'}
            </h1>
          </div>

          <button
            onClick={() => router.push('/dashboard/busca')} // Ajuste conforme a rota web
            className="w-10 h-10 rounded-full bg-[rgba(15,23,42,0.8)] border border-[rgba(51,65,85,0.6)] flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95"
          >
            <Compass size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Botão de Atualizar / Sincronizar (Substitui o PullToRefresh nativo) */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {isSyncing ? 'Sincronizando...' : '🔄 Atualizar Dados'}
          </button>
        </div>

        {/* TripHeroCard Dinâmico (Próximo Evento) */}
        {nextEvent ? (
          <div className="bg-[rgba(15,23,42,0.9)] rounded-2xl p-5 border-[1.5px] border-[rgba(56,189,248,0.4)] mb-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-400" />
                <span className="text-[10px] font-extrabold text-sky-400 tracking-[1.5px] uppercase">
                  PRÓXIMO EVENTO
                </span>
              </div>

              <span className="text-[11px] font-bold text-emerald-400 bg-[rgba(34,197,94,0.12)] px-2 py-0.5 rounded-md">
                Confirmado
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-1">
              {nextEvent.title}
            </h2>
            {nextEvent.subtitle && (
              <p className="text-[13px] font-semibold text-slate-400 mb-4">
                {nextEvent.subtitle}
              </p>
            )}

            {/* Detalhes de Local, Data e Hora */}
            <div className="bg-[#070c18] rounded-xl p-3 flex flex-col gap-2 mb-4">
              {nextEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-sky-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">
                    {nextEvent.location}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">
                    {nextEvent.date}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">
                    {nextEvent.time}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openVoucher(nextEvent.voucher_file)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all border border-[rgba(56,189,248,0.4)] shadow-lg shadow-blue-600/20 active:scale-[0.99]"
            >
              Ver Detalhes & Voucher
            </button>
          </div>
        ) : (
          <div className="p-6 bg-[rgba(15,23,42,0.6)] rounded-2xl flex flex-col items-center justify-center mb-6 border border-slate-800">
            <Plane size={32} className="text-slate-500" />
            <p className="text-slate-400 mt-2 text-xs">
              Nenhuma atividade agendada.
            </p>
          </div>
        )}

        {/* Lista Completa do Itinerário da Viagem */}
        {currentTrip?.itinerary && currentTrip.itinerary.length > 0 && (
          <div className="mt-2">
            <h3 className="text-[11px] font-extrabold text-sky-400 mb-4 tracking-[1.5px] uppercase">
              Itinerário Completo da Viagem
            </h3>

            <div className="space-y-3">
              {currentTrip.itinerary.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-[rgba(15,23,42,0.7)] rounded-2xl p-4 border border-[rgba(51,65,85,0.4)]"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="text-[15px] font-bold text-white flex-1 mr-2">
                      {item.title}
                    </h4>
                    {item.time && (
                      <span className="text-xs text-sky-400 font-semibold">
                        {item.time}
                      </span>
                    )}
                  </div>

                  {item.subtitle && (
                    <p className="text-xs text-slate-400 mb-2.5">
                      {item.subtitle}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1 text-xs">
                    {item.location && (
                      <div className="flex items-center gap-1.5 flex-1 mr-2 truncate">
                        <MapPin size={14} className="text-slate-500 shrink-0" />
                        <span className="text-slate-300 truncate">
                          {item.location}
                        </span>
                      </div>
                    )}

                    {item.date && (
                      <span className="text-slate-400 shrink-0">
                        {item.date}
                      </span>
                    )}
                  </div>

                  {item.voucher_file && (
                    <button
                      onClick={() => openVoucher(item.voucher_file)}
                      className="w-full mt-3 py-2 bg-[rgba(37,99,235,0.15)] hover:bg-[rgba(37,99,235,0.25)] rounded-lg text-center border border-[rgba(37,99,235,0.3)] transition-all"
                    >
                      <span className="text-xs font-semibold text-blue-400">
                        Ver Voucher / Anexo
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Componente Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onOpen={() => setIsSidebarOpen(true)}
        onClose={() => setIsSidebarOpen(false)}
        activeRoute="index"
      />
    </div>
  );
}