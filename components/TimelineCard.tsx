'use client';

import React from 'react';
import {
  Building2,
  ChevronRight,
  Compass,
  Plane,
  Utensils,
} from 'lucide-react';

export type ActivityType = 'flight' | 'hotel' | 'food' | 'tour';

interface TimelineCardProps {
  time: string;
  title: string;
  subtitle: string;
  type?: ActivityType;
  onPress?: () => void;
}

const CATEGORY_CONFIG = {
  flight: {
    icon: Plane,
    colorClass: 'text-sky-400',
    colorHex: '#38bdf8',
    bgClass: 'bg-sky-400/12',
    borderClass: 'border-sky-400/25',
    label: 'Voo / Logística',
  },
  hotel: {
    icon: Building2,
    colorClass: 'text-indigo-400',
    colorHex: '#818cf8',
    bgClass: 'bg-indigo-400/12',
    borderClass: 'border-indigo-400/25',
    label: 'Hospedagem',
  },
  food: {
    icon: Utensils,
    colorClass: 'text-amber-400',
    colorHex: '#fbbf24',
    bgClass: 'bg-amber-400/12',
    borderClass: 'border-amber-400/25',
    label: 'Gastronomia',
  },
  tour: {
    icon: Compass,
    colorClass: 'text-emerald-400',
    colorHex: '#34d399',
    bgClass: 'bg-emerald-400/12',
    borderClass: 'border-emerald-400/25',
    label: 'Passeio / Lazer',
  },
};

export default function TimelineCard({
  time = '10:00',
  title = 'Atividade Planejada',
  subtitle = 'Descrição do local',
  type = 'tour',
  onPress,
}: TimelineCardProps) {
  const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.tour;
  const IconComponent = config.icon;

  return (
    <div
      onClick={onPress}
      className="bg-[#0f172a] rounded-[20px] border border-slate-800 p-4 mb-3 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.2)] cursor-pointer transition-all hover:border-slate-700 active:scale-[0.99]"
    >
      {/* Esquerda: Ícone de Categoria + Informações */}
      <div className="flex items-center flex-1 mr-3 min-w-0">
        {/* Badge do Ícone com Cor Temática */}
        <div
          className={`w-[44px] h-[44px] rounded-[14px] ${config.bgClass} border ${config.borderClass} flex items-center justify-center mr-3.5 shrink-0`}
        >
          <IconComponent size={20} color={config.colorHex} />
        </div>

        {/* Detalhes da Atividade */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-0.5">
            <span
              className={`text-xs font-extrabold ${config.colorClass} mr-2`}
            >
              {time}
            </span>
            <div className="w-[3px] h-[3px] rounded-full bg-slate-600 mr-2 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.8px]">
              {config.label}
            </span>
          </div>

          <h4 className="text-[15px] font-bold text-white truncate mb-0.5">
            {title}
          </h4>

          <p className="text-xs font-medium text-slate-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Seta indicativa de navegação */}
      <div className="pl-1 shrink-0">
        <ChevronRight size={18} className="text-slate-600" />
      </div>
    </div>
  );
}