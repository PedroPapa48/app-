import React from 'react';
import { X, Play, Pause, RotateCcw, Zap, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import confetti from 'canvas-confetti';

interface TwoMinuteTakeoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  microStep?: string;
  taskTitle?: string;
}

export const TwoMinuteTakeoffModal: React.FC<TwoMinuteTakeoffModalProps> = ({
  isOpen,
  onClose,
  microStep = 'Abre el archivo o cuaderno correspondiente. Escribe únicamente la fecha o el primer título. Deja el lápiz al lado y bebe un sorbo de agua.',
  taskTitle = 'Primera Tarea de Foco',
}) => {
  const [secondsLeft, setSecondsLeft] = React.useState(120);
  const [isRunning, setIsRunning] = React.useState(false);
  const [hasFinished, setHasFinished] = React.useState(false);
  const [soundMode, setSoundMode] = React.useState<'none' | 'brown_noise' | 'binaural_40hz'>('none');

  React.useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSecondsLeft(120);
      setHasFinished(false);
      audioEngine.stopSoundscape();
      return;
    }
  }, [isOpen]);

  React.useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setHasFinished(true);
      audioEngine.stopSoundscape();
      audioEngine.playCompletionChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleToggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      if (soundMode !== 'none') {
        audioEngine.startSoundscape(soundMode);
      }
    } else {
      setIsRunning(false);
      audioEngine.stopSoundscape();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(120);
    setHasFinished(false);
    audioEngine.stopSoundscape();
  };

  const handleSoundChange = (newSound: 'none' | 'brown_noise' | 'binaural_40hz') => {
    setSoundMode(newSound);
    if (isRunning) {
      if (newSound === 'none') {
        audioEngine.stopSoundscape();
      } else {
        audioEngine.startSoundscape(newSound);
      }
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((120 - secondsLeft) / 120) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Despegue Inmediato (Técnica 2 Minutos)
              </h3>
              <p className="text-xs text-amber-400/80 font-mono">
                Vence la resistencia del ganglio basal
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
        <div className="p-6 space-y-6 text-center">
          {/* Target task badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <span>Objetivo actual:</span>
            <strong className="text-white truncate max-w-xs">{taskTitle}</strong>
          </div>

          {/* Micro-step instruction callout */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left">
            <div className="text-xs font-mono uppercase text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Micro-Paso Ridículamente Fácil:</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {microStep}
            </p>
            <div className="mt-2 text-[11px] text-slate-400 italic">
              *No te comprometas a terminar nada. Solo haz este micro-movimiento físico durante 120 segundos.
            </div>
          </div>

          {/* Big countdown clock */}
          <div className="relative py-4 flex flex-col items-center justify-center">
            {/* Circular progress bar */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={477.5}
                  strokeDashoffset={477.5 - (477.5 * progressPercent) / 100}
                  className="text-amber-400 transition-all duration-300"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-mono font-extrabold text-white tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">
                  {hasFinished ? '¡Inercia Vencida!' : isRunning ? 'Fluyendo...' : 'Listo'}
                </span>
              </div>
            </div>
          </div>

          {/* Success state */}
          {hasFinished && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>¡La fricción inicial está rota! Tu cerebro ya está en modo foco. Continúa a tu ritmo.</span>
            </div>
          )}

          {/* Sound Selector */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Volume2 className="w-3.5 h-3.5" /> Audio:
            </span>
            {(['none', 'brown_noise', 'binaural_40hz'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleSoundChange(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  soundMode === mode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'none' ? 'Silencio' : mode === 'brown_noise' ? 'Ruido Marrón' : 'Gamma 40Hz'}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleToggleTimer}
              className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                isRunning
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{secondsLeft === 120 ? 'Iniciar 2 Minutos' : 'Reanudar'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reiniciar a 2 minutos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
