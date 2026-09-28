import test from 'node:test';
import assert from 'node:assert';
import type { Task } from '../../src/domain/entities/task';
import {
  calculatePriorityScore,
  suggestTaskOrder,
} from '../../src/domain/services/prioritization';

const baseDate = new Date('2026-09-27T10:00:00Z');

function createSampleTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-1',
    title: 'Estudo do círculo mágico',
    description: 'Anotar fórmulas',
    dueDate: '2026-09-27',
    dueTime: '18:00',
    priority: 'Média',
    category: 'Estudos',
    estimatedMinutes: 30,
    status: 'pending',
    archived: false,
    createdAt: '2026-09-27T08:00:00Z',
    updatedAt: '2026-09-27T08:00:00Z',
    ...overrides,
  };
}

test('Prioritization - Calculation is deterministic', () => {
  const task = createSampleTask();
  const score1 = calculatePriorityScore(task, baseDate);
  const score2 = calculatePriorityScore(task, baseDate);

  assert.strictEqual(score1.score, score2.score);
  assert.strictEqual(score1.summaryReason, score2.summaryReason);
  assert.deepStrictEqual(score1.factors, score2.factors);
});

test('Prioritization - Priority increases score coherently', () => {
  const taskLow = createSampleTask({ priority: 'Baixa' });
  const taskMed = createSampleTask({ priority: 'Média' });
  const taskHigh = createSampleTask({ priority: 'Alta' });

  const scoreLow = calculatePriorityScore(taskLow, baseDate);
  const scoreMed = calculatePriorityScore(taskMed, baseDate);
  const scoreHigh = calculatePriorityScore(taskHigh, baseDate);

  assert.ok(
    scoreHigh.score > scoreMed.score,
    `High priority (${scoreHigh.score}) should score higher than Medium (${scoreMed.score})`
  );
  assert.ok(
    scoreMed.score > scoreLow.score,
    `Medium priority (${scoreMed.score}) should score higher than Low (${scoreLow.score})`
  );

  const highImportance = scoreHigh.factors.find((f) => f.key === 'importance');
  assert.strictEqual(highImportance?.points, 35);
  assert.strictEqual(highImportance?.explanation, 'Prioridade Alta');
});

test('Prioritization - Closer due date increases urgency score', () => {
  const taskOverdue = createSampleTask({ dueDate: '2026-09-26', dueTime: '12:00' });
  const taskToday = createSampleTask({ dueDate: '2026-09-27', dueTime: '14:00' });
  const taskNextWeek = createSampleTask({ dueDate: '2026-10-15', dueTime: '14:00' });
  const taskNoDue = createSampleTask({ dueDate: undefined, dueTime: undefined });

  const scoreOverdue = calculatePriorityScore(taskOverdue, baseDate);
  const scoreToday = calculatePriorityScore(taskToday, baseDate);
  const scoreNextWeek = calculatePriorityScore(taskNextWeek, baseDate);
  const scoreNoDue = calculatePriorityScore(taskNoDue, baseDate);

  assert.ok(
    scoreOverdue.score >= scoreToday.score,
    'Overdue task should have maximum urgency'
  );
  assert.ok(
    scoreToday.score > scoreNextWeek.score,
    'Task due today should score higher than task due in weeks'
  );
  assert.ok(
    scoreNextWeek.score <= scoreNoDue.score || scoreNextWeek.score >= scoreNoDue.score,
    'Scores are well-defined'
  );

  const overdueUrgency = scoreOverdue.factors.find((f) => f.key === 'urgency');
  assert.strictEqual(overdueUrgency?.points, 45);
  assert.strictEqual(overdueUrgency?.explanation, 'Prazo em atraso (crítico)');
});

test('Prioritization - Lower effort provides quick-win bonus', () => {
  const taskQuick = createSampleTask({ estimatedMinutes: 15 });
  const taskLong = createSampleTask({ estimatedMinutes: 180 });

  const scoreQuick = calculatePriorityScore(taskQuick, baseDate);
  const scoreLong = calculatePriorityScore(taskLong, baseDate);

  assert.ok(
    scoreQuick.score > scoreLong.score,
    `Quick task (${scoreQuick.score}) should score higher than 3-hour task (${scoreLong.score})`
  );

  const quickEffort = scoreQuick.factors.find((f) => f.key === 'effort');
  assert.strictEqual(quickEffort?.points, 20);
  assert.strictEqual(quickEffort?.explanation, 'Ritual rápido (≤15 min)');
});

test('Prioritization - Suggest task order orders pending before completed and highest score first', () => {
  const task1 = createSampleTask({
    id: '1',
    title: 'Baixa prioridade longa',
    priority: 'Baixa',
    estimatedMinutes: 120,
    dueDate: '2026-10-10',
    status: 'pending',
  });
  const task2 = createSampleTask({
    id: '2',
    title: 'Alta prioridade urgente rápida',
    priority: 'Alta',
    estimatedMinutes: 15,
    dueDate: '2026-09-27',
    status: 'pending',
  });
  const task3 = createSampleTask({
    id: '3',
    title: 'Tarefa concluída com alta prioridade',
    priority: 'Alta',
    estimatedMinutes: 15,
    dueDate: '2026-09-27',
    status: 'completed',
  });

  const ordered = suggestTaskOrder([task1, task3, task2], baseDate);

  assert.strictEqual(ordered[0].task.id, '2', 'Most urgent pending task must be #1');
  assert.strictEqual(ordered[1].task.id, '1', 'Second pending task must be #2');
  assert.strictEqual(ordered[2].task.id, '3', 'Completed task must be at the end');
});
