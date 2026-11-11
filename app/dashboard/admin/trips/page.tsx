'use client';

import React, { useState, useEffect } from 'react';
import { Plane, Building2, Utensils, Compass, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function AdminTripsPage({ params, searchParams }: PageProps) {
  // desempacota promises dos params se necessário futuramente:
  // const resolvedParams = params ? React.use(params) : {};

  const [clients, setClients] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Estado para os itens do itinerário da viagem atual
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemType, setItemType] = useState('flight');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [itemTime, setItemTime] = useState('');
  const [itemVoucher, setItemVoucher] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Busca lista de usuários cadastrados para associar a viagem
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (e) {
        console.error('Erro ao carregar clientes');
      }
    }
    fetchClients();
  }, []);

  const handleAddItineraryItem = () => {
    if (!itemTitle) return;
    setItinerary([
      ...itinerary,
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
    setItinerary(itinerary.filter((_, i) => i !== index));
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
      setItinerary([]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-extrabold text-sky-400 tracking-[2px] uppercase">
          PAINEL DO AGENTE
        </span>
        <h1 className="text-2xl font-black mt-1">Cadastro de Viagens & Itinerários</h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie destinos, organize cronogramas e vincule vouchers de passagens e hotéis.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmitTrip} className="space-y-6">
        {/* Dados Principais da Viagem */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider">1. Informações da Viagem</h2>
          
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
            <label className="block text-xs font-medium text-slate-300 mb-1">ID do Cliente (UUID)</label>
            <input
              type="text"
              required
              placeholder="Cole o ID do cliente cadastrado"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Cadastro de Itinerário e Vouchers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider">2. Adicionar Itinerário & Vouchers</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Título da Atividade / Voo / Hotel</label>
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
                placeholder="Ex: Terminal 3 - Guarulhos"
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Link do Voucher / Documento (URL ou PDF)</label>
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
            <Plus size={16} /> Adicionar ao Itinerário
          </button>
        </div>

        {/* Lista de Itinerários Adicionados */}
        {itinerary.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itinerário Pronto ({itinerary.length} itens)</h3>
            <div className="space-y-2">
              {itinerary.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-sky-400 mr-2">[{item.type.toUpperCase()}]</span>
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-[11px] text-slate-400">{item.date} às {item.time} {item.location && `• ${item.location}`}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm"
          >
            {loading ? 'Salvando Viagem...' : 'Salvar Viagem Completa'}
          </button>
        </div>
      </form>
    </div>
  );
}