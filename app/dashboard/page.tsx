'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Menu,
  Plane,
  RefreshCw,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import Sidebar from '@/components/SideBar';
import { authStorage } from '@/lib/auth-storage';

export type AppRole = 'USER' | 'MANAGER' | 'ADMIN';

const VALID_ROLES: AppRole[] = ['USER', 'MANAGER', 'ADMIN'];

function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  return VALID_ROLES.includes(upper as AppRole) ? (upper as AppRole) : null;
}

interface AppBrandHeaderProps {
  appName?: string;
  role: AppRole;
  tripTitle?: string;
}

export function AppBrandHeader({
  appName = 'MODUS',
  role,
  tripTitle,
}: AppBrandHeaderProps) {
  const roleBadgeStyle: Record<AppRole, string> = {
    ADMIN:
      'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    MANAGER:
      'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    USER:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 tracking-[2px] uppercase leading-none">
        {appName}
      </span>
      <span
        className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold tracking-wider uppercase ${roleBadgeStyle[role]}`}
      >
        {role}
      </span>
      {tripTitle && (
        <h1 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tripTitle}
        </h1>
      )}
    </div>
  );
}

export function AdminDashboardCards() {
  const cards = [
    {
      title: 'Criar & Gerenciar Managers',
      description:
        'Cadastre novos agentes (MANAGER), promova contas existentes e acompanhe a carga de cada gestor.',
      href: '/dashboard/owner',
      icon: UserPlus,
      accent: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Todos os Clientes da Agência',
      description:
        'Consulte a base completa de clientes (USER), seus códigos UUID e quais managers atendem cada um.',
      href: '/dashboard/owner/clients',
      icon: Users,
      accent:
        'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Todas as Viagens da Empresa',
      description:
        'Visualize todas as viagens individuais e em grupo cadastradas, destinos, datas e responsáveis.',
      href: '/dashboard/owner/trips',
      icon: Plane,
      accent:
        'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Gráficos & Números da Agência',
      description:
        'Abra o painel analítico com gráficos de carteira por manager, viagens por período e destinos.',
      href: '/dashboard/owner/analytics',
      icon: BarChart3,
      accent:
        'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <section className="space-y-3 mb-7">
      <div className="flex items-center gap-2">
        <Briefcase size={16} className="text-amber-600 dark:text-amber-400" />
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Painel Executivo do Proprietário (ADMIN)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.accent}`}
                >
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Abrir seção →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ManagerQuickCard() {
  return (
    <section className="mb-6 bg-white dark:bg-slate-900 border border-sky-500/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Operação do Agente (MANAGER)
        </span>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Gerenciar Carteira de Clientes, Grupos e Viagens
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cadastre viajantes, monte grupos com inviteCode e publique novos roteiros.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <Link
          href="/dashboard/admin"
          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
        >
          Painel do Agente →
        </Link>
        <Link
          href="/dashboard/admin/groups"
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
        >
          Grupos
        </Link>
      </div>
    </section>
  );
}

export interface ItineraryItem {
  id?: string;
  title: string;
  subtitle?: string;
  location?: string;
  date?: string;
  time?: string;
  voucherFile?: string | null;
  voucher_file?: string | null;
}

export interface Trip {
  id: string;
  title: string;
  destination?: string;
  itinerary: ItineraryItem[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<AppRole>('USER');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [nextEvent, setNextEvent] = useState<ItineraryItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const cachedRole = normalizeRole(localStorage.getItem('modus_user_role'));
      if (cachedRole) setUserRole(cachedRole);

      const token = authStorage.getToken?.();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const [profileRes, tripsRes] = await Promise.all([
        fetch('/api/user/profile', {
          cache: 'no-store',
          credentials: 'include',
          headers,
        }),
        fetch('/api/trips', {
          cache: 'no-store',
          credentials: 'include',
          headers,
        }).catch(() => null),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        const apiRole = normalizeRole(profile?.role);
        if (apiRole) {
          setUserRole(apiRole);
          localStorage.setItem('modus_user_role', apiRole);
        }
        if (typeof profile?.name === 'string' && profile.name.trim()) {
          localStorage.setItem('modus_user_name', profile.name);
        }
      }

      if (tripsRes && tripsRes.ok) {
        const tripsData = await tripsRes.json();
        const trips: Trip[] = Array.isArray(tripsData) ? tripsData : [];
        if (trips.length > 0) {
          setCurrentTrip(trips[0]);
          setNextEvent(trips[0].itinerary?.[0] || null);
        } else {
          setCurrentTrip(null);
          setNextEvent(null);
        }
      }
    } catch (error: unknown) {
      console.error(
        'Erro ao carregar dados:',
        error instanceof Error ? error.message : error
      );
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openVoucher = (fileUrl?: string | null) => {
    if (!fileUrl) {
      alert('Nenhum voucher anexado para este evento.');
      return;
    }
    window.open(fileUrl, '_blank');
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await loadData();
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080d1a] dark:text-white transition-colors">
      <div className="flex-1 max-w-4xl mx-auto px-5 pt-4 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 shadow-sm dark:shadow-none"
          >
            <Menu size={20} className="text-sky-600 dark:text-sky-400" />
          </button>

          <AppBrandHeader
            appName="MODUS"
            role={userRole}
            tripTitle={currentTrip?.title || 'Sua Viagem'}
          />

          <button
            type="button"
            onClick={() => router.push('/dashboard/settings')}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 shadow-sm dark:shadow-none"
          >
            <Compass size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Botão de Atualizar / Sincronizar */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
        </div>

        {/* Cards Exclusivos do ADMIN */}
        {userRole === 'ADMIN' && <AdminDashboardCards />}

        {/* Atalho Operacional para MANAGER e ADMIN */}
        {(userRole === 'MANAGER' || userRole === 'ADMIN') && <ManagerQuickCard />}

        {/* TripHeroCard Dinâmico (Próximo Evento) */}
        {nextEvent ? (
          <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border-[1.5px] border-sky-500/30 dark:border-sky-400/40 mb-6 shadow-xl shadow-slate-200/60 dark:shadow-black/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-600 dark:text-sky-400" />
                <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 tracking-[1.5px] uppercase">
                  PRÓXIMO EVENTO
                </span>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Confirmado
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {nextEvent.title}
            </h2>
            {nextEvent.subtitle && (
              <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-4">
                {nextEvent.subtitle}
              </p>
            )}

            <div className="bg-slate-100 dark:bg-[#070c18] rounded-xl p-3 flex flex-col gap-2 mb-4 border border-slate-200/70 dark:border-transparent transition-colors">
              {nextEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {nextEvent.location}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {nextEvent.date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {nextEvent.date}
                    </span>
                  </div>
                )}

                {nextEvent.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {nextEvent.time}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                openVoucher(nextEvent.voucherFile ?? nextEvent.voucher_file)
              }
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all border border-sky-400/40 shadow-lg shadow-blue-600/20 active:scale-[0.99]"
            >
              Ver Detalhes & Voucher
            </button>
          </div>
        ) : (
          <div className="p-6 bg-white dark:bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
            <Plane size={32} className="text-slate-400 dark:text-slate-500" />
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs">
              Nenhuma atividade agendada.
            </p>
          </div>
        )}

        {/* Lista Completa do Itinerário */}
        {currentTrip?.itinerary && currentTrip.itinerary.length > 0 && (
          <div className="mt-2">
            <h3 className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 mb-4 tracking-[1.5px] uppercase">
              Itinerário Completo da Viagem
            </h3>

            <div className="space-y-3">
              {currentTrip.itinerary.map((item, index) => {
                const file = item.voucherFile ?? item.voucher_file;
                return (
                  <div
                    key={item.id || index}
                    className="bg-white dark:bg-slate-900/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/40 shadow-sm dark:shadow-none transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white flex-1 mr-2">
                        {item.title}
                      </h4>
                      {item.time && (
                        <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                          {item.time}
                        </span>
                      )}
                    </div>

                    {item.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                        {item.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1 text-xs">
                      {item.location && (
                        <div className="flex items-center gap-1.5 flex-1 mr-2 truncate">
                          <MapPin size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300 truncate">
                            {item.location}
                          </span>
                        </div>
                      )}

                      {item.date && (
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">
                          {item.date}
                        </span>
                      )}
                    </div>

                    {file && (
                      <button
                        type="button"
                        onClick={() => openVoucher(file)}
                        className="w-full mt-3 py-2 bg-blue-600/10 dark:bg-blue-600/15 hover:bg-blue-600/20 dark:hover:bg-blue-600/25 rounded-lg text-center border border-blue-500/30 transition-all"
                      >
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Ver Voucher / Anexo
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeRoute="index"
      />
    </div>
  );
}