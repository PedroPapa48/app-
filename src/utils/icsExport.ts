import { ScheduleBlock } from '../types';

export function generateICS(blocks: ScheduleBlock[], dateStr?: string): string {
  const today = dateStr ? new Date(dateStr) : new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos-Academic//Master Daily Schedule//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Plan Maestro Chronos-Academic',
    'X-WR-TIMEZONE:UTC',
  ];

  blocks.forEach((block, index) => {
    const [startH, startM] = block.startTime.split(':');
    const [endH, endM] = block.endTime.split(':');

    if (!startH || !startM || !endH || !endM) return;

    const dtStart = `${datePrefix}T${startH.padStart(2, '0')}${startM.padStart(2, '0')}00`;
    const dtEnd = `${datePrefix}T${endH.padStart(2, '0')}${endM.padStart(2, '0')}00`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:chronos-${datePrefix}-${index}-${Date.now()}@academic.chronos`,
      `DTSTAMP:${datePrefix}T000000Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(block.type + ' ' + block.title)}`,
      `DESCRIPTION:${escapeICS('Estrategia: ' + block.strategy + '\\n\\nGenerado por Chronos-Academic - Estratega Cognitivo')}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function downloadICS(blocks: ScheduleBlock[]) {
  const icsData = generateICS(blocks);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Chronos_Plan_Maestro_${new Date().toISOString().slice(0, 10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
