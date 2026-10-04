import type {
  CreateProjectDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskPriority,
  TaskCategory,
} from '../entities/task';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const VALID_PRIORITIES: TaskPriority[] = ['Alta', 'Média', 'Baixa'];

export const VALID_CATEGORIES: TaskCategory[] = [
  'Estudos',
  'Trabalho',
  'Pessoal',
  'Organização',
  'Bem-estar',
  'Grimório',
  'Outros',
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidDateFormat(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isValidTimeFormat(timeStr: string): boolean {
  return TIME_REGEX.test(timeStr);
}

export function validateCreateProjectInput(input: Partial<CreateProjectDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = 'O nome do projeto é obrigatório.';
  } else if (input.name.trim().length > 60) {
    errors.name = 'O nome do projeto deve ter no máximo 60 caracteres.';
  }

  if (input.description && input.description.trim().length > 300) {
    errors.description = 'A descrição do projeto deve ter no máximo 300 caracteres.';
  }

  if (input.color && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input.color.trim())) {
    errors.color = 'A cor do projeto deve ser um valor hexadecimal válido.';
  }

  if (input.icon && input.icon.trim().length > 2) {
    errors.icon = 'O ícone do projeto deve ser um símbolo curto.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCreateTaskInput(input: Partial<CreateTaskDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title || input.title.trim().length === 0) {
    errors.title = 'O título do ritual é obrigatório.';
  } else if (input.title.trim().length > 120) {
    errors.title = 'O título deve ter no máximo 120 caracteres.';
  }

  if (input.description && input.description.length > 500) {
    errors.description = 'A descrição deve ter no máximo 500 caracteres.';
  }

  if (input.dueDate && input.dueDate.trim().length > 0) {
    if (!isValidDateFormat(input.dueDate.trim())) {
      errors.dueDate = 'Data de vencimento inválida. Use o formato AAAA-MM-DD.';
    }
  }

  if (input.dueTime && input.dueTime.trim().length > 0) {
    if (!isValidTimeFormat(input.dueTime.trim())) {
      errors.dueTime = 'Horário inválido. Use o formato HH:MM (ex: 14:30).';
    }
  }

  if (!input.priority) {
    errors.priority = 'A prioridade é obrigatória.';
  } else if (!VALID_PRIORITIES.includes(input.priority)) {
    errors.priority = 'Prioridade inválida. Escolha entre Alta, Média ou Baixa.';
  }

  if (!input.category || input.category.trim().length === 0) {
    errors.category = 'A categoria é obrigatória.';
  }

  if (input.estimatedMinutes === undefined || input.estimatedMinutes === null) {
    errors.estimatedMinutes = 'O esforço estimado é obrigatório.';
  } else if (
    !Number.isInteger(input.estimatedMinutes) ||
    input.estimatedMinutes <= 0
  ) {
    errors.estimatedMinutes = 'O esforço deve ser um número inteiro de minutos maior que zero.';
  } else if (input.estimatedMinutes > 1440) {
    errors.estimatedMinutes = 'O esforço não pode exceder 1440 minutos (24 horas).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUpdateTaskInput(input: Partial<UpdateTaskDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (input.title !== undefined) {
    if (input.title.trim().length === 0) {
      errors.title = 'O título do ritual não pode ser vazio.';
    } else if (input.title.trim().length > 120) {
      errors.title = 'O título deve ter no máximo 120 caracteres.';
    }
  }

  if (input.description !== undefined && input.description.length > 500) {
    errors.description = 'A descrição deve ter no máximo 500 caracteres.';
  }

  if (input.dueDate !== undefined && input.dueDate.trim().length > 0) {
    if (!isValidDateFormat(input.dueDate.trim())) {
      errors.dueDate = 'Data de vencimento inválida. Use o formato AAAA-MM-DD.';
    }
  }

  if (input.dueTime !== undefined && input.dueTime.trim().length > 0) {
    if (!isValidTimeFormat(input.dueTime.trim())) {
      errors.dueTime = 'Horário inválido. Use o formato HH:MM (ex: 14:30).';
    }
  }

  if (input.priority !== undefined && !VALID_PRIORITIES.includes(input.priority)) {
    errors.priority = 'Prioridade inválida. Escolha entre Alta, Média ou Baixa.';
  }

  if (input.category !== undefined && input.category.trim().length === 0) {
    errors.category = 'A categoria não pode ser vazia.';
  }

  if (input.estimatedMinutes !== undefined) {
    if (
      !Number.isInteger(input.estimatedMinutes) ||
      input.estimatedMinutes <= 0
    ) {
      errors.estimatedMinutes = 'O esforço deve ser um número inteiro de minutos maior que zero.';
    } else if (input.estimatedMinutes > 1440) {
      errors.estimatedMinutes = 'O esforço não pode exceder 1440 minutos (24 horas).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
