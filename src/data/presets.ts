import { PresetScenario } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'exam_week',
    name: 'Examen Complejo en 48 Horas',
    tagline: 'Cálculo Avanzado + Entrega de Laboratorio con fatiga acumulada',
    rawInput: `Tengo clases obligatorias de 09:00 a 13:00. Almuerzo rápido con compañeros hasta las 14:00.
Debo estudiar para mi examen final de Cálculo II (integrales triples y series) que es pasado mañana.
Además tengo que redactar la conclusión del informe de Física que vence hoy a las 23:59.
Me siento con energía media, pero en las tardes entre 15:00 y 18:00 suelo estar muy enfocado.
Mi hora de dormir es innegociable a las 23:30 porque si trasnocho mi cerebro no rinde en el examen.`,
    fixedObligations: '09:00 - 13:00 Clases en facultad\n13:00 - 14:00 Almuerzo y traslado',
    studyTasks: 'Cálculo II (Series de Taylor y Teoremas clave) - Alta dificultad\nInforme de Física (Redacción de conclusiones y bibliografía) - Media dificultad',
    sleepTime: '23:30',
    energyLevel: 'Medio',
    peakTime: 'Tarde (14:00 - 18:00)',
  },
  {
    id: 'university_work',
    name: 'Estudiante + Turno Laboral',
    tagline: 'Jornada partida con ventana de estudio comprimida',
    rawInput: `Tengo turno de trabajo de 10:00 a 14:00 en la biblioteca.
Clase sincrónica online de 18:00 a 19:30.
Tengo que leer 40 páginas de Derecho Constitucional y hacer un esquema resumen.
Además preparar una presentación de 10 diapositivas de Economía.
Tengo energía alta por la mañana y media por la noche.
Duermo a las 23:00 obligatoriamente.`,
    fixedObligations: '10:00 - 14:00 Trabajo en biblioteca\n14:00 - 15:00 Comida y descanso\n18:00 - 19:30 Clase sincrónica Derecho',
    studyTasks: 'Derecho Constitucional (Lectura y síntesis)\nEconomía (Presentación y diapositivas)',
    sleepTime: '23:00',
    energyLevel: 'Alto',
    peakTime: 'Mañana temprana (06:00 - 10:00)',
  },
  {
    id: 'low_energy',
    name: 'Día de Recuperación y Resistencia Cognitiva',
    tagline: 'Cansancio alto pero con entregas inminentes',
    rawInput: `Me desperté con muy poca energía y dolor de cabeza.
No tengo clases hoy pero tengo entregas acumuladas:
Un ensayo de Literatura de 1500 palabras y 20 ejercicios de Química Orgánica.
No puedo permitirme quemarme ni procrastinar en el teléfono.
Mi hora límite de dormir es a las 22:30. Mi momento menos malo es media mañana.`,
    fixedObligations: '13:30 - 14:30 Almuerzo ligero\n20:30 - 21:15 Cena familiar',
    studyTasks: 'Química Orgánica (Mecanismos de reacción)\nEnsayo de Literatura (Borrador de 1500 palabras)',
    sleepTime: '22:30',
    energyLevel: 'Bajo',
    peakTime: 'Media mañana (10:00 - 14:00)',
  },
  {
    id: 'full_study_day',
    name: 'Maratón de Estudio Pre-Oposición / Selectividad',
    tagline: 'Día 100% libre dedicado a dominar 3 materias disímiles',
    rawInput: `Hoy tengo el día completamente libre de clases.
Objetivo: avanzar en Biología Celular, resolver problemas de Matemáticas y repasar Historia Contemporánea.
Quiero aplicar Interleaving estricto para no saturarme y descansos activos de calidad.
Energía alta, mi pico es a media mañana y luego a primera hora de la tarde.
Dormir a las 23:00 sin pantallas.`,
    fixedObligations: '08:00 - 08:30 Desayuno e hidratación\n13:30 - 14:30 Almuerzo y paseo\n20:30 - 21:30 Cena',
    studyTasks: 'Biología Celular (Genética y transcripción)\nMatemáticas (Álgebra lineal)\nHistoria Contemporánea (Active Recall fichas)',
    sleepTime: '23:00',
    energyLevel: 'Alto',
    peakTime: 'Media mañana (10:00 - 14:00)',
  }
];
