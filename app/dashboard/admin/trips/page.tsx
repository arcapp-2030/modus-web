'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  User,
  Users,
} from 'lucide-react';
import { UploadFileButton } from '@/components/UploadFileButton';
import { ClientDocumentsSection } from '@/components/ClientDocumentsSection';

interface ItineraryFormItem {
  title: string;
  subtitle: string;
  type: string;
  location: string;
  date: string;
  time: string;
  voucherFile: string;
}

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface GroupOption {
  id: string;
  name: string;
  _count?: { members: number };
}

function AdminTripsForm() {
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') || '';
  const preselectedGroupId = searchParams.get('groupId') || '';

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);

  const [targetType, setTargetType] = useState<'INDIVIDUAL' | 'GROUP'>(
    preselectedGroupId ? 'GROUP' : 'INDIVIDUAL'
  );
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(preselectedClientId);
  const [selectedGroupId, setSelectedGroupId] = useState(preselectedGroupId);

  // Campos de cada evento do itinerário
  const [itinerary, setItinerary] = useState<ItineraryFormItem[]>([]);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemType, setItemType] = useState('flight');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [itemTime, setItemTime] = useState('');
  const [itemVoucher, setItemVoucher] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preselectedClientId) {
      setTargetType('INDIVIDUAL');
      setSelectedUserId(preselectedClientId);
    }
    if (preselectedGroupId) {
      setTargetType('GROUP');
      setSelectedGroupId(preselectedGroupId);
    }

    async function fetchOptions() {
      try {
        const [clientsRes, groupsRes] = await Promise.all([
          fetch('/api/admin/clients', { cache: 'no-store', credentials: 'include' }),
          fetch('/api/admin/groups', { cache: 'no-store', credentials: 'include' }),
        ]);

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(Array.isArray(clientsData) ? clientsData : []);
        }
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(Array.isArray(groupsData) ? groupsData : []);
        }
      } catch (e) {
        console.error('Erro ao carregar clientes/grupos:', e);
      }
    }

    fetchOptions();
  }, [preselectedClientId, preselectedGroupId]);

  const handleAddItineraryItem = () => {
    if (!itemTitle.trim()) return;
    setItinerary((prev) => [
      ...prev,
      {
        title: itemTitle.trim(),
        subtitle: itemSubtitle.trim(),
        type: itemType,
        location: itemLocation.trim(),
        date: itemDate,
        time: itemTime,
        voucherFile: itemVoucher.trim(),
      },
    ]);
    setItemTitle('');
    setItemSubtitle('');
    setItemLocation('');
    setItemDate('');
    setItemTime('');
    setItemVoucher('');
  };

  const handleRemoveItem = (index: number) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        title,
        destination,
        startDate: startDate || null,
        endDate: endDate || null,
        userId: targetType === 'INDIVIDUAL' ? selectedUserId : null,
        groupId: targetType === 'GROUP' ? selectedGroupId : null,
        itinerary,
      };

      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar viagem');

      setMessage('Viagem e itinerário cadastrados com sucesso!');
      setTitle('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setItinerary([]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors';

  const cardClass =
    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none transition-colors';

  const labelClass =
    'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  const sectionTitleClass =
    'text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080d1a] dark:text-white transition-colors">
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        {/* Botão de Retorno */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Painel do Agente
          </Link>

          <Link
            href="/dashboard/admin/groups"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Gerenciar Grupos →
          </Link>
        </div>

        <div>
          <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 tracking-[2px] uppercase">
            PAINEL DO AGENTE DE VIAGEM
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Cadastro de Viagens & Itinerários
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monte o cronograma passo a passo e anexe os vouchers diretamente no storage.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{message}</span>
            <Link
              href="/dashboard/admin"
              className="ml-auto underline font-bold text-emerald-800 dark:text-emerald-300"
            >
              Ir ao Painel
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmitTrip} className="space-y-6">
          {/* Bloco 1: Informações da Viagem */}
          <div className={cardClass}>
            <h2 className={sectionTitleClass}>1. Dados da Viagem & Destinatário</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Título da Viagem</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tóquio Expedition 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Destino Principal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tóquio, Japão"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Seletor Individual vs Grupo */}
            <div className="space-y-3 pt-1">
              <label className={labelClass}>Modalidade da Viagem</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('INDIVIDUAL')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    targetType === 'INDIVIDUAL'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <User size={14} />
                  <span>Cliente Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('GROUP')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    targetType === 'GROUP'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <Users size={14} />
                  <span>Grupo de Viagem</span>
                </button>
              </div>

              {targetType === 'INDIVIDUAL' ? (
                <div>
                  <label className={labelClass}>Cliente Vinculado</label>
                  {clients.length > 0 ? (
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione um cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || 'Sem Nome'} ({c.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Informe o ID do usuário cliente"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className={inputClass}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Grupo de Viagem</label>
                  <select
                    required
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecione um grupo...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g._count?.members ?? 0} membros)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Bloco 2: Itinerário & Vouchers */}
          <div className={cardClass}>
            <h2 className={sectionTitleClass}>2. Adicionar Eventos ao Itinerário</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Título do Evento / Voo / Reserva</label>
                <input
                  type="text"
                  placeholder="Ex: Voo JL048 / Check-in Hotel Tokyo Central"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Categoria</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className={inputClass}
                >
                  <option value="flight">Voo / Logística</option>
                  <option value="hotel">Hospedagem</option>
                  <option value="food">Gastronomia</option>
                  <option value="tour">Passeio / Lazer</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Subtítulo / Observação Rápida (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Embarque no Terminal 3 • Localizador ABC123"
                value={itemSubtitle}
                onChange={(e) => setItemSubtitle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Local / Aeroporto</label>
                <input
                  type="text"
                  placeholder="Ex: Aeroporto de Haneda (HND)"
                  value={itemLocation}
                  onChange={(e) => setItemLocation(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Data</label>
                <input
                  type="date"
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>

              <div>
                <label className={labelClass}>Horário</label>
                <input
                  type="time"
                  value={itemTime}
                  onChange={(e) => setItemTime(e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>
            </div>

            {/* Upload de Voucher para HostGator */}
            <div className="space-y-2 pt-1">
              <label className={labelClass}>Voucher ou Comprovante (PDF / Imagem)</label>
              <UploadFileButton
                label="Anexar Voucher (HostGator)"
                value={itemVoucher || null}
                onUploaded={(uploaded) => setItemVoucher(uploaded.url)}
                onClear={() => setItemVoucher('')}
              />
            </div>

            <button
              type="button"
              onClick={handleAddItineraryItem}
              className="w-full bg-sky-500/10 hover:bg-sky-500/15 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 font-semibold py-2.5 rounded-xl border border-sky-500/30 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Plus size={16} /> Adicionar Evento ao Itinerário
            </button>
          </div>

          {/* Bloco 3: Lista Prevista do Itinerário */}
          {itinerary.length > 0 && (
            <div className={cardClass}>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Itinerário Montado ({itinerary.length} evento{itinerary.length > 1 ? 's' : ''})
              </h3>
              <div className="space-y-2">
                {itinerary.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 mr-2">
                        [{item.type.toUpperCase()}]
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.date} {item.time && `às ${item.time}`}{' '}
                        {item.location && `• ${item.location}`}
                      </p>
                      {item.voucherFile && (
                        <a
                          href={item.voucherFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <span>Voucher anexado</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 p-1.5 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm"
            >
              {loading ? 'Salvando Viagem...' : 'Gravar Viagem Completa'}
            </button>
          </div>
        </form>

        {/* Bloco 4: Documentos Pessoais do Cliente (Passaporte, Visto, Seguro) */}
        {clients.length > 0 && <ClientDocumentsSection clients={clients} />}
      </div>
    </div>
  );
}

export default function AdminTripsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-xs text-slate-500 dark:text-slate-400 p-10 text-center">
          Carregando formulário...
        </div>
      }
    >
      <AdminTripsForm />
    </Suspense>
  );
}