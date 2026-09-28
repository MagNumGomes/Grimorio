import test from 'node:test';
import assert from 'node:assert';
import { TaskRepository } from '../../src/infrastructure/repositories/taskRepository';

test('TaskRepository - Lifecycle: CRUD, toggle, archive, restore, delete', async () => {
  const repo = new TaskRepository();

  const initial = await repo.getTasks();
  assert.ok(initial.length >= 4, 'Should load initial seed tasks');
  assert.ok(initial.every((t) => typeof t.id === 'string' && t.title));

  const created = await repo.createTask({
    title: 'Fabricar elixir de concentração',
    description: 'Coletar folhas de menta prateada e destilar no almofariz.',
    dueDate: '2026-10-01',
    dueTime: '10:00',
    priority: 'Alta',
    category: 'Grimório',
    estimatedMinutes: 45,
  });

  assert.ok(created.id);
  assert.strictEqual(created.title, 'Fabricar elixir de concentração');
  assert.strictEqual(created.priority, 'Alta');
  assert.strictEqual(created.category, 'Grimório');
  assert.strictEqual(created.estimatedMinutes, 45);
  assert.strictEqual(created.status, 'pending');
  assert.strictEqual(created.archived, false);
  assert.ok(created.createdAt);

  const afterCreate = await repo.getTasks();
  assert.strictEqual(afterCreate.length, initial.length + 1);

  await assert.rejects(
    async () => {
      await repo.createTask({
        title: '',
        priority: 'Alta',
        category: 'Estudos',
        estimatedMinutes: 30,
      });
    },
    /título do ritual é obrigatório/,
    'Should reject empty title'
  );

  const updated = await repo.updateTask(created.id, {
    title: 'Fabricar elixir da sabedoria superior',
    priority: 'Média',
    estimatedMinutes: 60,
  });
  assert.strictEqual(updated.title, 'Fabricar elixir da sabedoria superior');
  assert.strictEqual(updated.priority, 'Média');
  assert.strictEqual(updated.estimatedMinutes, 60);

  const completedTask = await repo.toggleTaskStatus(created.id);
  assert.strictEqual(completedTask.status, 'completed');
  assert.ok(completedTask.completedAt);

  const reopenedTask = await repo.toggleTaskStatus(created.id);
  assert.strictEqual(reopenedTask.status, 'pending');
  assert.strictEqual(reopenedTask.completedAt, undefined);

  const archived = await repo.archiveTask(created.id);
  assert.strictEqual(archived.archived, true);

  const currentList = await repo.getTasks();
  const foundInActive = currentList.filter((t) => !t.archived).some((t) => t.id === created.id);
  assert.strictEqual(foundInActive, false, 'Archived task must not be in active non-archived filter');

  const restored = await repo.restoreTask(created.id);
  assert.strictEqual(restored.archived, false);

  const listAfterRestore = await repo.getTasks();
  const foundRestored = listAfterRestore.filter((t) => !t.archived).some((t) => t.id === created.id);
  assert.strictEqual(foundRestored, true, 'Restored task must be in active filter');

  const deleted = await repo.deleteTask(created.id);
  assert.strictEqual(deleted, true);

  const finalTasks = await repo.getTasks();
  assert.strictEqual(finalTasks.some((t) => t.id === created.id), false);
});

test('TaskRepository - Persistence round-trip with IStorage', async () => {
  const store = new Map<string, string>();
  const mockStorage = {
    async getItem(key: string) {
      return store.get(key) || null;
    },
    async setItem(key: string, value: string) {
      store.set(key, value);
    },
  };

  const repo1 = new TaskRepository(mockStorage);
  await repo1.createTask({
    title: 'Tarefa persistida entre sessões',
    priority: 'Alta',
    category: 'Grimório',
    estimatedMinutes: 20,
  });

  assert.ok(store.size > 0);

  const repo2 = new TaskRepository(mockStorage);
  const tasksAfterRestart = await repo2.getTasks();
  assert.ok(
    tasksAfterRestart.some((t) => t.title === 'Tarefa persistida entre sessões'),
    'Should recover persisted tasks across instances'
  );
});
