/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlanData, ScheduleBlock, ApiStatus } from './types';
import { PRESET_SCENARIOS } from './data/presets';
import { Navbar } from './components/Navbar';
import { InputSection } from './components/InputSection';
import { DiagnosticCard } from './components/DiagnosticCard';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { MarkdownTableView } from './components/MarkdownTableView';
import { TwoMinuteTakeoffModal } from './components/TwoMinuteTakeoffModal';
import { UltradianTimerModal } from './components/UltradianTimerModal';
import { EmergencyModal } from './components/EmergencyModal';
import { NeuroscienceGuideModal } from './components/NeuroscienceGuideModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { 
  Calendar, 
  Table, 
  Activity, 
  Zap, 
  Sparkles, 
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function App() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'timeline' | 'markdown' | 'neuro'>('timeline');

  // Modals state
  const [isTakeoffOpen, setIsTakeoffOpen] = useState<boolean>(false);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isNeuroGuideOpen, setIsNeuroGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Task targets for modals
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [timerDuration, setTimerDuration] = useState<number>(50);
  const [planUpdatedMessage, setPlanUpdatedMessage] = useState<string | null>(null);
  const planSectionRef = React.useRef<HTMLElement | null>(null);

  // Last input parameters for emergency rescheduling
  const [lastParams, setLastParams] = useState<any>({
    rawInput: PRESET_SCENARIOS[0].rawInput,
    sleepTime: PRESET_SCENARIOS[0].sleepTime,
    energyLevel: PRESET_SCENARIOS[0].energyLevel,
    peakTime: PRESET_SCENARIOS[0].peakTime,
    currentTime: '08:00',
  });

  // Check API status
  const fetchStatus = async (isRefresh = false) => {
    setIsStatusLoading(true);
    try {
      const res = await fetch(`/api/chronos/status${isRefresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch (e) {
      console.warn('Error fetching API status:', e);
    } finally {
      setIsStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Initial load: generate plan with preset 0
  useEffect(() => {
    handleGeneratePlan({
      rawInput: PRESET_SCENARIOS[0].rawInput,
      sleepTime: PRESET_SCENARIOS[0].sleepTime,
      energyLevel: PRESET_SCENARIOS[0].energyLevel,
      peakTime: PRESET_SCENARIOS[0].peakTime,
      currentTime: '08:00',
    });
  }, []);

  const handleGeneratePlan = async (params: any) => {
    setIsLoading(true);
    setError(null);
    setLastParams(params);

    try {
      const response = await fetch('/api/chronos/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure schedule blocks have unique IDs and completion states
      const formattedBlocks: ScheduleBlock[] = (data.scheduleBlocks || []).map(
        (b: any, index: number) => ({
          ...b,
          id: b.id || `block-${index}-${b.startTime}`,
          completed: false,
        })
      );

      const timeNow = new Date().toLocaleTimeString();
      setPlan({
        ...data,
        scheduleBlocks: formattedBlocks,
        generatedAt: timeNow,
      });

      setPlanUpdatedMessage(`Plan Maestro Diario actualizado a las ${timeNow}`);
      setTimeout(() => setPlanUpdatedMessage(null), 6000);

      // Smooth scroll to the updated plan
      setTimeout(() => {
        planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Error generating plan:', err);
      setError('Hubo un problema de conexión con el estratega AI. Mostrando plan de optimización algorítmico.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlockComplete = (blockId: string) => {
    if (!plan) return;
    setPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        scheduleBlocks: prev.scheduleBlocks.map(b =>
          b.id === blockId ? { ...b, completed: !b.completed } : b
        ),
      };
    });
  };

  const handleLaunchTakeoff = (taskTitle?: string) => {
    if (taskTitle) setSelectedTask(taskTitle);
    else if (plan?.scheduleBlocks) {
      const firstDeep = plan.scheduleBlocks.find(b => b.category === 'deep_work');
      setSelectedTask(firstDeep?.title || 'Primera tarea de estudio');
    }
    setIsTakeoffOpen(true);
  };

  const handleLaunchTimer = (taskTitle?: string, duration: number = 50) => {
    if (taskTitle) setSelectedTask(taskTitle);
    setTimerDuration(duration);
    setIsTimerOpen(true);
  };

  const handleEmergencyProtocol = async (delayMinutes: number) => {
    setIsEmergencyOpen(false);
    await handleGeneratePlan({
      ...lastParams,
      emergencyDelayMinutes: delayMinutes,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onOpenNeuroGuide={() => setIsNeuroGuideOpen(true)}
        onOpenTakeoff={() => handleLaunchTakeoff()}
        onOpenTimer={() => handleLaunchTimer()}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasPlan={!!plan}
        isApiConfigured={apiStatus?.configured}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Fallback Non-Blocking Alert requested by user */}
        {plan?.isFallback && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-white text-sm">
                  Mostrando plan generado en modo sin conexión / demo debido a un problema con la clave de API
                </div>
                <div className="text-slate-300 text-xs leading-relaxed">
                  {plan.fallbackReason || 'Plan maestro generado con el motor neurocognitivo adaptado a tus materias ingresadas.'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 text-xs transition-colors flex items-center gap-1.5"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Ver Diagnóstico</span>
              </button>
            </div>
          </div>
        )}

        {/* Generic Error notification banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="font-mono underline hover:text-white"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Input & Parameters Section */}
        <section>
          <InputSection
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
          />
        </section>

        {/* Plan Output Presentation */}
        {plan && (
          <section ref={planSectionRef} className="space-y-6 animate-in fade-in duration-300 scroll-mt-20">
            {/* Live Update Success Toast */}
            {planUpdatedMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span>{planUpdatedMessage}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-300/80 hidden sm:inline">
                  Horarios y materias recalculados
                </span>
              </div>
            )}

            {/* Quick Diagnostic Card */}
            <DiagnosticCard
              plan={plan}
              onOpenTakeoff={() => handleLaunchTakeoff()}
            />

            {/* View Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'timeline'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Time-Blocking Interactivo</span>
                </button>

                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'markdown'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Formato Oficial (Tabla & Markdown)</span>
                </button>

                <button
                  onClick={() => setActiveTab('neuro')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'neuro'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Curva Cognitiva Circadiana</span>
                </button>
              </div>

              {/* Quick launch takeoff pill */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchTakeoff()}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>¿Procrastinando la 1ª tarea? Pulsa aquí</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'timeline' && (
              <ScheduleTimeline
                blocks={plan.scheduleBlocks}
                onToggleComplete={handleToggleBlockComplete}
                onLaunchTakeoffForTask={handleLaunchTakeoff}
                onLaunchTimerForTask={handleLaunchTimer}
              />
            )}

            {activeTab === 'markdown' && (
              <MarkdownTableView plan={plan} />
            )}

            {activeTab === 'neuro' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span>Alineación de tu Plan con la Curva de Energía Circadiana</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Por qué cada materia fue asignada a esa hora específica según la neurobiología de la atención.
                  </p>
                </div>

                {/* Circadian timeline visualization */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Period 1 */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
                      <span>06:00 - 12:00</span>
                      <span className="font-bold">Cortisol & Alerta</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      Pico de Foco 1 (Eat That Frog)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Máxima concentración de dopamina y noradrenalina. La corteza prefrontal resuelve problemas abstractos, teoremas y redacción densa.
                    </p>
                  </div>

                  {/* Period 2 */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                      <span>12:00 - 15:00</span>
                      <span className="font-bold">Bajón Circadiano</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      Digestión & Recarga Mental
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      La temperatura corporal desciende naturalmente. Se programan comidas, caminatas y pausa activa para evitar el colapso cognitivo.
                    </p>
                  </div>

                  {/* Period 3 */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-teal-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-teal-400">
                      <span>15:00 - 19:00</span>
                      <span className="font-bold">Segundo Pico</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      Interleaving & Práctica Activa
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Excelente capacidad ejecutiva para alternar a una segunda materia diferente, resolver ejercicios guiados o avanzar entregas.
                    </p>
                  </div>

                  {/* Period 4 */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-purple-400">
                      <span>20:00 - Noche</span>
                      <span className="font-bold">Subida de Melatonina</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      Santuario de Sueño
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      La presión de adenosina induce el sueño profundo donde el hipocampo transfiere lo aprendido a la corteza para fijar la memoria permanente.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong>Conclusión Estratégica:</strong> Tu plan maestro actual no te exige fuerza de voluntad sobrehumana; aprovecha tus oscilaciones biológicas naturales para estudiar en la mitad de tiempo con el doble de retención.
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Chronos-Academic © 2026 · Estratega de Gestión del Tiempo & Rendimiento Cognitivo
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Neurociencia Aplicada</span>
            <span>·</span>
            <span>Cal Newport Time-Blocking</span>
            <span>·</span>
            <span>Recuperación Activa</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TwoMinuteTakeoffModal
        isOpen={isTakeoffOpen}
        onClose={() => setIsTakeoffOpen(false)}
        microStep={plan?.twoMinuteTakeoff}
        taskTitle={selectedTask || 'Primera tarea de estudio'}
      />

      <UltradianTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialTaskTitle={selectedTask || 'Bloque de Foco Profundo'}
        initialDurationMinutes={timerDuration}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onTriggerEmergency={handleEmergencyProtocol}
        isLoading={isLoading}
        currentSleepTime={lastParams.sleepTime || '23:00'}
      />

      <NeuroscienceGuideModal
        isOpen={isNeuroGuideOpen}
        onClose={() => setIsNeuroGuideOpen(false)}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={apiStatus}
        onRefreshStatus={() => fetchStatus(true)}
        isLoading={isStatusLoading}
      />
    </div>
  );
}
