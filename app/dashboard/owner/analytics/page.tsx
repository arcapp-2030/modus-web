'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Globe,
  Menu,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '@/components/SideBar';

interface AnalyticsPayload {
  summary: {
    managersCount: number;
    clientsCount: number;
    tripsCount: number;
    groupsCount: number;
    individualTrips: number;
    groupTrips: number;
  };
  clientsByManager: Array<{
    name: string;
    clients: number;
    trips: number;
  }>;
  tripsByMonth: Array<{
    month: string;
    count: number;
  }>;
  topDestinations: Array<{
    destination: string;
    count: number;
  }>;
}

export default function OwnerAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await fetch('/api/owner/analytics', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          setForbidden(true);
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Erro ao carregar analytics.');
        }
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar gráficos.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const maxManagerClients = Math.max(
    1,
    ...(data?.clientsByManager.map((m) => m.clients) ?? [1])
  );
  const maxMonthTrips = Math.max(
    1,
    ...(data?.tripsByMonth.map((m) => m.count) ?? [1])
  );
  const maxDestinationCount = Math.max(
    1,
    ...(data?.topDestinations.map((d) => d.count) ?? [1])
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="owner"
      />

      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#070c18]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-600 dark:text-amber-400" />
              <span>Gráficos & Números da Agência</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Indicadores de carteira por manager, evolução de viagens e destinos principais
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">
            Calculando indicadores e gráficos...
          </div>
        ) : forbidden ? (
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <ShieldAlert size={36} className="mx-auto text-red-500" />
            <h2 className="text-base font-bold">Acesso Restrito</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apenas usuários <strong>ADMIN</strong> podem acessar os números analíticos da agência.
            </p>
          </div>
        ) : error || !data ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
            {error || 'Sem dados disponíveis.'}
          </div>
        ) : (
          <>
            {/* Resumo Numérico */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total de Clientes
                </span>
                <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
                  {data.summary.clientsCount}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total de Viagens
                </span>
                <p className="text-2xl font-extrabold mt-1 text-sky-600 dark:text-sky-400">
                  {data.summary.tripsCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {data.summary.individualTrips} indiv. • {data.summary.groupTrips} grupo
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Managers Ativos
                </span>
                <p className="text-2xl font-extrabold mt-1">
                  {data.summary.managersCount}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Grupos de Viagem
                </span>
                <p className="text-2xl font-extrabold mt-1">
                  {data.summary.groupsCount}
                </p>
              </div>
            </section>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Clientes por Manager */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-sky-600 dark:text-sky-400" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Clientes por Manager
                  </h2>
                </div>

                {data.clientsByManager.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Nenhum manager cadastrado ainda.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {data.clientsByManager.map((item) => {
                      const pct = Math.round((item.clients / maxManagerClients) * 100);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold truncate">{item.name}</span>
                            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                              {item.clients} clientes ({item.trips} viagens)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all duration-300"
                              style={{ width: `${Math.max(pct, item.clients > 0 ? 8 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Gráfico 2: Viagens por Mês */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Viagens por Período (Últimos Meses)
                  </h2>
                </div>

                {data.tripsByMonth.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Nenhuma viagem registrada para compor série mensal.
                  </p>
                ) : (
                  <div className="h-52 flex items-end justify-around gap-3 pt-4 px-2 border-b border-slate-200 dark:border-slate-800">
                    {data.tripsByMonth.map((m) => {
                      const heightPct = Math.round((m.count / maxMonthTrips) * 100);
                      return (
                        <div
                          key={m.month}
                          className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
                        >
                          <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {m.count}
                          </span>
                          <div className="w-full max-w-[44px] bg-slate-100 dark:bg-slate-800 rounded-t-xl flex-1 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-indigo-500 rounded-t-xl transition-all duration-300"
                              style={{ height: `${Math.max(heightPct, 10)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pb-2">
                            {m.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Gráfico 3: Principais Destinos */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Destinos Mais Frequentes
                </h2>
              </div>

              {data.topDestinations.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Nenhum destino cadastrado até o momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.topDestinations.map((dest) => {
                    const pct = Math.round(
                      (dest.count / maxDestinationCount) * 100
                    );
                    return (
                      <div key={dest.destination} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold truncate">
                            {dest.destination}
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {dest.count} {dest.count === 1 ? 'viagem' : 'viagens'}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.max(pct, 10)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}