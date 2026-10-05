import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, Project, CreateTaskDTO, UpdateTaskDTO, CreateProjectDTO, TaskStatus, SubtaskInput, Subtask } from '../../domain/entities/task';
import { validateCreateTaskInput, validateUpdateTaskInput, validateCreateProjectInput, type ValidationResult } from '../../domain/services/taskValidation';
import { getTodayDateString, formatToDateString } from '../../shared/utils/dateUtils';

// One document makes project deletion + task unlinking a single storage write.
const STORAGE_KEY = '@grimorio_state_v2';
interface State { version: 2; tasks: Task[]; projects: Project[] }
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
const now = () => new Date().toISOString();
function assertValid(validation: ValidationResult) {
  if (!validation.isValid) throw new Error(Object.values(validation.errors)[0]);
}
function validTimestamp(value: unknown): boolean {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}
function assertIds(items: { id: string }[]) {
  if (items.some(item => typeof item.id !== 'string' || !item.id || item.id.length > 120) || new Set(items.map(i => i.id)).size !== items.length) throw new Error('Identificadores inválidos no armazenamento.');
}
export function getInitialSeedTasks(): Task[] {
  const future = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return formatToDateString(date); };
  const seeds: CreateTaskDTO[] = [
    { title: 'Revisar o capítulo de poções', description: 'Estudar os ingredientes alquímicos para a infusão do amanhecer.', dueDate: getTodayDateString(), dueTime: '15:00', category: 'Estudos', priority: 'Alta', estimatedMinutes: 25 },
    { title: 'Responder mensagens da guilda', description: 'Retornar avisos dos mestres sobre a expedição da floresta.', dueDate: getTodayDateString(), dueTime: '11:00', category: 'Pessoal', priority: 'Média', estimatedMinutes: 15, status: 'done' },
    { title: 'Planejar a semana arcana', description: 'Mapear rituais de foco e metas de estudo para os próximos dias.', dueDate: future(1), dueTime: '09:00', category: 'Organização', priority: 'Alta', estimatedMinutes: 30 },
    { title: 'Caminhada de recuperação', description: 'Recarregar energia ao ar livre para clarear os pensamentos.', dueDate: future(3), dueTime: '18:00', category: 'Bem-estar', priority: 'Baixa', estimatedMinutes: 20 },
  ];
  return seeds.map((seed, i) => ({ ...seed, id: `task-${i + 1}`, description: seed.description ?? '', status: seed.status ?? 'todo', archived: false, createdAt: now(), updatedAt: now(), completedAt: seed.status === 'done' ? now() : undefined, subtasks: [] }));
}

function parseState(raw: unknown, legacy = false): State {
  if (!raw || typeof raw !== 'object') throw new Error('Armazenamento inválido.');
  const state = raw as State;
  if (state.version !== 2 || !Array.isArray(state.tasks) || !Array.isArray(state.projects)) throw new Error('Formato de armazenamento inválido.');
  for (const project of state.projects) {
    if (!project || typeof project !== 'object') throw new Error('Projeto armazenado inválido.');
    assertValid(validateCreateProjectInput(project));
    if (!validTimestamp(project.createdAt) || (project.updatedAt !== undefined && !validTimestamp(project.updatedAt))) throw new Error('Data do projeto inválida.');
  }
  assertIds(state.projects);
  for (const task of state.tasks) {
    if (!task || typeof task !== 'object') throw new Error('Tarefa armazenada inválida.');
    if (legacy) {
      const status = task.status as string;
      if (status === 'pending') task.status = 'todo';
      if (status === 'completed') task.status = 'done';
      task.subtasks ??= [];
    }
    assertValid(validateCreateTaskInput(task));
    if (typeof task.description !== 'string' || typeof task.archived !== 'boolean' || !Array.isArray(task.subtasks) || !validTimestamp(task.createdAt) || !validTimestamp(task.updatedAt) || (task.status === 'done' && !validTimestamp(task.completedAt)) || (task.status !== 'done' && task.completedAt !== undefined)) throw new Error('Metadados da tarefa inválidos.');
    if (!task.status || !['todo', 'in_progress', 'done'].includes(task.status)) throw new Error('Status armazenado inválido.');
    assertIds(task.subtasks);
    if (task.subtasks.some(s => typeof s.completed !== 'boolean' || !validTimestamp(s.createdAt))) throw new Error('Subtarefa armazenada inválida.');
    if (task.projectId != null && !state.projects.some(p => p.id === task.projectId)) throw new Error('Referência a projeto inexistente.');
  }
  assertIds(state.tasks);
  return state;
}

export class TaskRepository {
  private cache: State | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private storage: IStorage | null;
  constructor(storage?: IStorage | null) {
    const native = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
    this.storage = storage !== undefined ? storage : (typeof window !== 'undefined' || native ? AsyncStorage : null);
  }

  private exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.queue.then(operation);
    this.queue = pending.catch(() => undefined);
    return pending;
  }
  private async load(): Promise<State> {
    if (this.cache) return this.cache;
    if (!this.storage) return this.cache = { version: 2, tasks: getInitialSeedTasks(), projects: [] };
    try {
      const raw = await this.storage.getItem(STORAGE_KEY);
      if (raw !== null) return this.cache = parseState(JSON.parse(raw));
      const tasks = await this.storage.getItem('@grimorio_tasks_v1');
      const projects = await this.storage.getItem('@grimorio_projects_v1');
      const migrated = parseState({ version: 2, tasks: tasks === null ? getInitialSeedTasks() : JSON.parse(tasks), projects: projects === null ? [] : JSON.parse(projects) }, true);
      // Preserve legacy keys; malformed input never reaches this write.
      await this.persist(migrated);
      return migrated;
    } catch (error) {
      throw new Error(`Não foi possível ler os dados locais. Os dados anteriores foram preservados. ${error instanceof Error ? error.message : ''}`);
    }
  }
  private async persist(state: State): Promise<void> {
    parseState(state);
    if (this.storage) await this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.cache = clone(state);
  }
  private mutate<T>(operation: (state: State) => T): Promise<T> {
    return this.exclusive(async () => {
      const state = clone(await this.load());
      const value = operation(state);
      await this.persist(state);
      return clone(value);
    });
  }
  getTasks(): Promise<Task[]> { return this.exclusive(async () => clone((await this.load()).tasks)); }
  getProjects(): Promise<Project[]> { return this.exclusive(async () => clone((await this.load()).projects)); }
  async saveTasks(tasks: Task[]): Promise<void> { await this.mutate(state => { state.tasks = clone(tasks); return true; }); }
  private task(state: State, taskId: string): Task {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Tarefa não encontrada.');
    return task;
  }
  private subtasks(inputs: SubtaskInput[], existing: Subtask[] = []): Subtask[] {
    return inputs.map(input => {
      const previous = input.id ? existing.find(s => s.id === input.id) : undefined;
      if (input.id && !previous) throw new Error('Subtarefa não encontrada.');
      return { id: previous?.id ?? id('subtask'), title: input.title.trim(), completed: input.completed ?? previous?.completed ?? false, createdAt: previous?.createdAt ?? now() };
    });
  }
  createTask(dto: CreateTaskDTO): Promise<Task> {
    return this.mutate(state => {
      assertValid(validateCreateTaskInput(dto));
      const status = dto.status ?? 'todo';
      const task: Task = { ...dto, id: id('task'), title: dto.title.trim(), description: dto.description?.trim() ?? '', dueDate: dto.dueDate?.trim() || undefined, dueTime: dto.dueTime?.trim() || undefined, status, archived: false, createdAt: now(), updatedAt: now(), completedAt: status === 'done' ? now() : undefined, subtasks: this.subtasks(dto.subtasks ?? []) };
      state.tasks.unshift(task);
      return task;
    });
  }
  private update(state: State, taskId: string, dto: UpdateTaskDTO): Task {
    assertValid(validateUpdateTaskInput(dto));
    const task = this.task(state, taskId);
    const previousStatus = task.status;
    for (const key of ['title', 'description', 'dueDate', 'dueTime'] as const) {
      if (dto[key] !== undefined) {
        const value = dto[key]!.trim();
        if (key === 'title' || key === 'description') task[key] = value;
        else task[key] = value || undefined;
      }
    }
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.category !== undefined) task.category = dto.category;
    if (dto.estimatedMinutes !== undefined) task.estimatedMinutes = dto.estimatedMinutes;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.archived !== undefined) task.archived = dto.archived;
    if (dto.projectId !== undefined) task.projectId = dto.projectId ?? undefined;
    if (dto.subtasks !== undefined) task.subtasks = this.subtasks(dto.subtasks, task.subtasks);
    task.completedAt = task.status === 'done' ? (previousStatus === 'done' ? task.completedAt : now()) : undefined;
    task.updatedAt = now();
    return task;
  }
  updateTask(taskId: string, dto: UpdateTaskDTO): Promise<Task> { return this.mutate(state => this.update(state, taskId, dto)); }
  toggleTaskStatus(taskId: string): Promise<Task> { return this.mutate(state => this.update(state, taskId, { status: this.task(state, taskId).status === 'done' ? 'todo' : 'done' })); }
  addSubtask(taskId: string, title: string): Promise<Task> { return this.mutate(state => this.update(state, taskId, { subtasks: [...this.task(state, taskId).subtasks, { title }] })); }
  toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    return this.mutate(state => {
      const task = this.task(state, taskId);
      if (!task.subtasks.some(s => s.id === subtaskId)) throw new Error('Subtarefa não encontrada.');
      return this.update(state, taskId, { subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) });
    });
  }
  removeSubtask(taskId: string, subtaskId: string): Promise<Task> {
    return this.mutate(state => {
      const task = this.task(state, taskId);
      if (!task.subtasks.some(s => s.id === subtaskId)) throw new Error('Subtarefa não encontrada.');
      return this.update(state, taskId, { subtasks: task.subtasks.filter(s => s.id !== subtaskId) });
    });
  }
  moveTaskKanban(taskId: string, status: TaskStatus): Promise<Task> { return this.updateTask(taskId, { status }); }
  archiveTask(taskId: string): Promise<Task> { return this.updateTask(taskId, { archived: true }); }
  restoreTask(taskId: string): Promise<Task> { return this.updateTask(taskId, { archived: false }); }
  deleteTask(taskId: string): Promise<boolean> { return this.mutate(state => { const count = state.tasks.length; state.tasks = state.tasks.filter(t => t.id !== taskId); return count !== state.tasks.length; }); }
  resetToInitial(): Promise<Task[]> { return this.mutate(state => { state.tasks = getInitialSeedTasks(); return state.tasks; }); }
  createProject(dto: CreateProjectDTO): Promise<Project> {
    return this.mutate(state => {
      assertValid(validateCreateProjectInput(dto));
      const project = { ...dto, name: dto.name.trim(), folder: dto.folder?.trim() || undefined, id: id('project'), createdAt: now(), updatedAt: now() };
      state.projects.unshift(project);
      return project;
    });
  }
  deleteProject(projectId: string): Promise<boolean> {
    return this.mutate(state => {
      if (!state.projects.some(p => p.id === projectId)) return false;
      state.projects = state.projects.filter(p => p.id !== projectId);
      state.tasks.forEach(task => { if (task.projectId === projectId) { task.projectId = undefined; task.updatedAt = now(); } });
      return true;
    });
  }
}
export const taskRepository = new TaskRepository();
