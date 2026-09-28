import test from 'node:test';
import assert from 'node:assert';
import type { Task } from '../../src/domain/entities/task';

function makeTask(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: `Ritual ${id}`,
    description: '',
    category: 'Estudos',
    priority: 'Média',
    estimatedMinutes: 30,
    status: 'pending',
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function filterTasks(
  tasks: Task[],
  options: {
    status?: 'all' | 'pending' | 'completed';
    category?: string;
    priority?: string;
    includeArchived?: boolean;
  }
): Task[] {
  return tasks.filter((task) => {
    if (!options.includeArchived && task.archived) return false;
    if (options.status === 'pending' && task.status !== 'pending') return false;
    if (options.status === 'completed' && task.status !== 'completed') return false;
    if (options.category && options.category !== 'all' && task.category !== options.category) return false;
    if (options.priority && options.priority !== 'all' && task.priority !== options.priority) return false;
    return true;
  });
}

test('Task Filtering - US02: Filters by status, category, priority, and archives isolation', () => {
  const dataset: Task[] = [
    makeTask('1', { status: 'pending', category: 'Estudos', priority: 'Alta' }),
    makeTask('2', { status: 'completed', category: 'Estudos', priority: 'Média' }),
    makeTask('3', { status: 'pending', category: 'Trabalho', priority: 'Alta' }),
    makeTask('4', { status: 'pending', category: 'Pessoal', priority: 'Baixa' }),
    makeTask('5', { status: 'pending', category: 'Estudos', priority: 'Alta', archived: true }),
  ];

  const activeOnly = filterTasks(dataset, {});
  assert.strictEqual(activeOnly.length, 4);
  assert.ok(!activeOnly.some((t) => t.archived), 'Archived tasks must never leak into active view');

  const pendingOnly = filterTasks(dataset, { status: 'pending' });
  assert.strictEqual(pendingOnly.length, 3);
  assert.ok(pendingOnly.every((t) => t.status === 'pending'));

  const completedOnly = filterTasks(dataset, { status: 'completed' });
  assert.strictEqual(completedOnly.length, 1);
  assert.strictEqual(completedOnly[0].id, '2');

  const estudosOnly = filterTasks(dataset, { category: 'Estudos' });
  assert.strictEqual(estudosOnly.length, 2);
  assert.ok(estudosOnly.every((t) => t.category === 'Estudos'));

  const altaOnly = filterTasks(dataset, { priority: 'Alta' });
  assert.strictEqual(altaOnly.length, 2);
  assert.ok(altaOnly.every((t) => t.priority === 'Alta'));

  const combined = filterTasks(dataset, {
    status: 'pending',
    category: 'Estudos',
    priority: 'Alta',
  });
  assert.strictEqual(combined.length, 1);
  assert.strictEqual(combined[0].id, '1');

  const reset = filterTasks(dataset, { status: 'all', category: 'all', priority: 'all' });
  assert.strictEqual(reset.length, 4);
});
