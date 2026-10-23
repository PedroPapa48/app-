import React from 'react';
import { X, Key, CheckCircle2, AlertTriangle, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { ApiStatus } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ApiStatus | null;
  onRefreshStatus: () => void;
  isLoading: boolean;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Estado de la Conexión & Modelo Gemini
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Diagnóstico de Integración y Modo Respaldo
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
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              status?.configured
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : status?.permissionDenied
                ? 'bg-rose-950/25 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
            }`}
          >
            {status?.configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : status?.permissionDenied ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider">
                {status?.configured
                  ? 'API Key Conectada'
                  : status?.permissionDenied
                  ? 'Acceso Denegado (403: PERMISSION_DENIED)'
                  : 'Modo Sin Conexión / Respaldo Activo'}
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {status?.message || 'Verificando estado del servidor...'}
              </p>
            </div>
          </div>

          {/* Model info card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Modelo Configurado:</span>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                {status?.model || 'gemini-3.8-flash'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Protección Anticaídas:</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Autónomo</span>
              </span>
            </div>
          </div>

          {/* Instructions regarding API Key configuration */}
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>¿Cómo se configura la clave de API?</span>
            </div>
            <ul className="space-y-2 list-disc list-inside text-slate-400 pl-1 leading-relaxed">
              <li>
                <strong className="text-slate-200">En Google AI Studio:</strong> Las claves se administran en el panel lateral de <span className="font-mono text-indigo-300">Settings &gt; Secrets</span> bajo el nombre <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-200">GEMINI_API_KEY</code>.
              </li>
              <li>
                <strong className="text-slate-200">En entorno local:</strong> Se encuentra configurado el archivo <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-200">.env</code> en la raíz del proyecto.
              </li>
              <li>
                <strong className="text-slate-200">Modo Demo / Respaldo Automático:</strong> Si tu clave expira o devuelve un error <code className="text-rose-300 font-mono">403 (PERMISSION_DENIED)</code>, Chronos-Academic <strong>nunca se bloqueará</strong>: generará tu plan maestro completo mediante su algoritmo neurocientífico interno.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onRefreshStatus}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Verificar Conexión</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
