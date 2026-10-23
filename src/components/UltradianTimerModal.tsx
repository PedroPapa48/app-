import React from 'react';
import { X, Play, Pause, RotateCcw, Clock, Coffee, Brain, Volume2, Check } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import confetti from 'canvas-confetti';

interface UltradianTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTaskTitle?: string;
  initialDurationMinutes?: number;
}

type Mode = '50_10' | '25_5' | '90_15';
type Phase = 'focus' | 'break';

export const UltradianTimerModal: React.FC<UltradianTimerModalProps> = ({
  isOpen,
  onClose,
  initialTaskTitle = 'Sesión de Foco Profundo',
  initialDurationMinutes = 50,
}) => {
  const [mode, setMode] = React.useState<Mode>('50_10');
  const [phase, setPhase] = React.useState<Phase>('focus');
  const [secondsLeft, setSecondsLeft] = React.useState(50 * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [soundMode, setSoundMode] = React.useState<'none' | 'brown_noise' | 'binaural_40hz' | 'rain'>('brown_noise');
  const [taskName, setTaskName] = React.useState(initialTaskTitle);

  // Active rest checklist state
  const [restChecks, setRestChecks] = React.useState({
    screens: false,
    water: false,
    stretch: false,
    horizon: false,
  });

  const getPhaseDuration = (currentMode: Mode, currentPhase: Phase): number => {
    if (currentMode === '50_10') return currentPhase === 'focus' ? 50 * 60 : 10 * 60;
    if (currentMode === '25_5') return currentPhase === 'focus' ? 25 * 60 : 5 * 60;
    return currentPhase === 'focus' ? 90 * 60 : 15 * 60;
  };

  React.useEffect(() => {
    if (isOpen) {
      if (initialDurationMinutes === 10) {
        setPhase('break');
        setSecondsLeft(10 * 60);
      } else {
        setPhase('focus');
        setSecondsLeft(getPhaseDuration(mode, 'focus'));
      }
      if (initialTaskTitle) setTaskName(initialTaskTitle);
    } else {
      setIsRunning(false);
      audioEngine.stopSoundscape();
    }
  }, [isOpen, initialTaskTitle, initialDurationMinutes]);

  React.useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      // Phase completed!
      audioEngine.playCompletionChime();
      if (phase === 'focus') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        setPhase('break');
        setSecondsLeft(getPhaseDuration(mode, 'break'));
        audioEngine.stopSoundscape();
        setRestChecks({ screens: false, water: false, stretch: false, horizon: false });
      } else {
        setPhase('focus');
        setSecondsLeft(getPhaseDuration(mode, 'focus'));
        if (soundMode !== 'none') audioEngine.startSoundscape(soundMode);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, phase, mode, soundMode]);

  const handleToggle = () => {
    if (!isRunning) {
      setIsRunning(true);
      if (phase === 'focus' && soundMode !== 'none') {
        audioEngine.startSoundscape(soundMode);
      }
    } else {
      setIsRunning(false);
      audioEngine.stopSoundscape();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    audioEngine.stopSoundscape();
    setSecondsLeft(getPhaseDuration(mode, phase));
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    audioEngine.stopSoundscape();
    setSecondsLeft(getPhaseDuration(newMode, phase));
  };

  const handleSoundChange = (newSound: 'none' | 'brown_noise' | 'binaural_40hz' | 'rain') => {
    setSoundMode(newSound);
    if (isRunning && phase === 'focus') {
      if (newSound === 'none') {
        audioEngine.stopSoundscape();
      } else {
        audioEngine.startSoundscape(newSound);
      }
    }
  };

  const switchPhaseManually = (newPhase: Phase) => {
    setPhase(newPhase);
    setIsRunning(false);
    audioEngine.stopSoundscape();
    setSecondsLeft(getPhaseDuration(mode, newPhase));
  };

  if (!isOpen) return null;

  const totalPhaseSec = getPhaseDuration(mode, phase);
  const progressPercent = ((totalPhaseSec - secondsLeft) / totalPhaseSec) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 blur-3xl pointer-events-none ${
            phase === 'focus' ? 'bg-indigo-500/20' : 'bg-teal-500/20'
          }`}
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                phase === 'focus' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-teal-500/20 text-teal-400'
              }`}
            >
              {phase === 'focus' ? <Brain className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {phase === 'focus' ? 'Ciclo Ultradiano de Foco Profundo' : 'Recuperación Activa (Desconexión)'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {phase === 'focus' ? 'Ley 3: Sesión sin distracciones' : 'Ley 3: Recarga de receptores sinápticos'}
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

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Preset Cycle Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg">
              <button
                onClick={() => handleModeChange('50_10')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  mode === '50_10' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                50 / 10m (Recomendado)
              </button>
              <button
                onClick={() => handleModeChange('25_5')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  mode === '25_5' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                25 / 5m (Pomodoro)
              </button>
              <button
                onClick={() => handleModeChange('90_15')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  mode === '90_15' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                90 / 15m (K. Anders Ericsson)
              </button>
            </div>

            {/* Phase toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg">
              <button
                onClick={() => switchPhaseManually('focus')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  phase === 'focus' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Brain className="w-3 h-3" />
                <span>Foco</span>
              </button>
              <button
                onClick={() => switchPhaseManually('break')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  phase === 'break' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Coffee className="w-3 h-3" />
                <span>Pausa</span>
              </button>
            </div>
          </div>

          {/* Active task input */}
          <div className="text-center">
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="¿Qué estás trabajando en este bloque?"
              className="text-center text-sm font-semibold text-slate-100 bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Big timer circle */}
          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="104"
                  cy="104"
                  r="92"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="104"
                  cy="104"
                  r="92"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={578}
                  strokeDashoffset={578 - (578 * progressPercent) / 100}
                  className={`transition-all duration-300 ${
                    phase === 'focus' ? 'text-indigo-500' : 'text-teal-400'
                  }`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-mono font-extrabold text-white tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span
                  className={`text-xs font-mono uppercase tracking-wider font-semibold mt-2 px-2.5 py-0.5 rounded-full ${
                    phase === 'focus'
                      ? 'text-indigo-300 bg-indigo-950/60 border border-indigo-800'
                      : 'text-teal-300 bg-teal-950/60 border border-teal-800'
                  }`}
                >
                  {phase === 'focus' ? 'Enfoque Profundo' : 'Pausa Activa'}
                </span>
              </div>
            </div>
          </div>

          {/* If break phase: Active recovery checklist */}
          {phase === 'break' && (
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-2">
              <div className="text-xs font-mono text-teal-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                <span>Protocolo de Recuperación Activa:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {[
                  { key: 'screens', label: '1. Desconecta pantallas totalmente' },
                  { key: 'water', label: '2. Bebe 250ml de agua fresca' },
                  { key: 'stretch', label: '3. Levántate y estira cuello/espalda' },
                  { key: 'horizon', label: '4. Mira al horizonte (descanso ocular)' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() =>
                      setRestChecks(p => ({ ...p, [item.key]: !p[item.key as keyof typeof restChecks] }))
                    }
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                      restChecks[item.key as keyof typeof restChecks]
                        ? 'bg-teal-900/40 border-teal-500/50 text-teal-200'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        restChecks[item.key as keyof typeof restChecks]
                          ? 'bg-teal-500 border-teal-400 text-slate-950'
                          : 'border-slate-600'
                      }`}
                    >
                      {restChecks[item.key as keyof typeof restChecks] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sound Selector (for Focus) */}
          {phase === 'focus' && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Volume2 className="w-3.5 h-3.5" /> Audio:
              </span>
              {(['none', 'brown_noise', 'binaural_40hz', 'rain'] as const).map(snd => (
                <button
                  key={snd}
                  onClick={() => handleSoundChange(snd)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                    soundMode === snd
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {snd === 'none'
                    ? 'Silencio'
                    : snd === 'brown_noise'
                    ? 'Ruido Marrón'
                    : snd === 'binaural_40hz'
                    ? 'Gamma 40Hz'
                    : 'Lluvia'}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleToggle}
              className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                isRunning
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : phase === 'focus'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
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
                  <span>{secondsLeft === totalPhaseSec ? 'Iniciar Bloque' : 'Reanudar'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reiniciar bloque"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
