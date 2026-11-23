'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  Menu,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Sidebar from '@/components/SideBar';

interface ManagerTag {
  id: string;
  name: string;
  email: string;
}

interface OwnerClientRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  inviteCode: string;
  status: string;
  createdAt: string;
  managers: ManagerTag[];
  individualTripsCount: number;
  groupsCount: number;
}

export default function OwnerClientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [clients, setClients] = useState<OwnerClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClients() {
      setLoading(true);
      try {
        const res = await fetch('/api/owner/clients', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          setForbidden(true);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Erro ao carregar clientes.');
        }
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar clientes.');
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const managerMatch = c.managers.some((m) =>
        m.name.toLowerCase().includes(q)
      );
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.inviteCode.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        managerMatch
      );
    });
  }, [clients, search]);

  const handleCopyInvite = async (client: OwnerClientRow) => {
    try {
      await navigator.clipboard.writeText(client.inviteCode);
      setCopiedId(client.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignora se clipboard não estiver disponível
    }
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
              <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Todos os Clientes da Agência</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Base completa de clientes (USER), códigos UUID e managers vinculados
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
            Carregando clientes da agência...
          </div>
        ) : forbidden ? (
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <ShieldAlert size={36} className="mx-auto text-red-500" />
            <h2 className="text-base font-bold">Acesso Restrito</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apenas usuários <strong>ADMIN</strong> podem visualizar todos os clientes da agência.
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
                  placeholder="Buscar por cliente, e-mail, UUID ou manager..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {filteredClients.length} de {clients.length} clientes
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">Cliente</th>
                      <th className="py-3.5 px-4">Managers</th>
                      <th className="py-3.5 px-4">Viagens / Grupos</th>
                      <th className="py-3.5 px-4">InviteCode (UUID)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-950/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-sm">{client.name}</p>
                          <p className="text-slate-500 dark:text-slate-400">
                            {client.email}
                            {client.phone ? ` • ${client.phone}` : ''}
                          </p>
                          {(client.city || client.state) && (
                            <p className="text-[11px] text-slate-400">
                              {[client.city, client.state].filter(Boolean).join(' - ')}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {client.managers.length === 0 ? (
                            <span className="text-[11px] text-slate-400">
                              Sem manager vinculado
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {client.managers.map((mgr) => (
                                <span
                                  key={mgr.id}
                                  className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[11px] font-semibold"
                                >
                                  {mgr.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold">
                            {client.individualTripsCount} indiv.
                          </span>
                          <span className="text-slate-400 mx-1.5">•</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {client.groupsCount} grupos
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleCopyInvite(client)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[11px] transition-colors"
                            title="Copiar inviteCode"
                          >
                            <span className="truncate max-w-[150px]">
                              {client.inviteCode}
                            </span>
                            {copiedId === client.id ? (
                              <Check size={13} className="text-emerald-500" />
                            ) : (
                              <Copy size={13} className="text-slate-400" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredClients.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-10 text-center text-slate-500 dark:text-slate-400"
                        >
                          Nenhum cliente encontrado para o filtro informado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}