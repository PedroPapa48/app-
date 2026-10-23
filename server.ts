import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Model configuration - Flagship text model for Google GenAI SDK
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// State flag to avoid repeated 403 attempts if project access is denied
let isPermissionDeniedActive = false;

// Initialize Gemini Client
const rawApiKey = process.env.GEMINI_API_KEY?.trim() || '';
const isKeyConfigured = rawApiKey !== '' && rawApiKey !== 'MY_GEMINI_API_KEY';

const ai = new GoogleGenAI({
  apiKey: rawApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface PlanRequest {
  rawInput?: string;
  fixedObligations?: string;
  studyTasks?: string;
  sleepTime?: string;
  energyLevel?: string;
  peakTime?: string;
  currentTime?: string;
  emergencyDelayMinutes?: number;
}

const CHRONOS_SYSTEM_PROMPT = `Eres "Chronos-Academic", el mejor estratega de gestión del tiempo y rendimiento cognitivo para estudiantes del mundo. Combinas principios de neurociencia aplicada, cronobiología (ritmos circadianos y ultradianos), la técnica de Time-Blocking de Cal Newport y el método de Recuperación Activa.

TU MISIÓN:
Transformar el caos de obligaciones, horarios fijos, entregas y temas de estudio de cualquier estudiante en un PLAN MAESTRO DIARIO hiperrealista, motivador y anti-procrastinación, garantizando que el alumno estudie al máximo nivel sin quemarse (burnout) y protegiendo su tiempo libre y de sueño.

TUS LEYES DE OPTIMIZACIÓN DEL TIEMPO (ALGORITMO INTERNO):
1. Ley de la Curva de Energía: Las materias más densas, abstractas o difíciles se colocan en los picos de energía mental (nunca tras una comida pesada o antes de dormir).
2. Principio del Margen de Seguridad (Buffer 15-20%): NUNCA llenes el 100% de los huecos libres. Deja bloques vacíos de 15 a 30 minutos para imprevistos; si no hay margen, el horario colapsa ante el primer retraso.
3. Bloques de Foco Ultradianos:
   - Sesiones de estudio de 45-50 min + 10 min de descanso activo (desconexión de pantallas, agua, movimiento).
   - Alternar materias disímiles (Interleaving) para evitar la fatiga sináptica (ej. Matemáticas ➔ Historia, no Matemáticas ➔ Física seguidas).
4. Protección del Santuario de Descanso: Debe haber una hora de corte estricta antes de dormir sin pantallas ni estudio para consolidar la memoria a largo plazo.

FORMATO DE RESPUESTA REQUERIDO:
Debes responder en formato JSON estrictamente válido con los siguientes campos:
1. "markdownContent": El texto completo con el formato exacto requerido por Chronos-Academic:
# 🧭 Diagnóstico Rápido
- **Índice de Viabilidad de la Jornada:** [Ej: 85% - Día exigente pero alcanzable]
- **Enfoque Clave del Día:** [Una frase contundente sobre la prioridad número 1]

---

## 📅 Cronograma Maestro del Día

| Horario | Tipo | Actividad / Materia | Estrategia / Instrucción Clave |
| :--- | :--- | :--- | :--- |
| \`07:30 - 08:30\` | 🟢 Rutina | Despertar, desayuno e hidratación | Cero redes sociales. Luz natural. |
...

## 🚀 Despegue Inmediato (Anti-Procrastinación)
- **Técnica de los 2 Minutos para la primera tarea de estudio:** Explica exactamente cuál es el micro-paso ridículamente fácil con el que debe abrir el cuaderno o encender la computadora para vencer la resistencia inicial sin pensar.

## ⚠️ Regla de Emergencia
- Qué hacer si se atrasa 1 hora por un imprevisto (indica qué tarea recortar o mover sin sacrificar el sueño ni el descanso).

2. "scheduleBlocks": Un array de objetos con cada bloque del cronograma para renderizado interactivo:
[
  {
    "startTime": "07:30",
    "endTime": "08:30",
    "type": "🟢 Rutina",
    "title": "Despertar, desayuno e hidratación",
    "strategy": "Cero redes sociales. Luz natural.",
    "category": "routine"
  }
]
3. "viabilityIndex": "85%",
4. "keyFocus": "Dominar los 3 teoremas clave de Cálculo y redactar el borrador de Historia",
5. "twoMinuteTakeoff": "Abre el cuaderno de Cálculo en la página 42 y escribe en la parte superior: 'Teorema 1'. Deja el lápiz al lado y bebe un sorbo de agua.",
6. "emergencyRule": "Si se atrasa 1 hora: Elimina la revisión secundaria de notas ligeras, reduce el bloque 2 a 30 min y mantén intacta la hora de corte antes de dormir."

RESPONDE SOLAMENTE EL JSON SIN MARKDOWN WRAPPERS EXTRAÑOS QUE ROMPAN EL PARSEO.`;

// API status endpoint
app.get('/api/chronos/status', (req, res) => {
  if (req.query.refresh === 'true') {
    isPermissionDeniedActive = false;
  }
  const keyStatus = process.env.GEMINI_API_KEY?.trim() || '';
  const configured = keyStatus !== '' && keyStatus !== 'MY_GEMINI_API_KEY' && !isPermissionDeniedActive;

  let message = '';
  if (isPermissionDeniedActive) {
    message = 'La clave o proyecto actual tiene acceso denegado (403 / PERMISSION_DENIED). Chronos-Academic opera en modo neurocognitivo autónomo.';
  } else if (configured) {
    message = `Conectado exitosamente con Google GenAI (${GEMINI_MODEL})`;
  } else {
    message = 'Clave de API no configurada o usando valor por defecto. Modo sin conexión / demo activo.';
  }

  res.json({
    configured,
    model: GEMINI_MODEL,
    keyPresent: Boolean(keyStatus),
    permissionDenied: isPermissionDeniedActive,
    message,
  });
});

// Master plan generation endpoint
app.post('/api/chronos/plan', async (req, res) => {
  const {
    rawInput,
    fixedObligations,
    studyTasks,
    sleepTime = '23:00',
    energyLevel = 'Medio',
    peakTime = 'Tarde (14:00 - 18:00)',
    currentTime = '08:00',
    emergencyDelayMinutes = 0,
  } = req.body as PlanRequest;

  const currentApiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const hasKey = currentApiKey !== '' && currentApiKey !== 'MY_GEMINI_API_KEY';

  // 1. If key is missing or already known to be denied, immediately serve the tailored cognitive plan
  if (!hasKey || isPermissionDeniedActive) {
    const fallback = generateAlgorithmicPlan({
      rawInput,
      fixedObligations,
      studyTasks,
      sleepTime,
      energyLevel,
      peakTime,
      currentTime,
      emergencyDelayMinutes,
    });
    return res.json({
      ...fallback,
      isFallback: true,
      errorCode: isPermissionDeniedActive ? 'PERMISSION_DENIED' : 'MISSING_API_KEY',
      fallbackReason: isPermissionDeniedActive
        ? 'La clave de API actual fue denegada (403 / PERMISSION_DENIED) o ha expirado. Por favor actualízala en Google AI Studio (panel Settings > Secrets).'
        : 'La variable de entorno GEMINI_API_KEY no está configurada o está vacía en .env. El plan fue generado con el algoritmo cognitivo offline basado en tus datos.',
    });
  }

  // 2. Build user prompt
  let userPrompt = '';
  if (rawInput && rawInput.trim()) {
    userPrompt = `DATOS EN LENGUAJE NATURAL DEL ESTUDIANTE:
${rawInput.trim()}

Parámetros detectados o por defecto:
- Hora actual de referencia: ${currentTime}
- Hora límite para dormir: ${sleepTime}
- Nivel de energía actual: ${energyLevel}
- Momento de mayor lucidez: ${peakTime}
${emergencyDelayMinutes > 0 ? `- ATENCIÓN: El estudiante solicita un reajuste de emergencia por retraso de ${emergencyDelayMinutes} minutos.` : ''}

Por favor, deduce lo obvio, añade márgenes prudentes y genera el plan maestro inmediato.`;
  } else {
    userPrompt = `DATOS ESTRUCTURADOS DEL ESTUDIANTE:
1. Obligaciones fijas e inamovibles de hoy:
${fixedObligations || 'Clases de 08:30 a 13:30, Almuerzo de 13:30 a 14:30'}

2. Lo que debe estudiar / entregar:
${studyTasks || 'Cálculo (preparación examen), Redacción informe de Historia'}

3. Parámetros personales:
- Hora actual de inicio: ${currentTime}
- Hora límite para ir a dormir (innegociable): ${sleepTime}
- Nivel de energía actual: ${energyLevel}
- Momento del día de mayor lucidez: ${peakTime}
${emergencyDelayMinutes > 0 ? `- AVISO DE EMERGENCIA: El alumno se retrasó ${emergencyDelayMinutes} minutos. Reajusta el cronograma inmediatamente salvando el descanso.` : ''}`;
  }

  // 3. Robust Try / Catch call to Gemini API
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: CHRONOS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '';
    let parsed: any = null;

    try {
      parsed = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('La respuesta de la IA no contiene una estructura JSON válida');
      }
    }

    return res.json({
      ...parsed,
      isFallback: false,
    });
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const isPermissionDenied =
      errorMessage.includes('403') ||
      errorMessage.includes('PERMISSION_DENIED') ||
      errorMessage.includes('denied access') ||
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('API key not valid') ||
      errorMessage.includes('unregistered') ||
      errorMessage.includes('unauthenticated');

    let errorCode = 'API_ERROR';
    let fallbackReason = '';

    if (isPermissionDenied) {
      isPermissionDeniedActive = true;
      errorCode = 'PERMISSION_DENIED';
      fallbackReason =
        'La clave de API actual fue denegada (403 / PERMISSION_DENIED) o ha expirado. Por favor actualízala en Google AI Studio (panel Settings > Secrets).';
      console.warn('[Chronos-Academic] Acceso a Gemini API denegado (403). Conmutando de forma transparente a modo respaldo.');
    } else {
      errorCode = 'API_ERROR';
      fallbackReason = `Error de conexión con la IA (${errorMessage}). Generando plan con el motor algorítmico para no interrumpir tu jornada.`;
      console.warn(`[Chronos-Academic] Aviso API: ${errorMessage}. Usando motor algorítmico.`);
    }

    // Never crash the server: Generate realistic mock plan tailored to the student's tasks
    const fallback = generateAlgorithmicPlan({
      rawInput,
      fixedObligations,
      studyTasks,
      sleepTime,
      energyLevel,
      peakTime,
      currentTime,
      emergencyDelayMinutes,
    });

    return res.json({
      ...fallback,
      isFallback: true,
      errorCode,
      fallbackReason,
    });
  }
});

// Helper functions for time calculation
function timeToMins(t: string): number {
  if (!t) return 0;
  const parts = t.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function minsToTime(m: number): string {
  const norm = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const min = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Deterministic, Fully Dynamic Neuro-Cognitive Scheduling Engine
function generateAlgorithmicPlan(params: any) {
  const sleepTimeStr = params.sleepTime || '23:00';
  const peakTimeStr = params.peakTime || 'Tarde (14:00 - 18:00)';
  const energyLevel = params.energyLevel || 'Medio';
  const isEmergency = (params.emergencyDelayMinutes || 0) > 0;
  const delayMinutes = params.emergencyDelayMinutes || 0;

  // 1. Parse user's actual study tasks
  const rawTasksText = params.studyTasks || '';
  const rawInputText = params.rawInput || '';
  const combinedTasks: string[] = [];

  if (rawTasksText.trim()) {
    rawTasksText.split(/\n|,/).forEach((line: string) => {
      const clean = line.replace(/^[-*•\d.)\s]+/, '').trim();
      if (clean.length > 2) combinedTasks.push(clean);
    });
  }

  if (combinedTasks.length === 0 && rawInputText.trim()) {
    // Extract clauses from raw natural input
    const sentences = rawInputText.split(/\n|\.|\;/);
    sentences.forEach((s: string) => {
      const clean = s.trim();
      // Look for study indicators
      if (
        clean.toLowerCase().match(/(estudiar|examen|informe|ensayo|lectura|repas|ejercicio|entreg|cálculo|matem|físic|químic|derech|histori|biolog|program)/i)
      ) {
        combinedTasks.push(clean.slice(0, 55));
      }
    });
    // Fallback if no keywords matched
    if (combinedTasks.length === 0) {
      sentences.forEach((s: string) => {
        const clean = s.trim();
        if (clean.length > 8 && !clean.toLowerCase().includes('clase') && !clean.toLowerCase().includes('trabajo')) {
          combinedTasks.push(clean.slice(0, 50));
        }
      });
    }
  }

  const primaryTask = combinedTasks[0] || 'Materia prioritaria de máxima demanda cognitiva';
  const secondaryTask = combinedTasks[1] || 'Segunda materia complementaria (Interleaving)';
  const tertiaryTask = combinedTasks[2] || 'Revisión activa y síntesis de apuntes';

  // 2. Parse fixed obligations
  let fixedActivity = 'Obligaciones fijas / Clases';
  let fixedStartMins = 8 * 60 + 30; // 08:30
  let fixedEndMins = 13 * 60 + 30;  // 13:30

  const fixedText = params.fixedObligations || '';
  if (fixedText.trim()) {
    const fixedLines = fixedText.split(/\n/).map((l: string) => l.trim()).filter(Boolean);
    if (fixedLines.length > 0) {
      const firstLine = fixedLines[0];
      const timeMatch = firstLine.match(/(\d{1,2}:\d{2})\s*[-–a]\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        fixedStartMins = timeToMins(timeMatch[1]);
        fixedEndMins = timeToMins(timeMatch[2]);
        fixedActivity = firstLine.replace(timeMatch[0], '').replace(/^[-:\s]+/, '').trim() || 'Compromisos fijos';
      } else {
        fixedActivity = firstLine;
      }
    }
  } else if (rawInputText.trim()) {
    const match = rawInputText.match(/(?:clases|trabajo|turno)[^.\n]*(?:de\s+)?(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/i);
    if (match) {
      fixedStartMins = timeToMins(match[1]);
      fixedEndMins = timeToMins(match[2]);
      fixedActivity = match[0].split(/\d{1,2}:\d{2}/)[0].trim() || 'Clases / Obligaciones';
    }
  }

  // 3. Ultradian parameters based on energy level
  const focusDuration = energyLevel === 'Alto' ? 50 : energyLevel === 'Bajo' ? 35 : 45;
  const breakDuration = energyLevel === 'Bajo' ? 15 : 10;
  const bufferDuration = isEmergency ? Math.max(15, 30 - delayMinutes) : 30;

  // 4. Determine Peak Timing placement
  const isMorningPeak = peakTimeStr.toLowerCase().includes('mañana');
  const isNightPeak = peakTimeStr.toLowerCase().includes('noche');

  const scheduleBlocks: any[] = [];

  // Routine block (07:30 or before fixed)
  const routineStart = Math.min(fixedStartMins - 60, 7 * 60 + 30);
  scheduleBlocks.push({
    startTime: minsToTime(routineStart),
    endTime: minsToTime(routineStart + 60),
    type: '🟢 Rutina',
    title: 'Despertar, hidratación consciente (500ml) y luz natural',
    strategy: 'Cero redes sociales. Luz natural matutina para anclar el pico de cortisol.',
    category: 'routine',
  });

  if (isMorningPeak && fixedStartMins > routineStart + 60 + focusDuration + breakDuration) {
    // If morning peak and there's time before fixed commitment, put Deep Work in morning!
    const dw1Start = routineStart + 60;
    const dw1End = dw1Start + focusDuration;
    scheduleBlocks.push({
      startTime: minsToTime(dw1Start),
      endTime: minsToTime(dw1End),
      type: '🧠 Foco Profundo',
      title: `Bloque 1: ${primaryTask}`,
      strategy: 'Eat That Frog: Aprovechando tu pico matutino de máxima lucidez biológica.',
      category: 'deep_work',
    });
    scheduleBlocks.push({
      startTime: minsToTime(dw1End),
      endTime: minsToTime(dw1End + breakDuration),
      type: '☕ Pausa Activa',
      title: 'Recuperación Activa',
      strategy: 'Agua, estiramiento de trapecios y mirada al horizonte.',
      category: 'break',
    });
  }

  // Fixed obligations block
  scheduleBlocks.push({
    startTime: minsToTime(fixedStartMins),
    endTime: minsToTime(fixedEndMins),
    type: '🔒 Fijo',
    title: fixedActivity,
    strategy: 'Atención activa y notas sintéticas estilo Cornell. Evitar multitarea.',
    category: 'fixed',
  });

  // Lunch / Recharge
  const lunchStart = fixedEndMins;
  const lunchEnd = lunchStart + 60;
  scheduleBlocks.push({
    startTime: minsToTime(lunchStart),
    endTime: minsToTime(lunchEnd),
    type: '🍽️ Recarga',
    title: 'Almuerzo y pausa digestiva desconectada',
    strategy: 'Comida moderada. Caminata de 10 min para oxigenar el cerebro.',
    category: 'meal',
  });

  // Main Study Blocks
  let studyStartMins = lunchEnd + 15;
  if (isEmergency) studyStartMins += delayMinutes;

  if (!isMorningPeak && !isNightPeak) {
    // Afternoon Peak (Default & most frequent for students)
    const dw1End = studyStartMins + focusDuration;
    scheduleBlocks.push({
      startTime: minsToTime(studyStartMins),
      endTime: minsToTime(dw1End),
      type: '🧠 Foco Profundo',
      title: `Bloque 1: ${primaryTask}`,
      strategy: 'Eat That Frog: Resuelve los problemas más difíciles en tu pico de la tarde.',
      category: 'deep_work',
    });

    const b1End = dw1End + breakDuration;
    scheduleBlocks.push({
      startTime: minsToTime(dw1End),
      endTime: minsToTime(b1End),
      type: '☕ Pausa Activa',
      title: 'Pausa Activa (Desconexión de pantallas)',
      strategy: 'Cero pantallas. Beber agua, caminar y relajar los ojos.',
      category: 'break',
    });

    const dw2End = b1End + focusDuration;
    scheduleBlocks.push({
      startTime: minsToTime(b1End),
      endTime: minsToTime(dw2End),
      type: '🧠 Foco Profundo',
      title: `Bloque 2: ${secondaryTask}`,
      strategy: 'Interleaving: Alternancia de materia para prevenir fatiga sináptica.',
      category: 'deep_work',
    });

    const bufEnd = dw2End + bufferDuration;
    scheduleBlocks.push({
      startTime: minsToTime(dw2End),
      endTime: minsToTime(bufEnd),
      type: '🛡️ Colchón de Imprevistos',
      title: isEmergency ? 'Buffer de Seguridad (Reajustado)' : 'Buffer de Seguridad (15-20%)',
      strategy: isEmergency
        ? `Se absorbieron ${delayMinutes} min de retraso. El horario no colapsa gracias a este margen.`
        : 'Margen sagrado para imprevistos o dudas complejas.',
      category: 'buffer',
    });

    const lightEnd = bufEnd + 45;
    scheduleBlocks.push({
      startTime: minsToTime(bufEnd),
      endTime: minsToTime(lightEnd),
      type: '📝 Tarea Ligera',
      title: `Revisión activa: ${tertiaryTask}`,
      strategy: 'Active Recall con fichas de memoria o auto-evaluación rápida.',
      category: 'light_task',
    });

    studyStartMins = lightEnd;
  } else if (isNightPeak) {
    // Night Peak: Light task in afternoon, deep work in evening!
    const lightEnd = studyStartMins + 45;
    scheduleBlocks.push({
      startTime: minsToTime(studyStartMins),
      endTime: minsToTime(lightEnd),
      type: '📝 Tarea Ligera',
      title: `Tareas preparatorias: ${tertiaryTask}`,
      strategy: 'Lectura ligera y recopilación de apuntes sin sobrecargar la mente.',
      category: 'light_task',
    });

    scheduleBlocks.push({
      startTime: minsToTime(lightEnd),
      endTime: minsToTime(lightEnd + 60),
      type: '🎮 Ocio Libre',
      title: 'Ejercicio físico o esparcimiento sin culpa',
      strategy: 'Descarga dopaminérgica libre para llegar fresco al pico nocturno.',
      category: 'leisure',
    });

    const nightDwStart = 18 * 60 + 30;
    const nightDwEnd = nightDwStart + focusDuration;
    scheduleBlocks.push({
      startTime: minsToTime(nightDwStart),
      endTime: minsToTime(nightDwEnd),
      type: '🧠 Foco Profundo',
      title: `Bloque 1 (Pico Nocturno): ${primaryTask}`,
      strategy: 'Eat That Frog en tu pico de lucidez nocturna. Teléfono en otra habitación.',
      category: 'deep_work',
    });

    scheduleBlocks.push({
      startTime: minsToTime(nightDwEnd),
      endTime: minsToTime(nightDwEnd + breakDuration),
      type: '☕ Pausa Activa',
      title: 'Pausa Activa',
      strategy: 'Estiramientos y agua.',
      category: 'break',
    });

    const nightDw2End = nightDwEnd + breakDuration + focusDuration;
    scheduleBlocks.push({
      startTime: minsToTime(nightDwEnd + breakDuration),
      endTime: minsToTime(nightDw2End),
      type: '🧠 Foco Profundo',
      title: `Bloque 2: ${secondaryTask}`,
      strategy: 'Interleaving: Materia complementaria.',
      category: 'deep_work',
    });

    studyStartMins = nightDw2End;
  } else {
    // Morning peak already had Block 1: Add Block 2 in afternoon
    const dw2End = studyStartMins + focusDuration;
    scheduleBlocks.push({
      startTime: minsToTime(studyStartMins),
      endTime: minsToTime(dw2End),
      type: '🧠 Foco Profundo',
      title: `Bloque 2: ${secondaryTask}`,
      strategy: 'Interleaving de consolidación.',
      category: 'deep_work',
    });

    const bufEnd = dw2End + bufferDuration;
    scheduleBlocks.push({
      startTime: minsToTime(dw2End),
      endTime: minsToTime(bufEnd),
      type: '🛡️ Colchón de Imprevistos',
      title: 'Buffer de Seguridad (15-20%)',
      strategy: 'Tiempo de amortiguación para proteger la tarde.',
      category: 'buffer',
    });

    studyStartMins = bufEnd;
  }

  // Evening Routine, Dinner & Sleep Sanctuary
  const dinnerStart = Math.max(studyStartMins, 20 * 60);
  const dinnerEnd = dinnerStart + 60;
  scheduleBlocks.push({
    startTime: minsToTime(dinnerStart),
    endTime: minsToTime(dinnerEnd),
    type: '🍽️ Recarga',
    title: 'Cena equilibrada y tiempo social / desconexión',
    strategy: 'Cena ligera sin pantallas para preparar la digestión nocturna.',
    category: 'meal',
  });

  const sleepMins = timeToMins(sleepTimeStr);
  const sanctuaryStartMins = Math.max(dinnerEnd, sleepMins - 60);

  if (sanctuaryStartMins > dinnerEnd + 20) {
    scheduleBlocks.push({
      startTime: minsToTime(dinnerEnd),
      endTime: minsToTime(sanctuaryStartMins),
      type: '🎮 Ocio Libre',
      title: 'Ocio analógico / lectura recreativa',
      strategy: 'Luz tenue, sin pantallas ni notificaciones.',
      category: 'leisure',
    });
  }

  scheduleBlocks.push({
    startTime: minsToTime(sanctuaryStartMins),
    endTime: sleepTimeStr,
    type: '🌙 Cierre',
    title: 'Santuario de Sueño: Desconexión total de pantallas',
    strategy: `Consolidación mnemotécnica en sueño profundo. Hora sagrada innegociable a las ${sleepTimeStr}.`,
    category: 'sleep',
  });

  // Calculate Viability Index
  const viabilityScore = isEmergency
    ? 78
    : energyLevel === 'Alto'
    ? 93
    : energyLevel === 'Bajo'
    ? 74
    : 86;

  const viabilityIndex = `${viabilityScore}% - ${
    isEmergency
      ? 'Jornada reajustada y viable tras retraso'
      : energyLevel === 'Alto'
      ? 'Día de alto rendimiento cognitivo'
      : energyLevel === 'Bajo'
      ? 'Ritmo adaptado a baja energía con pausas protectoras'
      : 'Día exigente pero plenamente alcanzable'
  }`;

  const keyFocus = `Garantizar el bloque de foco en "${primaryTask.slice(0, 45)}" en tu momento pico (${peakTimeStr.split(' ')[0]}) y proteger el corte de descanso a las ${sleepTimeStr}.`;

  const twoMinuteTakeoff = `Abre el material o archivo de "${primaryTask.slice(0, 35)}". En los próximos 120 segundos, tu única misión es escribir la fecha y el primer encabezado. Deja el lápiz al lado y bebe un sorbo de agua.`;

  const emergencyRule = isEmergency
    ? `Protocolo aplicado: Se absorbió el retraso de ${delayMinutes} min consumiendo el colchón de seguridad. Tu hora de dormir a las ${sleepTimeStr} queda 100% intacta.`
    : `Si te atrasas 1 hora por imprevistos: Consume el Colchón de Imprevistos programado, comprime la revisión secundaria y mantén INTOCABLE la hora de corte de las ${sleepTimeStr}.`;

  const markdownContent = `# 🧭 Diagnóstico Rápido
- **Índice de Viabilidad de la Jornada:** ${viabilityIndex}
- **Enfoque Clave del Día:** ${keyFocus}

---

## 📅 Cronograma Maestro del Día

| Horario | Tipo | Actividad / Materia | Estrategia / Instrucción Clave |
| :--- | :--- | :--- | :--- |
${scheduleBlocks.map((b: any) => `| \`${b.startTime} - ${b.endTime}\` | ${b.type} | ${b.title} | ${b.strategy} |`).join('\n')}

---

## 🚀 Despegue Inmediato (Anti-Procrastinación)
- **Técnica de los 2 Minutos para la primera tarea de estudio:** ${twoMinuteTakeoff}

## ⚠️ Regla de Emergencia
- ${emergencyRule}`;

  return {
    markdownContent,
    scheduleBlocks,
    viabilityIndex,
    keyFocus,
    twoMinuteTakeoff,
    emergencyRule,
  };
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Chronos-Academic] Servidor activo en puerto ${PORT} con modelo ${GEMINI_MODEL}`);
  });
}

startServer();
