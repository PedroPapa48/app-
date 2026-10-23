import React from 'react';
import { ScheduleBlock, ScheduleType } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Zap, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleTimelineProps {
  blocks: ScheduleBlock[];
  onToggleComplete: (id: string) => void;
  onLaunchTakeoffForTask: (taskTitle: string) => void;
  onLaunchTimerForTask: (taskTitle: string, durationMinutes: number) => void;
}

const TYPE_CONFIG: Record<
  ScheduleType,
  {
    border: string;
    bg: string;
    text: string;
    tagClass: string;
    desc: string;
  }
> = {
  '🔒 Fijo': {
    border: 'border-slate-600',
    bg: 'bg-slate-800/40',
    text: 'text-slate-200',
    tagClass: 'text-slate-400 bg-slate-800/80 border-slate-700',
    desc: 'Obligación inamovible',
  },
  '🧠 Foco Profundo': {
    border: 'border-indigo-500/70',
    bg: 'bg-indigo-950/30',
    text: 'text-indigo-100',
    tagClass: 'text-indigo-300 bg-indigo-900/50 border-indigo-700/60',
    desc: 'Máxima demanda cognitiva ultradiana',
  },
  '📝 Tarea Ligera': {
    border: 'border-sky-500/50',
    bg: 'bg-sky-950/20',
    text: 'text-sky-100',
    tagClass: 'text-sky-300 bg-sky-900/40 border-sky-700/50',
    desc: 'Baja fricción / revisión activa',
  },
  '☕ Pausa Activa': {
    border: 'border-teal-500/60',
    bg: 'bg-teal-950/20',
    text: 'text-teal-100',
    tagClass: 'text-teal-300 bg-teal-900/40 border-teal-700/50',
    desc: 'Desconexión sin pantallas',
  },
  '🛡️ Colchón de Imprevistos': {
    border: 'border-amber-500/60',
    bg: 'bg-amber-950/20',
    text: 'text-amber-100',
    tagClass: 'text-amber-300 bg-amber-900/40 border-amber-700/50',
    desc: 'Buffer anti-colapso 15-20%',
  },
  '🎮 Ocio Libre': {
    border: 'border-purple-500/50',
    bg: 'bg-purple-950/20',
    text: 'text-purple-100',
    tagClass: 'text-purple-300 bg-purple-900/40 border-purple-700/50',
    desc: 'Recarga dopaminérgica sin culpa',
  },
  '🍽️ Recarga': {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-100',
    tagClass: 'text-emerald-300 bg-emerald-900/40 border-emerald-700/50',
    desc: 'Nutrición e hidratación',
  },
  '🟢 Rutina': {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/15',
    text: 'text-emerald-200',
    tagClass: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/40',
    desc: 'Anclaje matutino / vespertino',
  },
  '🌙 Cierre': {
    border: 'border-indigo-400/60',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-200',
    tagClass: 'text-indigo-300 bg-indigo-900/60 border-indigo-700/60',
    desc: 'Santuario de descanso sin pantallas',
  },
};

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  blocks,
  onToggleComplete,
  onLaunchTakeoffForTask,
  onLaunchTimerForTask,
}) => {
  const [currentTimeMinutes, setCurrentTimeMinutes] = React.useState<number>(0);

  React.useEffect(() => {
    const updateNow = () => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());
    };
    updateNow();
    const timer = setInterval(updateNow, 30000);
    return () => clearInterval(timer);
  }, []);

  const completedCount = blocks.filter(b => b.completed).length;
  const progressPercent = blocks.length > 0 ? Math.round((completedCount / blocks.length) * 100) : 0;

  const handleToggle = (id: string, currentlyCompleted?: boolean) => {
    if (!currentlyCompleted) {
      // Small celebratory burst
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
    onToggleComplete(id);
  };

  return (
    <div className="space-y-4">
      {/* Progress & Summary Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Progreso del Día</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-full">
              {completedCount} de {blocks.length} bloques
            </span>
          </div>
        </div>

        {/* Progress track */}
        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 w-9 text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Timeline blocks list */}
      <div className="space-y-3 relative">
        {blocks.map((block, index) => {
          const config = TYPE_CONFIG[block.type] || TYPE_CONFIG['🧠 Foco Profundo'];
          const [sh, sm] = block.startTime.split(':').map(Number);
          const [eh, em] = block.endTime.split(':').map(Number);
          const startMin = sh * 60 + sm;
          const endMin = eh * 60 + em;
          const isCurrent = currentTimeMinutes >= startMin && currentTimeMinutes < endMin;
          const isDeepWork = block.category === 'deep_work';

          return (
            <div
              key={block.id || `${block.startTime}-${index}`}
              className={`group relative rounded-xl border transition-all duration-200 ${config.bg} ${
                block.completed
                  ? 'border-slate-800/80 opacity-60 bg-slate-900/60'
                  : isCurrent
                  ? 'ring-2 ring-indigo-400 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : `${config.border} hover:border-slate-500`
              }`}
            >
              {/* "Estás Aquí" banner if current block */}
              {isCurrent && !block.completed && (
                <div className="absolute -top-3 left-4 bg-indigo-500 text-slate-950 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>En curso ahora</span>
                </div>
              )}

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Checkbox + Time + Title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(block.id, block.completed)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    title={block.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    {/* Time range + Type badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        {block.startTime} - {block.endTime}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${config.tagClass}`}>
                        {block.type}
                      </span>
                    </div>

                    {/* Block Title */}
                    <h3
                      className={`text-base font-semibold text-white tracking-tight break-words ${
                        block.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {block.title}
                    </h3>

                    {/* Instruction / Strategy */}
                    <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
                      <span className="font-mono text-slate-400 mr-1.5">Estrategia:</span>
                      {block.strategy}
                    </p>
                  </div>
                </div>

                {/* Right: Quick Action Launchers for Deep Work or Light Tasks */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 w-full sm:w-auto justify-end">
                  {isDeepWork && !block.completed && (
                    <>
                      <button
                        onClick={() => onLaunchTakeoffForTask(block.title)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-all"
                        title="Vence la resistencia con la Técnica de los 2 Minutos"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Despegue 2 Min</span>
                      </button>

                      <button
                        onClick={() => onLaunchTimerForTask(block.title, 50)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-1 transition-all"
                        title="Iniciar sesión ultradiana de 50 minutos con pausa activa"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Foco 50m</span>
                      </button>
                    </>
                  )}

                  {block.category === 'break' && !block.completed && (
                    <button
                      onClick={() => onLaunchTimerForTask('Pausa Activa de Recuperación', 10)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center gap-1 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Timer 10m</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
