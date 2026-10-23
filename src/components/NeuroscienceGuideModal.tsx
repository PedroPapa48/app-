import React from 'react';
import { X, Brain, ShieldAlert, Clock, Moon, Check } from 'lucide-react';

interface NeuroscienceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeuroscienceGuideModal: React.FC<NeuroscienceGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Modal Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Leyes de Optimización Cognitiva de Chronos-Academic
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Neurociencia aplicada, cronobiología y método Cal Newport
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {/* Law 1 */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-base">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span>1. Ley de la Curva de Energía Circadiana</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La corteza prefrontal consume glucosa y neurotransmisores a un ritmo no lineal. Las materias más
              abstractas, matemáticas o densas se programan <strong>únicamente en los picos de lucidez biológica</strong> (frecuentemente media mañana o primera hora de la tarde tras la digestión). Nunca tras una comida pesada ni en los últimos 90 minutos de vigilia.
            </p>
          </div>

          {/* Law 2 */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>2. Principio del Margen de Seguridad (Buffer 15-20%)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El error número uno del estudiante promedio es el <em>optimismo de planificación</em> (llenar el 100% del día). Chronos-Academic <strong>inserta bloques vacíos intencionales de 15 a 30 minutos</strong>. Si ocurre un retraso o un concepto toma más tiempo, el buffer lo absorbe sin causar efecto dominó ni estrés.
            </p>
          </div>

          {/* Law 3 */}
          <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-base">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>3. Bloques de Foco Ultradianos & Interleaving</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El cerebro humano opera en ciclos biológicos ultradianos de 90 a 120 minutos, con un punto óptimo de foco sostenido de <strong>45 a 50 minutos</strong>, seguido de <strong>10 minutos de recuperación activa</strong> (cero dopamina barata de redes sociales, agua, caminata y descanso ocular). Además, alternamos materias disímiles (ej. Matemáticas ➔ Historia) para evitar la fatiga sináptica por saturación de la misma red neuronal.
            </p>
          </div>

          {/* Law 4 */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
              <Moon className="w-5 h-5 text-purple-400" />
              <span>4. Protección del Santuario de Descanso</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El aprendizaje no se consolida durante la lectura, sino durante las fases de sueño profundo (ondas lentas) y REM. Trasnochar destruye hasta un 40% de la retención mnemotécnica del día anterior. Se establece una <strong>hora de corte innegociable</strong> con apagón digital 45-60 min antes de dormir.
            </p>
          </div>

          {/* Cal Newport & Neuroscience summary */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400">
            <p>
              💡 <em>"Un horario estructurado con bloques de foco y márgenes realistas no limita la libertad del estudiante; elimina la ansiedad y multiplica por 3 el rendimiento por hora de estudio invertida."</em> — Adaptado del método Deep Work de Cal Newport.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Entendido, volver a mi plan
          </button>
        </div>
      </div>
    </div>
  );
};
