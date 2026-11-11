'use client';

import React from 'react';
import { ChevronRight, Plane, SunMedium } from 'lucide-react';

interface TripHeroCardProps {
  destination?: string;
  dateInfo?: string;
  subInfo?: string;
  temperature?: string;
  onPress?: () => void;
}

export default function TripHeroCard({
  destination = 'Tóquio, Japão',
  dateInfo = 'Faltam 45 dias',
  subInfo = 'Voo JL048 · 20 de Out, 23:15',
  temperature = '18°C',
  onPress,
}: TripHeroCardProps) {
  return (
    <div
      onClick={onPress}
      className="relative overflow-hidden rounded-[24px] bg-[#0f172a] border border-sky-500/30 p-5 shadow-[0_8px_30px_rgb(2,132,199,0.25)] cursor-pointer transition-all hover:border-sky-400/50 active:scale-[0.99]"
    >
      {/* Luzes de Fundo Ambientais (Glow) */}
      <div className="absolute -top-10 -right-10 w-[150px] h-[150px] rounded-full bg-sky-400/10 pointer-events-none blur-xl" />
      <div className="absolute -bottom-10 -left-10 w-[130px] h-[130px] rounded-full bg-blue-600/10 pointer-events-none blur-xl" />

      {/* Topo: Status de Contagem + Badge de Clima */}
      <div className="flex items-center justify-between mb-4.5 relative z-10">
        {/* Pílula de Contagem Regressiva */}
        <div className="flex items-center bg-sky-500/15 border border-sky-400/35 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-sky-400 mr-2 shrink-0 animate-pulse" />
          <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-[1.2px]">
            {dateInfo}
          </span>
        </div>

        {/* Clima do Destino */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-full">
          <SunMedium size={14} className="text-amber-500 mr-1.5 shrink-0" />
          <span className="text-xs font-bold text-slate-200">
            {temperature}
          </span>
        </div>
      </div>

      {/* Corpo: Destino Principal */}
      <div className="mb-3.5 relative z-10">
        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-[1.8px] block mb-1">
          Próxima Jornada
        </span>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-white flex-1 mr-3 tracking-tight">
            {destination}
          </h3>
          <div className="w-[38px] h-[38px] rounded-[14px] bg-sky-400/12 border border-sky-400/30 flex items-center justify-center shrink-0">
            <ChevronRight size={20} className="text-sky-400" />
          </div>
        </div>
      </div>

      {/* Divisor estilo "Passagem de Embarque" (Dashed Line) */}
      <div className="border-t border-dashed border-slate-800 my-3 relative z-10" />

      {/* Rodapé: Logística do Voo/Embarque */}
      <div className="flex items-center pt-0.5 relative z-10">
        <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-400/25 mr-2.5 shrink-0">
          <Plane size={16} className="text-blue-400" />
        </div>
        <p className="text-xs font-semibold text-slate-300 truncate flex-1">
          {subInfo}
        </p>
      </div>
    </div>
  );
}