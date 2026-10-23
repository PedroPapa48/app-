import React from 'react';
import { Compass, BookOpen, Clock, AlertTriangle, Zap, Volume2, VolumeX, Settings } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface NavbarProps {
  onOpenNeuroGuide: () => void;
  onOpenTakeoff: () => void;
  onOpenTimer: () => void;
  onOpenEmergency: () => void;
  onOpenSettings: () => void;
  hasPlan: boolean;
  isApiConfigured?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNeuroGuide,
  onOpenTakeoff,
  onOpenTimer,
  onOpenEmergency,
  onOpenSettings,
  hasPlan,
  isApiConfigured = false,
}) => {
  const [isPlayingSound, setIsPlayingSound] = React.useState(false);
  const [currentTimeStr, setCurrentTimeStr] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleQuickAmbient = () => {
    if (isPlayingSound) {
      audioEngine.stopSoundscape();
      setIsPlayingSound(false);
    } else {
      audioEngine.startSoundscape('brown_noise');
      setIsPlayingSound(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Chronos-Academic
              </span>
              <span className="text-xs font-mono text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 hidden sm:inline-block">
                Neuro-Estratega
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Gestión del tiempo y rendimiento cognitivo anti-procrastinación
            </p>
          </div>
        </div>

        {/* Status & Action Center */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Soundscape toggle */}
          <button
            onClick={toggleQuickAmbient}
            title={isPlayingSound ? 'Silenciar ruido marrón' : 'Activar ruido marrón para concentración'}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isPlayingSound
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isPlayingSound ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden xl:inline">{isPlayingSound ? 'Ruido Marrón Activo' : 'Audio Focus'}</span>
          </button>

          {/* Current Time Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentTimeStr || '08:30'}</span>
          </div>

          {/* Quick Neuroscience Principles */}
          <button
            onClick={onOpenNeuroGuide}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">4 Leyes</span>
          </button>

          {/* 2-Min Takeoff button */}
          <button
            onClick={onOpenTakeoff}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Despegue 2 Min</span>
          </button>

          {/* Ultradian Timer button */}
          <button
            onClick={onOpenTimer}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reloj Ultradiano</span>
            <span className="md:hidden">Timer</span>
          </button>

          {/* Emergency 1h delay button */}
          {hasPlan && (
            <button
              onClick={onOpenEmergency}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-200 flex items-center gap-1.5 transition-colors"
              title="¿Atraso de 1 hora? Recalcular plan de emergencia"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xl:inline">Atraso (+1h)</span>
            </button>
          )}

          {/* Settings / API Status button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Estado de la conexión Gemini API"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span
              className={`w-2 h-2 rounded-full ${
                isApiConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="hidden lg:inline text-[11px] font-mono">
              {isApiConfigured ? 'API' : 'Demo'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
