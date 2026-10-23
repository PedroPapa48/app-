import React from 'react';
import { EnergyLevel, PeakTime, PresetScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/presets';
import { 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Lock, 
  BookOpen, 
  Moon, 
  BatteryMedium, 
  Sun, 
  Clock, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface InputSectionProps {
  onGeneratePlan: (params: {
    rawInput?: string;
    fixedObligations?: string;
    studyTasks?: string;
    sleepTime: string;
    energyLevel: EnergyLevel;
    peakTime: PeakTime;
    currentTime: string;
  }) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGeneratePlan, isLoading }) => {
  const [tab, setTab] = React.useState<'natural' | 'structured'>('natural');
  const [activePresetId, setActivePresetId] = React.useState<string>(PRESET_SCENARIOS[0].id);

  // Input states
  const [rawInput, setRawInput] = React.useState<string>(PRESET_SCENARIOS[0].rawInput);
  const [fixedObligations, setFixedObligations] = React.useState<string>(PRESET_SCENARIOS[0].fixedObligations);
  const [studyTasks, setStudyTasks] = React.useState<string>(PRESET_SCENARIOS[0].studyTasks);
  const [sleepTime, setSleepTime] = React.useState<string>(PRESET_SCENARIOS[0].sleepTime);
  const [energyLevel, setEnergyLevel] = React.useState<EnergyLevel>(PRESET_SCENARIOS[0].energyLevel);
  const [peakTime, setPeakTime] = React.useState<PeakTime>(PRESET_SCENARIOS[0].peakTime);
  const [currentTime, setCurrentTime] = React.useState<string>('08:00');

  // Load preset scenario and immediately generate the tailored plan
  const handleSelectPreset = (preset: PresetScenario) => {
    setActivePresetId(preset.id);
    setRawInput(preset.rawInput);
    setFixedObligations(preset.fixedObligations);
    setStudyTasks(preset.studyTasks);
    setSleepTime(preset.sleepTime);
    setEnergyLevel(preset.energyLevel);
    setPeakTime(preset.peakTime);

    // Immediately trigger plan generation for instant feedback!
    onGeneratePlan({
      rawInput: preset.rawInput,
      fixedObligations: preset.fixedObligations,
      studyTasks: preset.studyTasks,
      sleepTime: preset.sleepTime,
      energyLevel: preset.energyLevel,
      peakTime: preset.peakTime,
      currentTime,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePresetId('');
    onGeneratePlan({
      rawInput: tab === 'natural' ? rawInput : '',
      fixedObligations: tab === 'structured' ? fixedObligations : '',
      studyTasks: tab === 'structured' ? studyTasks : '',
      sleepTime,
      energyLevel,
      peakTime,
      currentTime,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Banner / Presets */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-0.5">
              Configuración de Entrada
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Ingresa tus obligaciones y metas de hoy
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-xl self-start sm:self-auto border border-slate-700/60">
            <button
              type="button"
              onClick={() => setTab('natural')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                tab === 'natural'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Lenguaje Natural / Caos</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('structured')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                tab === 'structured'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Campos Estructurados</span>
            </button>
          </div>
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] shrink-0">Ejemplos reales:</span>
          {PRESET_SCENARIOS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 transition-all ${
                activePresetId === preset.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/80'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {tab === 'natural' ? (
          /* Natural Language Box */
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              Escribe todo en desorden (clases, tareas, cansancio, horarios)
            </label>
            <div className="relative">
              <textarea
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                rows={5}
                required
                placeholder="Ejemplo: Tengo clases de 9 a 13. Almuerzo rápido. Tengo examen final de Cálculo pasado mañana y debo entregar un informe de Física antes de medianoche. Me siento con energía media..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Chronos-Academic no se detendrá ante datos incompletos: deducirá lo obvio, aplicará márgenes prudentes e interleaving para generar tu plan de inmediato.
            </p>
          </div>
        ) : (
          /* Structured Inputs */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fixed Obligations */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>1. Obligaciones fijas e inamovibles</span>
              </label>
              <textarea
                value={fixedObligations}
                onChange={e => setFixedObligations(e.target.value)}
                rows={3}
                placeholder="09:00 - 13:00 Clases en universidad&#10;13:00 - 14:00 Almuerzo"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
              />
            </div>

            {/* Study Tasks */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. Lo que debes estudiar / entregar</span>
              </label>
              <textarea
                value={studyTasks}
                onChange={e => setStudyTasks(e.target.value)}
                rows={3}
                placeholder="Cálculo II (Series de Taylor) - Examen viernes&#10;Informe de Física - Entrega hoy 23:59"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Common Parameters Row (Circadian & Neuro-parameters) */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-3">
            3. Parámetros Biológicos & Límites Personales
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Hora límite para dormir (Innegociable) */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
              <label className="text-xs text-purple-300 font-medium flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                <span>Hora Límite de Dormir</span>
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={e => setSleepTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400 block font-mono">
                Innegociable (Santuario)
              </span>
            </div>

            {/* Nivel de energía actual */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
              <label className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                <BatteryMedium className="w-3.5 h-3.5 text-amber-400" />
                <span>Nivel de Energía Actual</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Bajo', 'Medio', 'Alto'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      energyLevel === lvl
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                Regula la longitud de bloques
              </span>
            </div>

            {/* Momento de mayor lucidez */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
              <label className="text-xs text-indigo-300 font-medium flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pico de Mayor Lucidez</span>
              </label>
              <select
                value={peakTime}
                onChange={e => setPeakTime(e.target.value as PeakTime)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Mañana temprana (06:00 - 10:00)">Mañana temprana (06-10h)</option>
                <option value="Media mañana (10:00 - 14:00)">Media mañana (10-14h)</option>
                <option value="Tarde (14:00 - 18:00)">Tarde (14-18h)</option>
                <option value="Noche (18:00 - 22:00)">Noche (18-22h)</option>
              </select>
              <span className="text-[10px] text-slate-400 block font-mono">
                Curva de Energía (Ley 1)
              </span>
            </div>

            {/* Hora de inicio de jornada */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
              <label className="text-xs text-teal-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Hora de Inicio / Actual</span>
              </label>
              <input
                type="time"
                value={currentTime}
                onChange={e => setCurrentTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-400 block font-mono">
                Punto de arranque del día
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all transform active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Chronos-Academic está calculando el Plan Maestro...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generar Plan Maestro Diario</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
