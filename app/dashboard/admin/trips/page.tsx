'use client';

import { useState, useEffect } from 'react';
import { Plane, Building2, Utensils, Compass, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ItineraryFormItem {
  title: string;
  subtitle: string;
  type: string;
  location: string;
  date: string;
  time: string;
  voucherFile: string;
}

export default function AdminTripsPage() {
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Lista de itinerários criados para a viagem
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
    async function fetchClients() {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
      }
    }
    fetchClients();
  }, []);

  const handleAddItineraryItem = () => {
    if (!itemTitle) return;
    setItinerary((prev) => [
      ...prev,
      {
        title: itemTitle,
        subtitle: itemSubtitle,
        type: itemType,
        location: itemLocation,
        date: itemDate,
        time: itemTime,
        voucherFile: itemVoucher,
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
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          destination,
          userId: selectedUserId,
          itinerary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar viagem');

      setMessage('Viagem e itinerário cadastrados com sucesso!');
      setTitle('');
      setDestination('');
      setSelectedUserId('');
      setItinerary([]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-extrabold text-sky-400 tracking-[2px] uppercase">
          PAINEL DO AGENTE DE VIAGEM
        </span>
        <h1 className="text-2xl font-black mt-1">Cadastro de Viagens & Itinerários</h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie viagens de clientes, monte o cronograma passo a passo e anexe os vouchers.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmitTrip} className="space-y-6">
        {/* Bloco 1: Informações da Viagem */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
            1. Dados da Viagem & Cliente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Título da Viagem</label>
              <input
                type="text"
                required
                placeholder="Ex: Tóquio Expedition 2026"
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
                placeholder="Ex: Tóquio, Japão"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cliente Vinculado</label>
            {clients.length > 0 ? (
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
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
                placeholder="Informe o ID (UUID) do usuário cliente"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            )}
          </div>
        </div>

        {/* Bloco 2: Itinerário & Vouchers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
            2. Adicionar Eventos ao Itinerário
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Título do Evento / Voo / Reserva</label>
              <input
                type="text"
                placeholder="Ex: Voo JL048 / Check-in Hotel Tokyo Central"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Local / Aeroporto</label>
              <input
                type="text"
                placeholder="Ex: Aeroporto de Haneda (HND)"
                value={itemLocation}
                onChange={(e) => setItemLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Data</label>
              <input
                type="text"
                placeholder="Ex: 20 de Out, 2026"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Horário</label>
              <input
                type="text"
                placeholder="Ex: 23:15"
                value={itemTime}
                onChange={(e) => setItemTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Link do Voucher ou Documento PDF</label>
            <input
              type="text"
              placeholder="Ex: https://storage.modustravel.com.br/vouchers/voo-jl048.pdf"
              value={itemVoucher}
              onChange={(e) => setItemVoucher(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAddItineraryItem}
            className="w-full bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold py-2.5 rounded-xl border border-sky-500/30 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Plus size={16} /> Adicionar Evento ao Itinerário
          </button>
        </div>

        {/* Bloco 3: Lista Prevista do Itinerário */}
        {itinerary.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Itinerário Montado ({itinerary.length} evento{itinerary.length > 1 ? 's' : ''})
            </h3>
            <div className="space-y-2">
              {itinerary.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-sky-400 mr-2">[{item.type.toUpperCase()}]</span>
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.date} {item.time && `às ${item.time}`} {item.location && `• ${item.location}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-400 hover:text-red-300 p-1.5 transition-colors"
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
    </div>
  );
}