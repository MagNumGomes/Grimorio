import test from 'node:test';
import assert from 'node:assert';
import { TaskRepository } from '../../src/infrastructure/repositories/taskRepository';

test('Kanban Board (US03) - Status transitions between columns', async () => {
  const repo = new TaskRepository();

  const task = await repo.createTask({
    title: 'Desenvolver componente de Kanban',
    priority: 'Alta',
    category: 'Estudos',
    estimatedMinutes: 45,
    status: 'todo',
  });

  assert.strictEqual(task.status, 'todo');

  // Move: todo -> in_progress
  const inProgressTask = await repo.moveTaskKanban(task.id, 'in_progress');
  assert.strictEqual(inProgressTask.status, 'in_progress');
  assert.strictEqual(inProgressTask.completedAt, undefined);

  // Move: in_progress -> done
  const doneTask = await repo.moveTaskKanban(task.id, 'done');
  assert.strictEqual(doneTask.status, 'done');
  assert.ok(doneTask.completedAt, 'Should set completedAt timestamp');

  // Move: done -> in_progress (Reopen)
  const reopenedTask = await repo.moveTaskKanban(task.id, 'in_progress');
  assert.strictEqual(reopenedTask.status, 'in_progress');
  assert.strictEqual(reopenedTask.completedAt, undefined, 'completedAt should be cleared on reopen');

  // Move: in_progress -> todo
  const backToTodo = await repo.moveTaskKanban(task.id, 'todo');
  assert.strictEqual(backToTodo.status, 'todo');
});

test('Kanban Board (US03) - Tasks partition into correct columns', async () => {
  const repo = new TaskRepository();

  const [t1, t2, t3] = await Promise.all([
    repo.createTask({ title: 'Task A', priority: 'Média', category: 'Trabalho', estimatedMinutes: 20, status: 'todo' }),
    repo.createTask({ title: 'Task B', priority: 'Alta', category: 'Trabalho', estimatedMinutes: 30, status: 'in_progress' }),
    repo.createTask({ title: 'Task C', priority: 'Baixa', category: 'Pessoal', estimatedMinutes: 15, status: 'done' }),
  ]);

  const all = await repo.getTasks();
  const todoCol = all.filter((t) => !t.archived && t.status === 'todo');
  const inProgressCol = all.filter((t) => !t.archived && t.status === 'in_progress');
  const doneCol = all.filter((t) => !t.archived && t.status === 'done');

  assert.ok(todoCol.some((t) => t.id === t1.id));
  assert.ok(inProgressCol.some((t) => t.id === t2.id));
  assert.ok(doneCol.some((t) => t.id === t3.id));
});
