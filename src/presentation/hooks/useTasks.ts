import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskSortOrder,
} from '../../domain/entities/task';
import {
  suggestTaskOrder,
  calculatePriorityScore,
  PrioritizedTask,
} from '../../domain/services/prioritization';
import { taskRepository } from '../../infrastructure/repositories/taskRepository';
import { StatusFilter } from '../components/FilterBar';
import { parseDateTime } from '../../shared/utils/dateUtils';

export function calculateTaskXp(task: Task): number {
  const base = task.priority === 'Alta' ? 40 : task.priority === 'Média' ? 25 : 15;
  const effortBonus = Math.round(task.estimatedMinutes / 2);
  return base + effortBonus;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('suggested');

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskRepository.getTasks();
      setTasks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar rituais.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter((t) => t.archived), [tasks]);

  const hasActiveFilters = useMemo(() => {
    return statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all';
  }, [statusFilter, categoryFilter, priorityFilter]);

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
  }, []);

  const processedTasks = useMemo(() => {
    const filtered = activeTasks.filter((task) => {
      if (statusFilter === 'pending' && task.status !== 'pending') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;

      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      return true;
    });

    if (sortOrder === 'suggested') {
      const prioritized = suggestTaskOrder(filtered);
      return prioritized;
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'dueDate') {
        const timeA = parseDateTime(a.dueDate, a.dueTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const timeB = parseDateTime(b.dueDate, b.dueTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      }
      if (sortOrder === 'priority') {
        const weight = { Alta: 3, Média: 2, Baixa: 1 };
        return weight[b.priority] - weight[a.priority];
      }
      if (sortOrder === 'effort') {
        return a.estimatedMinutes - b.estimatedMinutes;
      }
      return a.title.localeCompare(b.title);
    });

    return sorted.map((task) => calculatePriorityScore(task));
  }, [activeTasks, statusFilter, categoryFilter, priorityFilter, sortOrder]);

  const createTask = useCallback(async (dto: CreateTaskDTO) => {
    const created = await taskRepository.createTask(dto);
    setTasks((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTask = useCallback(async (id: string, dto: UpdateTaskDTO) => {
    const updated = await taskRepository.updateTask(id, dto);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    const toggled = await taskRepository.toggleTaskStatus(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? toggled : t)));
    return toggled;
  }, []);

  const archiveTask = useCallback(async (id: string) => {
    const archived = await taskRepository.archiveTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? archived : t)));
    return archived;
  }, []);

  const restoreTask = useCallback(async (id: string) => {
    const restored = await taskRepository.restoreTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? restored : t)));
    return restored;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const success = await taskRepository.deleteTask(id);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  }, []);

  const completedCount = useMemo(
    () => activeTasks.filter((t) => t.status === 'completed').length,
    [activeTasks]
  );

  const totalActiveCount = activeTasks.length;

  const earnedXp = useMemo(() => {
    return activeTasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + calculateTaskXp(t), 0);
  }, [activeTasks]);

  return {
    tasks,
    activeTasks,
    archivedTasks,
    processedTasks,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    sortOrder,
    setSortOrder,
    hasActiveFilters,
    clearFilters,
    createTask,
    updateTask,
    toggleStatus,
    archiveTask,
    restoreTask,
    deleteTask,
    completedCount,
    totalActiveCount,
    earnedXp,
    reload: loadTasks,
  };
}
