import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskRepository, getInitialSeedTasks, type IStorage } from '../../src/infrastructure/repositories/taskRepository';
import type { CreateTaskDTO } from '../../src/domain/entities/task';

const input: CreateTaskDTO = { title: 'Ritual de teste', category: 'Estudos', priority: 'Alta', estimatedMinutes: 15 };
function storage() {
  const values = new Map<string, string>();
  let fail = false;
  const adapter: IStorage = {
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => { await new Promise(resolve => setTimeout(resolve, 2)); if (fail) throw new Error('disk full'); values.set(key, value); },
  };
  return { values, adapter, setFailure: (value: boolean) => { fail = value; } };
}

test('Concurrent creates and toggles are serialized, including delayed storage', async () => {
  const s = storage(); const repo = new TaskRepository(s.adapter);
  await repo.saveTasks([]);
  await Promise.all(['A', 'B', 'C'].map(title => repo.createTask({ ...input, title })));
  assert.deepEqual((await repo.getTasks()).map(t => t.title).sort(), ['A', 'B', 'C']);
  const task = (await repo.getTasks())[0];
  await Promise.all([repo.toggleTaskStatus(task.id), repo.toggleTaskStatus(task.id)]);
  assert.equal((await repo.getTasks()).find(t => t.id === task.id)?.status, 'todo');
  assert.equal((await new TaskRepository(s.adapter).getTasks()).length, 3);
});

test('Failed task writes reject, preserve cache and storage, and allow retry', async () => {
  const s = storage(); const repo = new TaskRepository(s.adapter);
  const task = await repo.createTask(input);
  const original = s.values.get('@grimorio_state_v2');
  s.setFailure(true);
  await assert.rejects(repo.updateTask(task.id, { title: 'Lost' }), /disk full/);
  assert.equal((await repo.getTasks()).find(t => t.id === task.id)?.title, input.title);
  assert.equal(s.values.get('@grimorio_state_v2'), original);
  s.setFailure(false);
  assert.equal((await repo.updateTask(task.id, { title: 'Saved' })).title, 'Saved');
});

test('Corrupt JSON and invalid stored records are never overwritten', async () => {
  for (const value of ['INVALID_JSON', JSON.stringify({ version: 2, tasks: [{}], projects: [] }), JSON.stringify({ version: 3, tasks: [], projects: [] })]) {
    const s = storage(); s.values.set('@grimorio_state_v2', value);
    await assert.rejects(new TaskRepository(s.adapter).getTasks(), /preservados/);
    assert.equal(s.values.get('@grimorio_state_v2'), value);
  }
  const s = storage(); s.values.set('@grimorio_tasks_v1', 'INVALID_JSON');
  await assert.rejects(new TaskRepository(s.adapter).getTasks());
  assert.equal(s.values.get('@grimorio_tasks_v1'), 'INVALID_JSON');
  assert.equal(s.values.has('@grimorio_state_v2'), false);
});

test('Storage read failures never seed or write over existing data', async () => {
  let writes = 0;
  const repo = new TaskRepository({ getItem: async () => { throw new Error('unavailable'); }, setItem: async () => { writes++; } });
  await assert.rejects(repo.getTasks(), /unavailable/);
  assert.equal(writes, 0);
});

test('Legacy statuses migrate to v2 while original data remains intact', async () => {
  const s = storage();
  const old = JSON.stringify(getInitialSeedTasks().map(t => ({ ...t, status: t.status === 'done' ? 'completed' : 'pending' })));
  s.values.set('@grimorio_tasks_v1', old);
  const tasks = await new TaskRepository(s.adapter).getTasks();
  assert.ok(tasks.every(t => t.status === 'todo' || t.status === 'done'));
  assert.equal(s.values.get('@grimorio_tasks_v1'), old);
  assert.ok(s.values.has('@grimorio_state_v2'));
});

test('Project deletion and unlinking are committed together or not at all', async () => {
  const s = storage(); const repo = new TaskRepository(s.adapter);
  const project = await repo.createProject({ name: 'Objetivo', folder: 'Estudos' });
  const task = await repo.createTask({ ...input, projectId: project.id });
  s.setFailure(true);
  await assert.rejects(repo.deleteProject(project.id), /disk full/);
  const afterFailure = new TaskRepository(s.adapter);
  assert.equal((await afterFailure.getProjects())[0].id, project.id);
  assert.equal((await afterFailure.getTasks()).find(t => t.id === task.id)?.projectId, project.id);
  s.setFailure(false);
  await repo.deleteProject(project.id);
  const afterSuccess = new TaskRepository(s.adapter);
  assert.equal((await afterSuccess.getProjects()).length, 0);
  assert.equal((await afterSuccess.getTasks()).find(t => t.id === task.id)?.projectId, undefined);
});

test('Editing preserves subtask identity and clears optional fields explicitly', async () => {
  const repo = new TaskRepository(null);
  const project = await repo.createProject({ name: 'Projeto' });
  const task = await repo.createTask({ ...input, projectId: project.id, dueDate: '2026-10-04', dueTime: '15:00', subtasks: [{ title: 'Passo' }] });
  const sub = task.subtasks[0];
  const updated = await repo.updateTask(task.id, { dueDate: '', dueTime: '', projectId: null, subtasks: [{ ...sub, title: 'Passo revisado' }] });
  assert.equal(updated.subtasks[0].id, sub.id);
  assert.equal(updated.subtasks[0].createdAt, sub.createdAt);
  assert.equal(updated.dueDate, undefined); assert.equal(updated.dueTime, undefined); assert.equal(updated.projectId, undefined);
  await assert.rejects(repo.toggleSubtask(task.id, 'missing'));
  await assert.rejects(repo.updateTask(task.id, { projectId: 'missing' }));
});

test('Returned objects cannot mutate the cache or persistence', async () => {
  const repo = new TaskRepository(null);
  const created = await repo.createTask({ ...input, subtasks: [{ title: 'Original' }] });
  created.subtasks[0].title = 'Tampered';
  const tasks = await repo.getTasks(); tasks[0].title = 'Tampered';
  const saved = (await repo.getTasks()).find(t => t.id === created.id)!;
  assert.equal(saved.title, input.title); assert.equal(saved.subtasks[0].title, 'Original');
});

test('A failed project creation never leaves a ghost project in cache', async () => {
  const s = storage(); const repo = new TaskRepository(s.adapter);
  await repo.getProjects();
  s.setFailure(true);
  await assert.rejects(repo.createProject({ name: 'Ghost' }), /disk full/);
  assert.deepEqual(await repo.getProjects(), []);
  assert.deepEqual(await new TaskRepository(s.adapter).getProjects(), []);
});
