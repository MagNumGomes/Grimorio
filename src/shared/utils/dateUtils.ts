export function formatToDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatToDateString(new Date());
}

export function formatToTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseDateTime(dueDate?: string, dueTime?: string): Date | null {
  if (!dueDate) return null;
  const [yearStr, monthStr, dayStr] = dueDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  let hours = 23;
  let minutes = 59;
  if (dueTime) {
    const [h, m] = dueTime.split(':');
    hours = parseInt(h, 10);
    minutes = parseInt(m, 10);
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

export function isTaskOverdue(dueDate?: string, dueTime?: string, referenceDate = new Date()): boolean {
  const target = parseDateTime(dueDate, dueTime);
  if (!target) return false;
  return target.getTime() < referenceDate.getTime();
}

export function formatDueDisplay(dueDate?: string, dueTime?: string): string {
  if (!dueDate) return 'Sem prazo';

  const [year, month, day] = dueDate.split('-');
  const formattedDate = `${day}/${month}/${year}`;

  const todayStr = getTodayDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatToDateString(tomorrow);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatToDateString(yesterday);

  let label = formattedDate;
  if (dueDate === todayStr) {
    label = 'Hoje';
  } else if (dueDate === tomorrowStr) {
    label = 'Amanhã';
  } else if (dueDate === yesterdayStr) {
    label = 'Ontem';
  }

  if (dueTime) {
    return `${label} às ${dueTime}`;
  }
  return label;
}

export function getHeaderDateBr(date = new Date()): string {
  const days = [
    'DOMINGO',
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO',
  ];
  const months = [
    'JANEIRO',
    'FEVEREIRO',
    'MARÇO',
    'ABRIL',
    'MAIO',
    'JUNHO',
    'JULHO',
    'AGOSTO',
    'SETEMBRO',
    'OUTUBRO',
    'NOVEMBRO',
    'DEZEMBRO',
  ];

  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = months[date.getMonth()];

  return `${dayName}, ${day} DE ${monthName}`;
}
