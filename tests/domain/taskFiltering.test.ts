import test from 'node:test';
import assert from 'node:assert/strict';
import type { Task } from '../../src/domain/entities/task';
import { filterTasks } from '../../src/domain/services/taskFiltering';

function makeTask(id: string, overrides: Partial<Task> = {}): Task {
  return { id, title: `Ritual ${id}`, description: '', category: 'Estudos', priority: 'Média', estimatedMinutes: 30, status: 'todo', archived: false, subtasks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...overrides };
}
test('Production filters combine status, project, priority, category, today and archive isolation', () => {
  const tasks = [
    makeTask('1', { status: 'todo', priority: 'Alta', projectId: 'p', dueDate: '2026-10-04' }),
    makeTask('2', { status: 'done', projectId: 'p' }),
    makeTask('3', { status: 'in_progress', category: 'Trabalho', priority: 'Alta' }),
    makeTask('4', { status: 'todo', category: 'Pessoal', priority: 'Baixa' }),
    makeTask('5', { status: 'done', archived: true }),
  ];
  const ids = (items: Task[]) => items.map(t => t.id);
  assert.deepEqual(ids(filterTasks(tasks, { status: 'done' })), ['2']);
  assert.deepEqual(ids(filterTasks(tasks, { status: 'todo' })), ['1', '4']);
  assert.deepEqual(ids(filterTasks(tasks, { status: 'in_progress' })), ['3']);
  assert.deepEqual(ids(filterTasks(tasks, { projectId: 'p' })), ['1', '2']);
  assert.deepEqual(ids(filterTasks(tasks, { category: 'Estudos', priority: 'Alta', projectId: 'p', status: 'todo' })), ['1']);
  assert.deepEqual(ids(filterTasks(tasks, { dueDate: '2026-10-04' })), ['1']);
  assert.deepEqual(ids(filterTasks(tasks, { category: 'all', priority: 'all', projectId: 'all', status: 'all' })), ['1', '2', '3', '4']);
});
