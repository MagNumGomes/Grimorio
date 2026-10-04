import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  Project,
  CreateProjectDTO,
  TaskStatus,
  SubtaskInput,
} from '../../domain/entities/task';
import { validateCreateProjectInput, validateCreateTaskInput, validateUpdateTaskInput } from '../../domain/services/taskValidation';
import { getTodayDateString, formatToDateString } from '../../shared/utils/dateUtils';

const STORAGE_KEY = '@grimorio_tasks_v1';
const PROJECTS_KEY = '@grimorio_projects_v1';

const normalizeTaskStatus = (status?: TaskStatus | string): TaskStatus => {
  switch (status) {
    case 'todo':
    case 'pending':
      return 'pending';
    case 'in_progress':
      return 'in_progress';
    case 'done':
    case 'completed':
      return 'completed';
    default:
      return 'pending';
  }
};

const isDoneStatus = (status?: TaskStatus | string): boolean =>
  status === 'completed' || status === 'done';

const normalizeSubtaskInput = (subtask: SubtaskInput) => ({
  id: `subtask-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  title: subtask.title.trim(),
  completed: Boolean(subtask.completed),
  createdAt: new Date().toISOString(),
});

export function getInitialSeedTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatToDateString(tomorrow);

  const laterThisWeek = new Date();
  laterThisWeek.setDate(laterThisWeek.getDate() + 3);
  const laterStr = formatToDateString(laterThisWeek);

  return [
    {
      id: 'task-1',
      title: 'Revisar o capítulo de poções',
      description: 'Estudar os ingredientes alquímicos para a infusão do amanhecer.',
      dueDate: today,
      dueTime: '15:00',
      category: 'Estudos',
      priority: 'Alta',
      estimatedMinutes: 25,
      status: 'pending',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
    },
    {
      id: 'task-2',
      title: 'Responder mensagens da guilda',
      description: 'Retornar avisos dos mestres sobre a expedição da floresta.',
      dueDate: today,
      dueTime: '11:00',
      category: 'Pessoal',
      priority: 'Média',
      estimatedMinutes: 15,
      status: 'completed',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      subtasks: [],
    },
    {
      id: 'task-3',
      title: 'Planejar a semana arcana',
      description: 'Mapear rituais de foco e metas de estudo para os próximos dias.',
      dueDate: tomorrowStr,
      dueTime: '09:00',
      category: 'Organização',
      priority: 'Alta',
      estimatedMinutes: 30,
      status: 'pending',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
    },
    {
      id: 'task-4',
      title: 'Caminhada de recuperação',
      description: 'Recarregar energia ao ar livre para clarear os pensamentos.',
      dueDate: laterStr,
      dueTime: '18:00',
      category: 'Bem-estar',
      priority: 'Baixa',
      estimatedMinutes: 20,
      status: 'pending',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
    },
  ];
}

export interface ITaskRepository {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  createTask(dto: CreateTaskDTO): Promise<Task>;
  updateTask(id: string, dto: UpdateTaskDTO): Promise<Task>;
  toggleTaskStatus(id: string): Promise<Task>;
  addSubtask(taskId: string, title: string): Promise<Task>;
  toggleSubtask(taskId: string, subtaskId: string): Promise<Task>;
  removeSubtask(taskId: string, subtaskId: string): Promise<Task>;
  moveTaskKanban(taskId: string, newStatus: 'todo' | 'in_progress' | 'done'): Promise<Task>;
  archiveTask(id: string): Promise<Task>;
  restoreTask(id: string): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;
  resetToInitial(): Promise<Task[]>;
  getProjects(): Promise<Project[]>;
  createProject(dto: CreateProjectDTO): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;
}

export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

function getDefaultStorage(): IStorage | null {
  if (typeof window === 'undefined' && typeof (globalThis as any).nativeCallSyncHook === 'undefined') {
    return null;
  }
  if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
    return AsyncStorage;
  }
  const anyStorage = AsyncStorage as unknown as { default?: typeof AsyncStorage };
  if (anyStorage?.default && typeof anyStorage.default.setItem === 'function') {
    return anyStorage.default;
  }
  return null;
}

export class TaskRepository implements ITaskRepository {
  private memoryCache: Task[] | null = null;
  private projectCache: Project[] | null = null;
  private storage: IStorage | null;

  constructor(storage?: IStorage | null) {
    this.storage = storage !== undefined ? storage : getDefaultStorage();
  }

  async getTasks(): Promise<Task[]> {
    if (this.memoryCache !== null) {
      return [...this.memoryCache];
    }

    if (this.storage) {
      try {
        const stored = await this.storage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Task[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.memoryCache = parsed.map((task) => ({
              ...task,
              subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
              status: normalizeTaskStatus(task.status),
            }));
            return [...this.memoryCache];
          }
        }
      } catch {
        // Fallback to initial seeds
      }
    }

    const initial = getInitialSeedTasks();
    await this.saveTasks(initial);
    return [...initial];
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    this.memoryCache = [...tasks];
    if (this.storage) {
      try {
        await this.storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        console.warn('Falha ao persistir no armazenamento:', err);
      }
    }
  }

  async getProjects(): Promise<Project[]> {
    if (this.projectCache !== null) {
      return [...this.projectCache];
    }

    if (this.storage) {
      try {
        const stored = await this.storage.getItem(PROJECTS_KEY);
        if (stored) {
          const parsed: Project[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.projectCache = parsed;
            return [...this.projectCache];
          }
        }
      } catch {
        // fallback
      }
    }

    return [];
  }

  async createProject(dto: CreateProjectDTO): Promise<Project> {
    const validation = validateCreateProjectInput(dto);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Dados do projeto inválidos.');
    }

    const current = await this.getProjects();
    const project: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: dto.name.trim(),
      description: dto.description ? dto.description.trim() : undefined,
      color: dto.color ? dto.color.trim() : undefined,
      icon: dto.icon ? dto.icon.trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [project, ...current];
    this.projectCache = updated;
    if (this.storage) {
      await this.storage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    }
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const currentProjects = await this.getProjects();
    const filteredProjects = currentProjects.filter((project) => project.id !== id);
    if (filteredProjects.length === currentProjects.length) {
      return false;
    }

    this.projectCache = filteredProjects;
    if (this.storage) {
      await this.storage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));
    }

    const tasks = await this.getTasks();
    const updatedTasks = tasks.map((task) =>
      task.projectId === id ? { ...task, projectId: undefined } : task,
    );
    await this.saveTasks(updatedTasks);
    return true;
  }

  async createTask(dto: CreateTaskDTO): Promise<Task> {
    const validation = validateCreateTaskInput(dto);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Dados da tarefa inválidos.');
    }

    const current = await this.getTasks();
    const normalizedStatus = normalizeTaskStatus(dto.status);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: dto.title.trim(),
      description: dto.description ? dto.description.trim() : '',
      dueDate: dto.dueDate ? dto.dueDate.trim() : undefined,
      dueTime: dto.dueTime ? dto.dueTime.trim() : undefined,
      priority: dto.priority,
      category: dto.category,
      estimatedMinutes: dto.estimatedMinutes,
      status: normalizedStatus,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: dto.projectId,
      subtasks: (dto.subtasks ?? []).map(normalizeSubtaskInput),
      completedAt: isDoneStatus(normalizedStatus) ? new Date().toISOString() : undefined,
    };

    const updated = [newTask, ...current];
    await this.saveTasks(updated);
    return newTask;
  }

  async updateTask(id: string, dto: UpdateTaskDTO): Promise<Task> {
    const validation = validateUpdateTaskInput(dto);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Dados da tarefa inválidos.');
    }

    const current = await this.getTasks();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    const existing = current[index];
    const nextStatus = dto.status !== undefined ? normalizeTaskStatus(dto.status) : existing.status;
    const nextSubtasks = dto.subtasks
      ? dto.subtasks.map(normalizeSubtaskInput)
      : existing.subtasks;

    const updatedTask: Task = {
      ...existing,
      title: dto.title !== undefined ? dto.title.trim() : existing.title,
      description: dto.description !== undefined ? dto.description.trim() : existing.description,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate.trim() || undefined) : existing.dueDate,
      dueTime: dto.dueTime !== undefined ? (dto.dueTime.trim() || undefined) : existing.dueTime,
      priority: dto.priority ?? existing.priority,
      category: dto.category ?? existing.category,
      estimatedMinutes: dto.estimatedMinutes ?? existing.estimatedMinutes,
      status: nextStatus,
      archived: dto.archived ?? existing.archived,
      projectId: dto.projectId ?? existing.projectId,
      subtasks: nextSubtasks,
      updatedAt: new Date().toISOString(),
      completedAt:
        isDoneStatus(nextStatus) && !isDoneStatus(existing.status)
          ? new Date().toISOString()
          : !isDoneStatus(nextStatus)
          ? undefined
          : existing.completedAt,
    };

    current[index] = updatedTask;
    await this.saveTasks(current);
    return updatedTask;
  }

  async toggleTaskStatus(id: string): Promise<Task> {
    const current = await this.getTasks();
    const task = current.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    const newStatus = isDoneStatus(task.status) ? 'pending' : 'completed';
    return this.updateTask(id, { status: newStatus });
  }

  async addSubtask(taskId: string, title: string): Promise<Task> {
    if (!title || !title.trim()) {
      throw new Error('O título da subtarefa é obrigatório.');
    }

    const tasks = await this.getTasks();
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada.`);
    }

    const newSubtask = normalizeSubtaskInput({ title, completed: false });
    return this.updateTask(taskId, {
      subtasks: [...task.subtasks, newSubtask],
    });
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const tasks = await this.getTasks();
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada.`);
    }

    const nextSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    );
    return this.updateTask(taskId, { subtasks: nextSubtasks });
  }

  async removeSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const tasks = await this.getTasks();
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada.`);
    }

    const nextSubtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId);
    return this.updateTask(taskId, { subtasks: nextSubtasks });
  }

  async moveTaskKanban(taskId: string, newStatus: 'todo' | 'in_progress' | 'done'): Promise<Task> {
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Status inválido para Kanban: ${newStatus}`);
    }
    return this.updateTask(taskId, { status: newStatus as TaskStatus });
  }

  async archiveTask(id: string): Promise<Task> {
    return this.updateTask(id, { archived: true });
  }

  async restoreTask(id: string): Promise<Task> {
    return this.updateTask(id, { archived: false });
  }

  async deleteTask(id: string): Promise<boolean> {
    const current = await this.getTasks();
    const filtered = current.filter((t) => t.id !== id);
    if (filtered.length === current.length) {
      return false;
    }
    await this.saveTasks(filtered);
    return true;
  }

  async resetToInitial(): Promise<Task[]> {
    const initial = getInitialSeedTasks();
    await this.saveTasks(initial);
    return initial;
  }
}

export const taskRepository = new TaskRepository();
