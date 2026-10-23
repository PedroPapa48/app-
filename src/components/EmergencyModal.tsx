import React from 'react';
import { X, AlertTriangle, ShieldCheck, Moon, RefreshCw } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerEmergency: (delayMinutes: number) => void;
  isLoading: boolean;
  currentSleepTime: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onTriggerEmergency,
  isLoading,
  currentSleepTime,
}) => {
  const [delayMinutes, setDelayMinutes] = React.useState<number>(60);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-rose-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Protocolo de Emergencia Anticolapso
              </h3>
              <p className="text-xs text-rose-300 font-mono">
                Regla de Contingencia por Imprevisto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            Un imprevisto no debe arruinar tu día ni empujarte a trasnochar. El algoritmo
            de Chronos-Academic reconfigura los bloques aplicando las 4 leyes neurocientíficas:
          </p>

          {/* Golden Rules of Emergency */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>1. Absorción del Buffer:</strong> Se consumen los 30 min de Colchón de Imprevistos programado.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>2. Poda de Tareas Ligeras:</strong> Se eliminan revisiones prescindibles para mantener el foco en la materia clave.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>3. Santuario Intocable:</strong> La hora de dormir a las <strong>{currentSleepTime}</strong> NO se retrasa ni un minuto.
              </span>
            </div>
          </div>

          {/* Select Delay Duration */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
              ¿Cuánto tiempo te has retrasado?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map(mins => (
                <button
                  key={mins}
                  onClick={() => setDelayMinutes(mins)}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all ${
                    delayMinutes === mins
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  +{mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={() => onTriggerEmergency(delayMinutes)}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reajustando cronograma con Chronos-Academic...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Aplicar Protocolo de Emergencia (+{delayMinutes} min)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
