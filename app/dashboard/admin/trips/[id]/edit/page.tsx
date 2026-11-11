'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Save, Edit3, X } from 'lucide-react';

interface ItineraryItem {
  id?: string;
  title: string;
  subtitle: string;
  type: string;
  location: string;
  date: string;
  time: string;
  voucherFile: string;
}

function EditTripContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [userId, setUserId] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

  // Campos temporários do formulário de item
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemType, setItemType] = useState('flight');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [itemTime, setItemTime] = useState('');
  const [itemVoucher, setItemVoucher] = useState('');

  // Índice do item que está sendo editado no momento (null = criando novo)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/admin/trips/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setDestination(data.destination);
          setUserId(data.userId);
          setItinerary(data.itinerary || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados da viagem:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [tripId]);

  // Salvar ou Atualizar item na lista local do itinerário
  const handleSaveItem = () => {
    if (!itemTitle) return;

    const newItem: ItineraryItem = {
      title: itemTitle,
      subtitle: itemSubtitle,
      type: itemType,
      location: itemLocation,
      date: itemDate,
      time: itemTime,
      voucherFile: itemVoucher,
    };

    if (editingIndex !== null) {
      // Atualiza o item existente
      const updated = [...itinerary];
      updated[editingIndex] = newItem;
      setItinerary(updated);
      setEditingIndex(null);
    } else {
      // Adiciona um novo item
      setItinerary([...itinerary, newItem]);
    }

    // Limpa os campos
    clearItemForm();
  };

  const clearItemForm = () => {
    setItemTitle('');
    setItemSubtitle('');
    setItemLocation('');
    setItemDate('');
    setItemTime('');
    setItemVoucher('');
    setEditingIndex(null);
  };

  const handleEditItem = (index: number) => {
    const item = itinerary[index];
    setItemTitle(item.title);
    setItemSubtitle(item.subtitle || '');
    setItemType(item.type || 'flight');
    setItemLocation(item.location || '');
    setItemDate(item.date || '');
    setItemTime(item.time || '');
    setItemVoucher(item.voucherFile || '');
    setEditingIndex(index);
  };

  const handleRemoveItem = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
    if (editingIndex === index) {
      clearItemForm();
    }
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, destination, itinerary }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar viagem');

      setMessage('Viagem e itinerário atualizados com sucesso!');
      setTimeout(() => {
        if (userId) router.push(`/dashboard/admin/clients/${userId}`);
      }, 1000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Tem certeza que deseja excluir esta viagem inteira?')) return;
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, { method: 'DELETE' });
      if (res.ok && userId) {
        router.push(`/dashboard/admin/clients/${userId}`);
      }
    } catch (err) {
      alert('Erro ao excluir viagem.');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Carregando dados da viagem...</div>;
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-white p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={userId ? `/dashboard/admin/clients/${userId}` : '/dashboard/admin'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Voltar ao Perfil do Cliente
        </Link>

        <button
          onClick={handleDeleteTrip}
          className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all"
        >
          Excluir Viagem Inteira
        </button>
      </div>

      <div className="mb-8">
        <span className="text-xs font-extrabold text-sky-400 tracking-[2px] uppercase">
          EDITOR DE ROTEIRO
        </span>
        <h1 className="text-2xl font-black mt-1">Editar Viagem & Itinerário</h1>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      <form onSubmit={handleSaveTrip} className="space-y-6">
        {/* Informações Principais */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">1. Informações Gerais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Título da Viagem</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Destino Principal</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Gerenciamento / Edição de Itinerário & Vouchers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
              {editingIndex !== null ? `Editando Item #${editingIndex + 1}` : '2. Adicionar Evento ao Itinerário'}
            </h2>
            {editingIndex !== null && (
              <button
                type="button"
                onClick={clearItemForm}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X size={14} /> Cancelar Edição
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Título do Evento / Voo / Hotel</label>
              <input
                type="text"
                placeholder="Ex: Voo JL048 / Check-in Hotel"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="flight">Voo / Logística</option>
                <option value="hotel">Hospedagem</option>
                <option value="food">Gastronomia</option>
                <option value="tour">Passeio / Lazer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Local / Terminal</label>
              <input
                type="text"
                placeholder="Ex: Terminal 3"
                value={itemLocation}
                onChange={(e) => setItemLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Data</label>
              <input
                type="date"
                placeholder="Ex: 20 de Out, 2026"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Horário</label>
              <input
                type="time"
                placeholder="Ex: 23:15"
                value={itemTime}
                onChange={(e) => setItemTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Link do Voucher / Documento PDF</label>
            <input
              type="text"
              placeholder="Ex: https://storage.modustravel.com.br/vouchers/voo.pdf"
              value={itemVoucher}
              onChange={(e) => setItemVoucher(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveItem}
            className={`w-full font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs border ${
              editingIndex !== null
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-sky-500/30'
            }`}
          >
            {editingIndex !== null ? (
              <>
                <Edit3 size={16} /> Atualizar Item no Itinerário
              </>
            ) : (
              <>
                <Plus size={16} /> Adicionar Evento ao Itinerário
              </>
            )}
          </button>
        </div>

        {/* Lista de Eventos Atuais com Botões de Editar e Remover */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Itinerário Atual ({itinerary.length} itens)
          </h3>

          {itinerary.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">Nenhum evento adicionado a esta viagem.</p>
          ) : (
            <div className="space-y-2">
              {itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    editingIndex === idx
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 mr-4">
                    <span className="text-xs font-bold text-sky-400 mr-2">[{item.type.toUpperCase()}]</span>
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.date} {item.time && `às ${item.time}`} {item.location && `• ${item.location}`}
                      {item.voucherFile && <span className="text-emerald-400 ml-2">📄 Com Voucher</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditItem(idx)}
                      title="Editar item"
                      className="text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 p-2 rounded-lg transition-all"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      title="Remover item"
                      className="text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 p-2 rounded-lg transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Salvando Alterações...' : 'Salvar Alterações Globais da Viagem'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="text-xs text-slate-400 p-10 text-center">Carregando editor...</div>}>
      <EditTripContent params={params} />
    </Suspense>
  );
}