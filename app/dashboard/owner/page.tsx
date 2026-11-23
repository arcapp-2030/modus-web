'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  Briefcase,
  Building2,
  CheckCircle2,
  KeyRound,
  Menu,
  ShieldAlert,
  UserPlus,
  Users,
  MapPin,
} from 'lucide-react';
import Sidebar from '@/components/SideBar';

interface ManagerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  status: string;
  createdAt: string;
  _count: {
    managedClients: number;
    managedTrips: number;
    managedGroups: number;
  };
}

interface AuditLogEntry {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AgencyStats {
  managersCount: number;
  clientsCount: number;
  tripsCount: number;
  groupsCount: number;
}

export default function OwnerDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [stats, setStats] = useState<AgencyStats>({
    managersCount: 0,
    clientsCount: 0,
    tripsCount: 0,
    groupsCount: 0,
  });
  const [managers, setManagers] = useState<ManagerSummary[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);

  // Formulário de cadastro / promoção de MANAGER
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');

  const loadAgencyData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/owner/managers', {
        cache: 'no-store',
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao carregar dados da agência.');
      }

      const data = await res.json();
      setStats(
        data.stats || {
          managersCount: 0,
          clientsCount: 0,
          tripsCount: 0,
          groupsCount: 0,
        }
      );
      setManagers(Array.isArray(data.managers) ? data.managers : []);
      setRecentLogs(Array.isArray(data.recentLogs) ? data.recentLogs : []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Falha ao carregar painel do proprietário.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgencyData();
  }, [loadAgencyData]);

  const handleCreateOrPromoteManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    setGeneratedPassword('');
    setError('');

    try {
      const res = await fetch('/api/owner/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          phone: phone || undefined,
          city: city || undefined,
          state: stateUf || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar agente.');
      }

      setFeedback(data.message || 'Agente salvo com sucesso!');
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      }

      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setCity('');
      setStateUf('');

      await loadAgencyData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao processar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors';

  const labelClass =
    'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="owner"
      />

      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#070c18]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-sky-600 dark:text-sky-400" />
              <h1 className="text-base sm:text-lg font-bold">
                Gestão da Agência
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Visão executiva do proprietário, equipe de agentes (`MANAGER`) e auditoria
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
        >
          <Briefcase size={15} />
          <span>Ir para Painel do Agente</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500 dark:text-slate-400">
            Carregando indicadores da agência...
          </div>
        ) : forbidden ? (
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <ShieldAlert size={36} className="mx-auto text-red-500" />
            <h2 className="text-base font-bold">Acesso Restrito ao Proprietário</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta área é exclusiva para usuários com perfil <strong className="text-slate-800 dark:text-slate-200">ADMIN</strong>.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition-colors"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Métricas Globais */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Agentes (MANAGER)
                </span>
                <p className="text-2xl font-extrabold mt-1 text-sky-600 dark:text-sky-400">
                  {stats.managersCount}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Clientes (USER)
                </span>
                <p className="text-2xl font-extrabold mt-1">
                  {stats.clientsCount}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Viagens Ativas
                </span>
                <p className="text-2xl font-extrabold mt-1">
                  {stats.tripsCount}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Grupos de Viagem
                </span>
                <p className="text-2xl font-extrabold mt-1">
                  {stats.groupsCount}
                </p>
              </div>
            </section>

            {/* Feedback / Erros */}
            {feedback && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={16} />
                  <span>{feedback}</span>
                </div>
                {generatedPassword && (
                  <p className="flex items-center gap-1.5 pl-6 text-[11px]">
                    <KeyRound size={13} />
                    <span>Senha provisória gerada:</span>
                    <code className="px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono font-bold">
                      {generatedPassword}
                    </code>
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulário: Cadastrar ou Promover Agente */}
              <section className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <UserPlus size={18} className="text-sky-600 dark:text-sky-400" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Novo ou Promover Agente
                  </h2>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  Se o e-mail já existir na base, o usuário será promovido a <strong className="text-slate-800 dark:text-slate-200">MANAGER</strong>. Caso contrário, uma nova conta de agente será criada.
                </p>

                <form onSubmit={handleCreateOrPromoteManager} className="space-y-4">
                  <div>
                    <label className={labelClass}>Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Ex: Marina Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="agente@agencia.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Senha Inicial (opcional para novos agentes)
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    <div>
                      <label className={labelClass}>Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="(44) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className={labelClass}>Cidade</label>
                        <input
                          type="text"
                          placeholder="Maringá"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>UF</label>
                        <input
                          type="text"
                          maxLength={2}
                          placeholder="PR"
                          value={stateUf}
                          onChange={(e) => setStateUf(e.target.value.toUpperCase())}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Salvando...' : 'Salvar Agente (MANAGER)'}
                  </button>
                </form>
              </section>

              {/* Coluna Direita: Equipe de Agentes + Auditoria */}
              <div className="lg:col-span-2 space-y-6">
                {/* Lista de Agentes */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-sky-600 dark:text-sky-400" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        Agentes de Viagem Ativos ({managers.length})
                      </h2>
                    </div>
                  </div>

                  {managers.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                      Nenhum agente (`MANAGER`) cadastrado ainda.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {managers.map((mgr) => (
                        <div
                          key={mgr.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">
                              {mgr.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {mgr.email}
                              {mgr.phone ? ` • ${mgr.phone}` : ''}
                            </p>
                            {(mgr.city || mgr.state) && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} />
                                {[mgr.city, mgr.state].filter(Boolean).join(' - ')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold">
                            <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                              {mgr._count.managedClients} clientes
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {mgr._count.managedTrips} viagens
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {mgr._count.managedGroups} grupos
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Log de Auditoria Recente */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                    <Activity size={18} className="text-sky-600 dark:text-sky-400" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      Atividade Recente da Agência (AuditLog)
                    </h2>
                  </div>

                  {recentLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                      Nenhum evento registrado até o momento.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {recentLogs.map((log) => (
                        <li
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                              {log.action}
                            </span>
                            {log.user && (
                              <span className="text-slate-600 dark:text-slate-400 ml-2">
                                por {log.user.name} ({log.user.email})
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}