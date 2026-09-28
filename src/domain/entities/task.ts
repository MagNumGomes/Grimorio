export type TaskPriority = 'Alta' | 'Média' | 'Baixa';

export type TaskCategory =
  | 'Estudos'
  | 'Trabalho'
  | 'Pessoal'
  | 'Organização'
  | 'Bem-estar'
  | 'Grimório'
  | 'Outros';

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HHzMM
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number; // in minutes (> 0)
  status: TaskStatus;
  archived: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number;
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
}

export interface TaskFilterOptions {
  status?: 'all' | 'pending' | 'completed';
  category?: string;
  priority?: string;
  searchQuery?: string;
}

export type TaskSortOrder = 'suggested' | 'dueDate' | 'priority' | 'effort' | 'title' | 'createdAt';
