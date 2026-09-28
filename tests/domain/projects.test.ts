import test from 'node:test';
import assert from 'node:assert';
import { TaskRepository } from '../../src/infrastructure/repositories/taskRepository';
import { validateCreateProjectInput } from '../../src/domain/services/taskValidation';
import { calculateProjectProgress, getAllProjectsProgress } from '../../src/domain/services/projectService';
import type { Task, Project } from '../../src/domain/entities/task';

test('Projects (US04) - Input validation', () => {
  const valid = validateCreateProjectInput({
    name: 'Estudos de Engenharia',
    description: 'Disciplinas do semestre',
    color: '#c38b32',
    icon: '◈',
  });
  assert.strictEqual(valid.isValid, true);

  const emptyName = validateCreateProjectInput({ name: '' });
  assert.strictEqual(emptyName.isValid, false);
  assert.ok(emptyName.errors.name);

  const longName = validateCreateProjectInput({ name: 'A'.repeat(65) });
  assert.strictEqual(longName.isValid, false);
  assert.ok(longName.errors.name);

  const longDesc = validateCreateProjectInput({ name: 'Projeto', description: 'D'.repeat(305) });
  assert.strictEqual(longDesc.isValid, false);
  assert.ok(longDesc.errors.description);
});

test('Projects (US04) - Progress calculation metrics', () => {
  const project: Project = {
    id: 'proj-1',
    name: 'Saúde & Fitness',
    color: '#778b72',
    icon: '◉',
    createdAt: new Date().toISOString(),
  };

  // Case 1: No tasks
  const progressEmpty = calculateProjectProgress(project, []);
  assert.strictEqual(progressEmpty.totalTasks, 0);
  assert.strictEqual(progressEmpty.completedTasks, 0);
  assert.strictEqual(progressEmpty.progressPercent, 0);

  // Case 2: 3 tasks, 1 completed (33%)
  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Treino A',
      priority: 'Alta',
      category: 'Pessoal',
      estimatedMinutes: 60,
      status: 'done',
      projectId: 'proj-1',
      subtasks: [],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '',
    },
    {
      id: 't2',
      title: 'Treino B',
      priority: 'Média',
      category: 'Pessoal',
      estimatedMinutes: 60,
      status: 'in_progress',
      projectId: 'proj-1',
      subtasks: [],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '',
    },
    {
      id: 't3',
      title: 'Treino C',
      priority: 'Baixa',
      category: 'Pessoal',
      estimatedMinutes: 60,
      status: 'todo',
      projectId: 'proj-1',
      subtasks: [],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '',
    },
  ];

  const progressPartial = calculateProjectProgress(project, tasks);
  assert.strictEqual(progressPartial.totalTasks, 3);
  assert.strictEqual(progressPartial.completedTasks, 1);
  assert.strictEqual(progressPartial.progressPercent, 33);

  // Case 3: All tasks completed (100%)
  const allCompletedTasks = tasks.map((t) => ({ ...t, status: 'done' as const }));
  const progressFull = calculateProjectProgress(project, allCompletedTasks);
  assert.strictEqual(progressFull.totalTasks, 3);
  assert.strictEqual(progressFull.completedTasks, 3);
  assert.strictEqual(progressFull.progressPercent, 100);

  // All projects progress list
  const allProgress = getAllProjectsProgress([project], tasks);
  assert.strictEqual(allProgress.length, 1);
  assert.strictEqual(allProgress[0].progressPercent, 33);
});

test('Projects (US04) - Repository CRUD & Task Unlinking', async () => {
  const repo = new TaskRepository();

  const createdProject = await repo.createProject({
    name: 'Projeto Autonomia',
    description: 'Aprimorar independência',
    color: '#403243',
    icon: '✦',
  });

  assert.ok(createdProject.id);
  assert.strictEqual(createdProject.name, 'Projeto Autonomia');

  const taskWithProject = await repo.createTask({
    title: 'Estudo autônomo',
    priority: 'Alta',
    category: 'Estudos',
    estimatedMinutes: 45,
    projectId: createdProject.id,
  });

  assert.strictEqual(taskWithProject.projectId, createdProject.id);

  // Delete project -> unlinks task's projectId
  await repo.deleteProject(createdProject.id);
  const tasksAfter = await repo.getTasks();
  const unlinkedTask = tasksAfter.find((t) => t.id === taskWithProject.id);
  assert.strictEqual(unlinkedTask?.projectId, undefined, 'Deleting project should unlink task');
});
