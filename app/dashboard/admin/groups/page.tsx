'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FolderPlus,
  KeyRound,
  Menu,
  Plane,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import Sidebar from '@/components/SideBar';

interface ClientOption {
  id: string;
  name: string;
  email: string;
  inviteCode: string;
}

interface GroupMemberItem {
  id: string;
  userId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    inviteCode: string;
  };
}

interface GroupTripItem {
  id: string;
  title: string;
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface TravelGroupItem {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  members: GroupMemberItem[];
  trips: GroupTripItem[];
}

export default function AdminGroupsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<TravelGroupItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);

  // Novo grupo
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [initialInviteCode, setInitialInviteCode] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Adicionar membro em grupo existente (por groupId)
  const [inviteInputs, setInviteInputs] = useState<Record<string, string>>({});
  const [clientSelectInputs, setClientSelectInputs] = useState<Record<string, string>>({});
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [groupsRes, clientsRes] = await Promise.all([
        fetch('/api/admin/groups', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/admin/clients', { cache: 'no-store', credentials: 'include' }),
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } else {
        const err = await groupsRes.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao carregar grupos.');
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar dados de grupos.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleInitialClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingGroup(true);
    setMessage('');
    setError('');

    try {
      const inviteCodes = initialInviteCode
        .split(/[\s,;]+/)
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          memberIds: selectedClientIds,
          inviteCodes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar grupo.');
      }

      setMessage(`Grupo "${data.name}" criado com sucesso!`);
      setGroupName('');
      setGroupDescription('');
      setSelectedClientIds([]);
      setInitialInviteCode('');
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleAddMember = async (
    groupId: string,
    payload: { inviteCode?: string; userId?: string }
  ) => {
    if (!payload.inviteCode && !payload.userId) return;
    setBusyGroupId(groupId);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao adicionar participante.');
      }

      setMessage(data.message || 'Participante adicionado ao grupo!');
      setInviteInputs((prev) => ({ ...prev, [groupId]: '' }));
      setClientSelectInputs((prev) => ({ ...prev, [groupId]: '' }));
      await fetchData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao vincular participante.'
      );
    } finally {
      setBusyGroupId(null);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    setBusyGroupId(groupId);
    setMessage('');
    setError('');

    try {
      const res = await fetch(
        `/api/admin/groups/${groupId}/members?userId=${encodeURIComponent(userId)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao remover participante.');
      }

      setMessage(data.message || 'Participante removido.');
      await fetchData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover participante.'
      );
    } finally {
      setBusyGroupId(null);
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
        activeRoute="admin"
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
              <Users size={18} className="text-sky-600 dark:text-sky-400" />
              <h1 className="text-base sm:text-lg font-bold">
                Grupos de Viagem
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Agrupe passageiros via carteira ou inviteCode (UUID) para roteiros compartilhados
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Painel do Agente</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário: Criar Novo Grupo */}
          <section className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <FolderPlus size={18} className="text-sky-600 dark:text-sky-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Novo Grupo de Viagem
              </h2>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className={labelClass}>Nome do Grupo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Silva - Europa 2026"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Descrição / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Saída de Guarulhos, 12 passageiros"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Adicionar por inviteCode (UUID)
                </label>
                <input
                  type="text"
                  placeholder="Cole um ou mais UUIDs separados por vírgula"
                  value={initialInviteCode}
                  onChange={(e) => setInitialInviteCode(e.target.value)}
                  className={inputClass}
                />
              </div>

              {clients.length > 0 && (
                <div>
                  <label className={labelClass}>
                    Selecionar Clientes da Carteira ({selectedClientIds.length})
                  </label>
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950">
                    {clients.map((client) => {
                      const checked = selectedClientIds.includes(client.id);
                      return (
                        <label
                          key={client.id}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleInitialClient(client.id)}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{client.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {client.email}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={creatingGroup}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {creatingGroup ? 'Criando grupo...' : 'Criar Grupo de Viagem'}
              </button>
            </form>
          </section>

          {/* Lista de Grupos */}
          <section className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-500">
                Carregando grupos de viagem...
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
                <Users size={32} className="mx-auto text-slate-400" />
                <p className="text-sm font-bold">Nenhum grupo criado ainda</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crie seu primeiro grupo ao lado para vincular viajantes e compartilhar um único itinerário.
                </p>
              </div>
            ) : (
              groups.map((group) => {
                const existingIds = new Set(group.members.map((m) => m.userId));
                const availableClients = clients.filter(
                  (c) => !existingIds.has(c.id)
                );
                const isBusy = busyGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
                  >
                    {/* Cabeçalho do Grupo */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold">{group.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                            {group.members.length}{' '}
                            {group.members.length === 1 ? 'viajante' : 'viajantes'}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {group.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/dashboard/admin/trips/new?groupId=${group.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <Plane size={14} />
                        <span>Nova Viagem para o Grupo</span>
                      </Link>
                    </div>

                    {/* Viagens Vinculadas ao Grupo */}
                    {group.trips.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Viagens deste Grupo ({group.trips.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.trips.map((trip) => (
                            <div
                              key={trip.id}
                              className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-center justify-between text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-bold truncate">{trip.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {trip.destination}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Participantes Atuais */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Participantes
                      </p>

                      {group.members.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nenhum participante vinculado ainda.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                          {group.members.map((member) => (
                            <div
                              key={member.id}
                              className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold truncate">
                                  {member.user.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {member.user.email} •{' '}
                                  <span className="font-mono">
                                    {member.user.inviteCode}
                                  </span>
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  handleRemoveMember(group.id, member.userId)
                                }
                                title="Remover do grupo"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Controles Rápidos para Vincular Viajante */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Por inviteCode UUID */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <KeyRound
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Vincular por inviteCode (UUID)"
                            value={inviteInputs[group.id] || ''}
                            onChange={(e) =>
                              setInviteInputs((prev) => ({
                                ...prev,
                                [group.id]: e.target.value,
                              }))
                            }
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isBusy || !(inviteInputs[group.id] || '').trim()}
                          onClick={() =>
                            handleAddMember(group.id, {
                              inviteCode: inviteInputs[group.id],
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50 shrink-0"
                        >
                          <Plus size={14} />
                          <span>UUID</span>
                        </button>
                      </div>

                      {/* Por cliente da carteira */}
                      <div className="flex gap-2">
                        <select
                          value={clientSelectInputs[group.id] || ''}
                          onChange={(e) =>
                            setClientSelectInputs((prev) => ({
                              ...prev,
                              [group.id]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="">
                            {availableClients.length > 0
                              ? 'Selecionar cliente da carteira...'
                              : 'Todos os clientes já vinculados'}
                          </option>
                          {availableClients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.email})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={isBusy || !clientSelectInputs[group.id]}
                          onClick={() =>
                            handleAddMember(group.id, {
                              userId: clientSelectInputs[group.id],
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold disabled:opacity-50 shrink-0"
                        >
                          <UserPlus size={14} />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}