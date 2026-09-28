import test from 'node:test';
import assert from 'node:assert';
import { TaskRepository } from '../../src/infrastructure/repositories/taskRepository';

test('Subtasks (US02) - Lifecycle: Add, Toggle, and Remove subtasks', async () => {
  const repo = new TaskRepository();

  const task = await repo.createTask({
    title: 'Preparar apresentação do projeto',
    priority: 'Alta',
    category: 'Trabalho',
    estimatedMinutes: 60,
    subtasks: [
      { title: 'Reunir métricas' },
      { title: 'Elaborar slides', completed: true },
    ],
  });

  assert.strictEqual(task.subtasks.length, 2);
  assert.strictEqual(task.subtasks[0].title, 'Reunir métricas');
  assert.strictEqual(task.subtasks[0].completed, false);
  assert.strictEqual(task.subtasks[1].completed, true);

  // Add a new subtask
  const afterAdd = await repo.addSubtask(task.id, 'Revisar com a equipe');
  assert.strictEqual(afterAdd.subtasks.length, 3);
  const newSub = afterAdd.subtasks.find((s) => s.title === 'Revisar com a equipe');
  assert.ok(newSub);
  assert.strictEqual(newSub.completed, false);

  // Toggle first subtask to true
  const firstSubId = task.subtasks[0].id;
  const afterToggle = await repo.toggleSubtask(task.id, firstSubId);
  const toggled = afterToggle.subtasks.find((s) => s.id === firstSubId);
  assert.strictEqual(toggled?.completed, true);

  // Toggle again to false
  const afterToggleBack = await repo.toggleSubtask(task.id, firstSubId);
  const toggledBack = afterToggleBack.subtasks.find((s) => s.id === firstSubId);
  assert.strictEqual(toggledBack?.completed, false);

  // Remove the newly added subtask
  const afterRemove = await repo.removeSubtask(task.id, newSub.id);
  assert.strictEqual(afterRemove.subtasks.length, 2);
  assert.strictEqual(afterRemove.subtasks.some((s) => s.id === newSub.id), false);
});
