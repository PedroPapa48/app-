import React from 'react';
import { PlanData } from '../types';
import { ShieldCheck, Target, Moon, Brain, Coffee, ShieldAlert } from 'lucide-react';

interface DiagnosticCardProps {
  plan: PlanData;
  onOpenTakeoff: () => void;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({ plan, onOpenTakeoff }) => {
  // Extract number from viability string if possible
  const viabilityMatch = plan.viabilityIndex.match(/(\d+)%/);
  const viabilityNumber = viabilityMatch ? parseInt(viabilityMatch[1], 10) : 85;

  // Calculate metrics from schedule blocks
  const blocks = plan.scheduleBlocks || [];
  
  const deepWorkMinutes = blocks
    .filter(b => b.category === 'deep_work')
    .reduce((acc, b) => acc + calculateDuration(b.startTime, b.endTime), 0);
  
  const breakMinutes = blocks
    .filter(b => b.category === 'break')
    .reduce((acc, b) => acc + calculateDuration(b.startTime, b.endTime), 0);

  const bufferMinutes = blocks
    .filter(b => b.category === 'buffer')
    .reduce((acc, b) => acc + calculateDuration(b.startTime, b.endTime), 0);

  const sleepBlock = blocks.find(b => b.category === 'sleep');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-indigo-400 text-xs font-mono tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Diagnóstico Rápido de Viabilidad Cognitiva</span>
            {plan.generatedAt && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400/90 text-[11px] normal-case font-mono bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Plan generado a las {plan.generatedAt}
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Análisis de Carga & Prioridad Estratégica
          </h2>
        </div>

        {/* Viability Gauge */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-700"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * viabilityNumber) / 100}
                className={viabilityNumber >= 80 ? 'text-emerald-400' : viabilityNumber >= 65 ? 'text-amber-400' : 'text-rose-400'}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-white">
              {viabilityNumber}%
            </span>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Índice de Viabilidad
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {plan.viabilityIndex}
            </div>
          </div>
        </div>
      </div>

      {/* Key Focus Banner */}
      <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 border-y border-r border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-0.5">
              Enfoque Clave del Día (Prioridad #1)
            </span>
            <p className="text-slate-200 font-medium text-base sm:text-lg leading-snug">
              {plan.keyFocus}
            </p>
          </div>
        </div>
      </div>

      {/* Cognitive distribution stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 mb-1">
            <Brain className="w-3.5 h-3.5" />
            <span className="font-mono">Foco Profundo</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatMinutes(deepWorkMinutes)}
          </div>
          <div className="text-[11px] text-slate-400">Bloques ultradianos</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="font-mono">Buffer Seguridad</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatMinutes(bufferMinutes)}
          </div>
          <div className="text-[11px] text-slate-400">Margen anti-colapso</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-teal-400 mb-1">
            <Coffee className="w-3.5 h-3.5" />
            <span className="font-mono">Pausas Activas</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatMinutes(breakMinutes)}
          </div>
          <div className="text-[11px] text-slate-400">Recarga sináptica</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 mb-1">
            <Moon className="w-3.5 h-3.5" />
            <span className="font-mono">Santuario Sueño</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {sleepBlock ? sleepBlock.startTime : '23:00'}
          </div>
          <div className="text-[11px] text-slate-400">Corte innegociable</div>
        </div>
      </div>
    </div>
  );
};

function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 45;
  const startTotal = sh * 60 + sm;
  let endTotal = eh * 60 + em;
  if (endTotal < startTotal) endTotal += 24 * 60; // Next day
  return endTotal - startTotal;
}

function formatMinutes(min: number): string {
  const hours = Math.floor(min / 60);
  const remaining = min % 60;
  if (hours === 0) return `${min}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}
