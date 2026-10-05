import test from 'node:test';
import assert from 'node:assert';
import type { CreateTaskDTO, UpdateTaskDTO } from '../../src/domain/entities/task';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  isValidDateFormat,
  isValidTimeFormat,
} from '../../src/domain/services/taskValidation';

test('Task Validation - Date and Time format validators', () => {
  assert.strictEqual(isValidDateFormat('2026-09-27'), true);
  assert.strictEqual(isValidDateFormat('2026-12-31'), true);
  assert.strictEqual(isValidDateFormat('2026-02-28'), true);
  assert.strictEqual(isValidDateFormat('2026-02-31'), false, 'February 31 is invalid');
  assert.strictEqual(isValidDateFormat('27-09-2026'), false, 'Wrong order');
  assert.strictEqual(isValidDateFormat('invalid-date'), false);

  assert.strictEqual(isValidTimeFormat('00:00'), true);
  assert.strictEqual(isValidTimeFormat('14:30'), true);
  assert.strictEqual(isValidTimeFormat('23:59'), true);
  assert.strictEqual(isValidTimeFormat('24:00'), false, '24:00 is invalid in 24h format');
  assert.strictEqual(isValidTimeFormat('12:60'), false, '60 minutes is invalid');
  assert.strictEqual(isValidTimeFormat('9:30'), false, 'Must be 2-digit hour');
});

test('Task Validation - validateCreateTaskInput valid inputs', () => {
  const result = validateCreateTaskInput({
    title: 'Decifrar o pergaminho de invocação',
    description: 'Anotar os símbolos védicos para o ritual da lua cheia.',
    dueDate: '2026-10-05',
    dueTime: '15:30',
    priority: 'Alta',
    category: 'Estudos',
    estimatedMinutes: 45,
  });

  assert.strictEqual(result.isValid, true);
  assert.strictEqual(Object.keys(result.errors).length, 0);
});

test('Task Validation - validateCreateTaskInput mandatory title', () => {
  const emptyTitle = validateCreateTaskInput({
    title: '',
    priority: 'Média',
    category: 'Estudos',
    estimatedMinutes: 30,
  });
  assert.strictEqual(emptyTitle.isValid, false);
  assert.ok(emptyTitle.errors.title);

  const whitespaceTitle = validateCreateTaskInput({
    title: '   ',
    priority: 'Média',
    category: 'Estudos',
    estimatedMinutes: 30,
  });
  assert.strictEqual(whitespaceTitle.isValid, false);
  assert.ok(whitespaceTitle.errors.title);

  const longTitle = validateCreateTaskInput({
    title: 'a'.repeat(121),
    priority: 'Média',
    category: 'Estudos',
    estimatedMinutes: 30,
  });
  assert.strictEqual(longTitle.isValid, false);
  assert.ok(longTitle.errors.title);
});

test('Task Validation - validateCreateTaskInput invalid fields feedback', () => {
  const result = validateCreateTaskInput({
    title: 'Tarefa com campos ruins',
    dueDate: '2026-99-99',
    dueTime: '99:99',
    // @ts-expect-error testing invalid priority
    priority: 'Inexistente',
    // @ts-expect-error testing empty category string
    category: '',
    estimatedMinutes: -10,
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.dueDate);
  assert.ok(result.errors.dueTime);
  assert.ok(result.errors.priority);
  assert.ok(result.errors.category);
  assert.ok(result.errors.estimatedMinutes);
});

test('Task Validation - validateUpdateTaskInput partial validation', () => {
  const validUpdate = validateUpdateTaskInput({
    title: 'Título atualizado',
    priority: 'Baixa',
  });
  assert.strictEqual(validUpdate.isValid, true);

  const invalidUpdate = validateUpdateTaskInput({
    title: '',
  });
  assert.strictEqual(invalidUpdate.isValid, false);
  assert.ok(invalidUpdate.errors.title);
});

test('Runtime validation rejects invalid category, status, subtasks and metadata', () => {
  const base = { title: 'Valid', priority: 'Alta', category: 'Estudos', estimatedMinutes: 15 };
  for (const override of [
    { title: 1 }, { category: 'Unknown' }, { status: 'unknown' }, { subtasks: [{ title: '' }] },
    { subtasks: [{ title: 'A', completed: 'yes' }] }, { subtasks: [{ title: 'A', id: 'same' }, { title: 'B', id: 'same' }] },
    { subtasks: Array.from({ length: 201 }, () => ({ title: 'A' })) }, { dueDate: '2026-02-30' }, { estimatedMinutes: NaN },
  ]) assert.equal(validateCreateTaskInput({ ...base, ...override } as unknown as CreateTaskDTO).isValid, false);
  assert.equal(validateUpdateTaskInput({ archived: 'yes' } as unknown as UpdateTaskDTO).isValid, false);
  assert.equal(validateUpdateTaskInput({ projectId: null, dueDate: '', dueTime: '' }).isValid, true);
});
