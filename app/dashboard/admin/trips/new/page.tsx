'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plane,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react';

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface GroupOption {
  id: string;
  name: string;
  members?: Array<{ id: string }>;
}

interface ItineraryDraft {
  title: string;
  subtitle: string;
  type: 'flight' | 'hotel' | 'food' | 'tour';
  location: string;
  date: string;
  time: string;
  voucherFile: string;
}

const emptyItem = (): ItineraryDraft => ({
  title: '',
  subtitle: '',
  type: 'flight',
  location: '',
  date: '',
  time: '',
  voucherFile: '',
});

function NewTripFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGroupId = searchParams.get('groupId') || '';
  const initialClientId = searchParams.get('clientId') || '';

  const [targetType, setTargetType] = useState<'client' | 'group'>(
    initialGroupId ? 'group' : 'client'
  );
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(true);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryDraft[]>([emptyItem()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTargets() {
      try {
        const [clientsRes, groupsRes] = await Promise.all([
          fetch('/api/admin/clients', { cache: 'no-store', credentials: 'include' }),
          fetch('/api/admin/groups', { cache: 'no-store', credentials: 'include' }),
        ]);

        if (clientsRes.ok) {
          const cData = await clientsRes.json();
          setClients(Array.isArray(cData) ? cData : []);
        }
        if (groupsRes.ok) {
          const gData = await groupsRes.json();
          setGroups(Array.isArray(gData) ? gData : []);
        }
      } catch {
        setError('Não foi possível carregar clientes e grupos.');
      } finally {
        setLoadingTargets(false);
      }
    }
    loadTargets();
  }, []);

  const updateItineraryItem = <K extends keyof ItineraryDraft>(
    index: number,
    field: K,
    value: ItineraryDraft[K]
  ) => {
    setItinerary((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addItineraryItem = () => {
    setItinerary((prev) => [...prev, emptyItem()]);
  };

  const removeItineraryItem = (index: number) => {
    setItinerary((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title,
        destination,
        startDate: startDate || null,
        endDate: endDate || null,
        userId: targetType === 'client' ? selectedClientId : null,
        groupId: targetType === 'group' ? selectedGroupId : null,
        itinerary: itinerary.filter((item) => item.title.trim() !== ''),
      };

      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar viagem.');
      }

      router.push(
        targetType === 'group' ? '/dashboard/admin/groups' : '/dashboard/admin'
      );
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar viagem.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors';

  const labelClass =
    'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white p-4 sm:p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Plane size={22} className="text-sky-600 dark:text-sky-400" />
              <span>Criar Nova Viagem</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Vincule o roteiro a um passageiro individual ou a um grupo inteiro.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destinatário: Cliente Individual ou Grupo */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              1. Destinatário da Viagem
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetType('client')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  targetType === 'client'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <User size={16} />
                <span>Cliente Individual</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('group')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  targetType === 'group'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Users size={16} />
                <span>Grupo de Viagem</span>
              </button>
            </div>

            {loadingTargets ? (
              <p className="text-xs text-slate-500">Carregando opções...</p>
            ) : targetType === 'client' ? (
              <div>
                <label className={labelClass}>Selecione o Cliente *</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Escolha um cliente da sua carteira...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelClass}>Selecione o Grupo *</label>
                <select
                  required
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Escolha um grupo de viagem...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.members?.length ?? 0} viajantes)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* Dados Gerais da Viagem */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              2. Informações do Roteiro
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Título da Viagem *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Expedição Japão & Coreia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Destino Principal *</label>
                <div className="relative">
                  <MapPin
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tóquio, Japão"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Data de Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>

              <div>
                <label className={labelClass}>Data de Término</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>
            </div>
          </section>

          {/* Itinerário e Vouchers */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Calendar size={16} />
                <span>3. Itinerário & Vouchers Coletivos</span>
              </h2>

              <button
                type="button"
                onClick={addItineraryItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-xs font-bold"
              >
                <Plus size={14} />
                <span>Adicionar Etapa</span>
              </button>
            </div>

            <div className="space-y-4">
              {itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      Etapa #{idx + 1}
                    </span>
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Tipo</label>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          updateItineraryItem(
                            idx,
                            'type',
                            e.target.value as ItineraryDraft['type']
                          )
                        }
                        className={inputClass}
                      >
                        <option value="flight">Voo / Transporte</option>
                        <option value="hotel">Hospedagem</option>
                        <option value="tour">Passeio / Evento</option>
                        <option value="food">Gastronomia</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Título da Etapa</label>
                      <input
                        type="text"
                        placeholder="Ex: Voo JL048 para Haneda"
                        value={item.title}
                        onChange={(e) =>
                          updateItineraryItem(idx, 'title', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Data</label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateItineraryItem(idx, 'date', e.target.value)
                        }
                        className={`${inputClass} dark:[color-scheme:dark]`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Horário</label>
                      <input
                        type="time"
                        value={item.time}
                        onChange={(e) =>
                          updateItineraryItem(idx, 'time', e.target.value)
                        }
                        className={`${inputClass} dark:[color-scheme:dark]`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Local / Terminal</label>
                      <input
                        type="text"
                        placeholder="Ex: Terminal 3 - GRU"
                        value={item.location}
                        onChange={(e) =>
                          updateItineraryItem(idx, 'location', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Observações / Subtítulo</label>
                      <input
                        type="text"
                        placeholder="Ex: Check-in 3h antes, bagagem despachada inclusa"
                        value={item.subtitle}
                        onChange={(e) =>
                          updateItineraryItem(idx, 'subtitle', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>URL do Voucher</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={item.voucherFile}
                        onChange={(e) =>
                          updateItineraryItem(idx, 'voucherFile', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              {saving ? 'Salvando viagem...' : 'Publicar Viagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewAdminTripPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm text-slate-500">
          Carregando formulário de viagem...
        </div>
      }
    >
      <NewTripFormContent />
    </Suspense>
  );
}