export type TaskPriority = 'Alta' | 'Média' | 'Baixa';

export type TaskCategory =
  | 'Estudos'
  | 'Trabalho'
  | 'Pessoal'
  | 'Organização'
  | 'Bem-estar'
  | 'Grimório'
  | 'Outros';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface SubtaskInput {
  id?: string;
  title: string;
  completed?: boolean;
}

export interface Project {
  folder?: string;
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number; // in minutes (> 0)
  status: TaskStatus;
  archived: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
  projectId?: string;
  subtasks: Subtask[];
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number;
  status?: TaskStatus;
  projectId?: string;
  subtasks?: SubtaskInput[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  estimatedMinutes?: number;
  status?: TaskStatus;
  archived?: boolean;
  projectId?: string | null;
  subtasks?: SubtaskInput[];
}

export interface CreateProjectDTO {
  folder?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface TaskFilterOptions {
  status?: 'all' | TaskStatus;
  projectId?: string;
  dueDate?: string;
  category?: string;
  priority?: string;
  searchQuery?: string;
}

export type TaskSortOrder = 'suggested' | 'dueDate' | 'priority' | 'effort' | 'title' | 'createdAt';
