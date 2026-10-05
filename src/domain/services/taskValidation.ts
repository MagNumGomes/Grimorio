import type { CreateProjectDTO, CreateTaskDTO, UpdateTaskDTO, TaskPriority, TaskCategory } from '../entities/task';

export interface ValidationResult { isValid: boolean; errors: Record<string, string> }
export const VALID_PRIORITIES: TaskPriority[] = ['Alta', 'Média', 'Baixa'];
export const VALID_CATEGORIES: TaskCategory[] = ['Estudos', 'Trabalho', 'Pessoal', 'Organização', 'Bem-estar', 'Grimório', 'Outros'];
export const VALID_STATUSES = ['todo', 'in_progress', 'done'] as const;

export function isValidDateFormat(value: string): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  return year >= 1 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
export function isValidTimeFormat(value: string): boolean {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
const result = (errors: Record<string, string>): ValidationResult => ({ isValid: !Object.keys(errors).length, errors });
const text = (value: unknown, max: number, required = false) =>
  value === undefined ? !required : typeof value === 'string' && value.trim().length <= max && (!required || value.trim().length > 0);

export function validateCreateProjectInput(input: Partial<CreateProjectDTO>): ValidationResult {
  const errors: Record<string, string> = {};
  if (!text(input.name, 60, true)) errors.name = 'Informe um nome de projeto de até 60 caracteres.';
  if (!text(input.description, 300)) errors.description = 'A descrição deve ter até 300 caracteres.';
  if (!text(input.folder, 60)) errors.folder = 'A pasta deve ter até 60 caracteres.';
  if (input.color !== undefined && (typeof input.color !== 'string' || !/^#([\da-f]{3}|[\da-f]{6})$/i.test(input.color))) errors.color = 'Cor hexadecimal inválida.';
  if (!text(input.icon, 2)) errors.icon = 'O ícone deve ser um símbolo curto.';
  return result(errors);
}

function validateTask(input: Partial<CreateTaskDTO | UpdateTaskDTO>, creating: boolean): ValidationResult {
  const errors: Record<string, string> = {};
  if ((creating || input.title !== undefined) && !text(input.title, 120, true)) errors.title = 'O título do ritual é obrigatório e deve ter até 120 caracteres.';
  if (!text(input.description, 500)) errors.description = 'A descrição deve ter até 500 caracteres.';
  if (input.dueDate !== undefined && (typeof input.dueDate !== 'string' || (input.dueDate !== '' && !isValidDateFormat(input.dueDate.trim())))) errors.dueDate = 'Data inválida. Use AAAA-MM-DD.';
  if (input.dueTime !== undefined && (typeof input.dueTime !== 'string' || (input.dueTime !== '' && !isValidTimeFormat(input.dueTime.trim())))) errors.dueTime = 'Horário inválido. Use HH:MM.';
  if ((creating || input.priority !== undefined) && !VALID_PRIORITIES.includes(input.priority!)) errors.priority = 'Prioridade inválida.';
  if ((creating || input.category !== undefined) && !VALID_CATEGORIES.includes(input.category!)) errors.category = 'Categoria inválida.';
  if ((creating || input.estimatedMinutes !== undefined) && (!Number.isInteger(input.estimatedMinutes) || input.estimatedMinutes! < 1 || input.estimatedMinutes! > 1440)) errors.estimatedMinutes = 'Informe entre 1 e 1440 minutos inteiros.';
  if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) errors.status = 'Status inválido.';
  if (input.projectId !== undefined && input.projectId !== null && !text(input.projectId, 120, true)) errors.projectId = 'Projeto inválido.';
  if ('archived' in input && typeof input.archived !== 'boolean') errors.archived = 'Arquivamento inválido.';
  if (input.subtasks !== undefined) {
    if (!Array.isArray(input.subtasks) || input.subtasks.length > 200 || input.subtasks.some(s =>
      !s || !text(s.title, 120, true) || (s.completed !== undefined && typeof s.completed !== 'boolean') || (s.id !== undefined && !text(s.id, 120, true))
    )) errors.subtasks = 'Use até 200 subtarefas com títulos de 1 a 120 caracteres.';
    else {
      const ids = input.subtasks.flatMap(s => s.id ? [s.id] : []);
      if (new Set(ids).size !== ids.length) errors.subtasks = 'Subtarefas duplicadas.';
    }
  }
  return result(errors);
}
export const validateCreateTaskInput = (input: Partial<CreateTaskDTO>) => validateTask(input, true);
export const validateUpdateTaskInput = (input: Partial<UpdateTaskDTO>) => validateTask(input, false);
