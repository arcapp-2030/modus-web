'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Menu,
  Plane,
  Search,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react';
import Sidebar from '@/components/SideBar';

interface OwnerTripItem {
  id: string;
  title: string;
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  groupId?: string | null;
  createdAt: string;
  manager?: { id: string; name: string; email: string } | null;
  user?: { id: string; name: string; email: string } | null;
  group?: {
    id: string;
    name: string;
    _count?: { members: number };
  } | null;
  _count?: { itinerary: number };
}

export default function OwnerTripsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [trips, setTrips] = useState<OwnerTripItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INDIVIDUAL' | 'GROUP'>('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      try {
        const res = await fetch('/api/owner/trips', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          setForbidden(true);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Erro ao carregar viagens.');
        }
        const data = await res.json();
        setTrips(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar viagens.');
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);


  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const isGroup = Boolean(t.groupId || t.group);
      if (filterType === 'GROUP' && !isGroup) return false;
      if (filterType === 'INDIVIDUAL' && isGroup) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        (t.manager?.name && t.manager.name.toLowerCase().includes(q)) ||
        (t.user?.name && t.user.name.toLowerCase().includes(q)) ||
        (t.group?.name && t.group.name.toLowerCase().includes(q))
      );
    });
  }, [trips, search, filterType]);

  const formatDate = (value?: string | null) => {
    if (!value) return 'A definir';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'A definir';
    return d.toLocaleDateString('pt-BR');
  };

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
              <Plane size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Todas as Viagens da Empresa</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Visão completa de roteiros individuais e em grupo com manager responsável
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
            Carregando viagens da empresa...
          </div>
        ) : forbidden ? (
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <ShieldAlert size={36} className="mx-auto text-red-500" />
            <h2 className="text-base font-bold">Acesso Restrito</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apenas usuários <strong>ADMIN</strong> podem visualizar todas as viagens da empresa.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar por título, destino, cliente, grupo ou manager..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {(
                  [
                    { key: 'ALL', label: 'Todas' },
                    { key: 'INDIVIDUAL', label: 'Individuais' },
                    { key: 'GROUP', label: 'Em Grupo' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterType(tab.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      filterType === tab.key
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trip.group
                            ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {trip.group ? <Users size={11} /> : <User size={11} />}
                        {trip.group
                          ? `Grupo (${trip.group._count?.members ?? 0})`
                          : 'Individual'}
                      </span>
                      <h3 className="text-base font-bold mt-1.5">{trip.title}</h3>
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {trip._count?.itinerary ?? 0} etapas
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-sky-500" />
                      <span>{trip.destination}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      {trip.group
                        ? `Grupo: ${trip.group.name}`
                        : `Cliente: ${trip.user?.name || 'Não informado'}`}
                    </span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      Manager: {trip.manager?.name || '—'}
                    </span>
                  </div>
                </div>
              ))}

              {filteredTrips.length === 0 && (
                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-500">
                  Nenhuma viagem encontrada com os filtros atuais.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}