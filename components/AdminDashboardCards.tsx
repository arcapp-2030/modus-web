'use client';

import Link from 'next/link';
import {
  BarChart3,
  Briefcase,
  Plane,
  UserPlus,
  Users,
} from 'lucide-react';

export type AppRole = 'USER' | 'MANAGER' | 'ADMIN';

interface AppBrandHeaderProps {
  appName?: string;
  role: AppRole;
}

export function AppBrandHeader({ appName = 'MODUS', role }: AppBrandHeaderProps) {
  const roleBadgeStyle: Record<AppRole, string> = {
    ADMIN:
      'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    MANAGER:
      'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    USER:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="flex flex-col items-start">
      <span className="text-base sm:text-lg font-black tracking-[1.5px] text-slate-900 dark:text-white uppercase leading-none">
        {appName}
      </span>
      <span
        className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold tracking-wider uppercase ${roleBadgeStyle[role]}`}
      >
        {role}
      </span>
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
      accent:
        'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase size={16} className="text-amber-600 dark:text-amber-400" />
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Painel Executivo do Proprietário (ADMIN)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
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