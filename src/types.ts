export type ScheduleType = 
  | '🔒 Fijo'
  | '🧠 Foco Profundo'
  | '📝 Tarea Ligera'
  | '☕ Pausa Activa'
  | '🛡️ Colchón de Imprevistos'
  | '🎮 Ocio Libre'
  | '🍽️ Recarga'
  | '🟢 Rutina'
  | '🌙 Cierre';

export type BlockCategory =
  | 'fixed'
  | 'deep_work'
  | 'light_task'
  | 'break'
  | 'buffer'
  | 'leisure'
  | 'meal'
  | 'routine'
  | 'sleep';

export interface ScheduleBlock {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: ScheduleType;
  title: string;
  strategy: string;
  category: BlockCategory;
  completed?: boolean;
}

export type EnergyLevel = 'Bajo' | 'Medio' | 'Alto';
export type PeakTime = 'Mañana temprana (06:00 - 10:00)' | 'Media mañana (10:00 - 14:00)' | 'Tarde (14:00 - 18:00)' | 'Noche (18:00 - 22:00)';

export interface PlanData {
  markdownContent: string;
  scheduleBlocks: ScheduleBlock[];
  viabilityIndex: string;
  keyFocus: string;
  twoMinuteTakeoff: string;
  emergencyRule: string;
  generatedAt?: string;
  isFallback?: boolean;
  fallbackReason?: string;
  errorCode?: 'PERMISSION_DENIED' | 'MISSING_API_KEY' | 'API_ERROR' | string;
}

export interface ApiStatus {
  configured: boolean;
  model: string;
  keyPresent: boolean;
  permissionDenied?: boolean;
  message: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  tagline: string;
  rawInput: string;
  fixedObligations: string;
  studyTasks: string;
  sleepTime: string;
  energyLevel: EnergyLevel;
  peakTime: PeakTime;
}
