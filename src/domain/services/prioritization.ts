import type { Task } from '../entities/task';
import { parseDateTime } from '../../shared/utils/dateUtils';

export interface ScoreFactor {
  key: 'urgency' | 'importance' | 'effort';
  title: string;
  points: number;
  maxPoints: number;
  explanation: string;
}

export interface PrioritizedTask {
  task: Task;
  score: number; // 0 to 100
  factors: ScoreFactor[];
  summaryReason: string;
}

function calculateUrgencyFactor(task: Task, referenceDate: Date): ScoreFactor {
  const maxPoints = 45;

  if (!task.dueDate) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 10,
      maxPoints,
      explanation: 'Sem prazo estipulado',
    };
  }

  const targetDate = parseDateTime(task.dueDate, task.dueTime);
  if (!targetDate) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 10,
      maxPoints,
      explanation: 'Prazo não definido',
    };
  }

  const diffMs = targetDate.getTime() - referenceDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 45,
      maxPoints,
      explanation: 'Prazo em atraso (crítico)',
    };
  }

  if (diffHours <= 12) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 42,
      maxPoints,
      explanation: 'Vence em poucas horas',
    };
  }

  if (diffHours <= 24) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 38,
      maxPoints,
      explanation: 'Vence hoje',
    };
  }

  if (diffHours <= 48) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 30,
      maxPoints,
      explanation: 'Vence amanhã',
    };
  }

  if (diffHours <= 72) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 24,
      maxPoints,
      explanation: 'Vence em até 3 dias',
    };
  }

  if (diffHours <= 168) {
    return {
      key: 'urgency',
      title: 'Prazo',
      points: 18,
      maxPoints,
      explanation: 'Vence nesta semana',
    };
  }

  return {
    key: 'urgency',
    title: 'Prazo',
    points: 10,
    maxPoints,
    explanation: 'Prazo confortável (> 1 sem)',
  };
}

function calculateImportanceFactor(task: Task): ScoreFactor {
  const maxPoints = 35;

  switch (task.priority) {
    case 'Alta':
      return {
        key: 'importance',
        title: 'Prioridade',
        points: 35,
        maxPoints,
        explanation: 'Prioridade Alta',
      };
    case 'Média':
      return {
        key: 'importance',
        title: 'Prioridade',
        points: 22,
        maxPoints,
        explanation: 'Prioridade Média',
      };
    case 'Baixa':
    default:
      return {
        key: 'importance',
        title: 'Prioridade',
        points: 10,
        maxPoints,
        explanation: 'Prioridade Baixa',
      };
  }
}

function calculateEffortFactor(task: Task): ScoreFactor {
  const maxPoints = 20;
  const minutes = task.estimatedMinutes;

  if (minutes <= 15) {
    return {
      key: 'effort',
      title: 'Esforço',
      points: 20,
      maxPoints,
      explanation: 'Ritual rápido (≤15 min)',
    };
  }

  if (minutes <= 30) {
    return {
      key: 'effort',
      title: 'Esforço',
      points: 16,
      maxPoints,
      explanation: 'Esforço ágil (≤30 min)',
    };
  }

  if (minutes <= 60) {
    return {
      key: 'effort',
      title: 'Esforço',
      points: 12,
      maxPoints,
      explanation: 'Esforço moderado (≤1 hora)',
    };
  }

  if (minutes <= 120) {
    return {
      key: 'effort',
      title: 'Esforço',
      points: 8,
      maxPoints,
      explanation: 'Esforço substancial (1-2 horas)',
    };
  }

  return {
    key: 'effort',
    title: 'Esforço',
    points: 4,
    maxPoints,
    explanation: 'Ritual extenso (>2 horas)',
  };
}

function buildSummaryReason(urgency: ScoreFactor, importance: ScoreFactor, effort: ScoreFactor): string {
  const parts: string[] = [];

  if (urgency.points >= 38) {
    parts.push(urgency.explanation);
  }

  if (importance.points === 35) {
    parts.push('Alta prioridade');
  }

  if (effort.points >= 16) {
    parts.push('Rápida execução');
  }

  if (parts.length === 0) {
    return `${importance.explanation} com ${effort.explanation.toLowerCase()}`;
  }

  return parts.join(' · ');
}

export function calculatePriorityScore(task: Task, referenceDate = new Date()): PrioritizedTask {
  const urgency = calculateUrgencyFactor(task, referenceDate);
  const importance = calculateImportanceFactor(task);
  const effort = calculateEffortFactor(task);

  const totalScore = urgency.points + importance.points + effort.points;
  const factors = [urgency, importance, effort];
  const summaryReason = buildSummaryReason(urgency, importance, effort);

  return {
    task,
    score: totalScore,
    factors,
    summaryReason,
  };
}

export function suggestTaskOrder(tasks: Task[], referenceDate = new Date()): PrioritizedTask[] {
  const scored = tasks.map((task) => calculatePriorityScore(task, referenceDate));

  return scored.sort((a, b) => {
    if (a.task.status !== 'done' && b.task.status === 'done') return -1;
    if (a.task.status === 'done' && b.task.status !== 'done') return 1;

    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const dueA = parseDateTime(a.task.dueDate, a.task.dueTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const dueB = parseDateTime(b.task.dueDate, b.task.dueTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (dueA !== dueB) {
      return dueA - dueB;
    }

    return a.task.title.localeCompare(b.task.title);
  });
}
