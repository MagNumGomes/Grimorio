import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, Project, CreateTaskDTO, UpdateTaskDTO, CreateProjectDTO, TaskStatus, TaskSortOrder } from '../../domain/entities/task';
import { suggestTaskOrder, calculatePriorityScore } from '../../domain/services/prioritization';
import { filterTasks } from '../../domain/services/taskFiltering';
import { taskRepository } from '../../infrastructure/repositories/taskRepository';
import { getTodayDateString, parseDateTime } from '../../shared/utils/dateUtils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [todayOnly, setTodayOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('suggested');
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 60000); return () => clearInterval(timer); }, []);
  const refresh = useCallback(async () => {
    const [nextTasks, nextProjects] = await Promise.all([taskRepository.getTasks(), taskRepository.getProjects()]);
    setTasks(nextTasks); setProjects(nextProjects);
  }, []);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar dados.'); }
    finally { setLoading(false); }
  }, [refresh]);
  useEffect(() => { void reload(); }, [reload]);
  const mutate = useCallback(async <T,>(operation: () => Promise<T>) => { const value = await operation(); await refresh(); return value; }, [refresh]);
  const activeTasks = useMemo(() => tasks.filter(t => !t.archived), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter(t => t.archived), [tasks]);
  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || todayOnly;
  const clearFilters = () => { setStatusFilter('all'); setCategoryFilter('all'); setPriorityFilter('all'); setProjectFilter('all'); setTodayOnly(false); };
  const processedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, { status: statusFilter, category: categoryFilter, priority: priorityFilter, projectId: projectFilter, dueDate: todayOnly ? getTodayDateString() : undefined });
    if (sortOrder === 'suggested') return suggestTaskOrder(filtered, clock);
    const weights = { Alta: 3, Média: 2, Baixa: 1 };
    filtered.sort((a, b) => {
      if (sortOrder === 'priority') return weights[b.priority] - weights[a.priority];
      if (sortOrder === 'effort') return a.estimatedMinutes - b.estimatedMinutes;
      if (sortOrder === 'createdAt') return b.createdAt.localeCompare(a.createdAt);
      if (sortOrder === 'title') return a.title.localeCompare(b.title);
      return (parseDateTime(a.dueDate, a.dueTime)?.getTime() ?? Number.MAX_SAFE_INTEGER) - (parseDateTime(b.dueDate, b.dueTime)?.getTime() ?? Number.MAX_SAFE_INTEGER);
    });
    return filtered.map(t => calculatePriorityScore(t, clock));
  }, [tasks, statusFilter, categoryFilter, priorityFilter, projectFilter, todayOnly, sortOrder, clock]);
  return {
    tasks, projects, activeTasks, archivedTasks, processedTasks, loading, error, reload,
    statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, priorityFilter, setPriorityFilter,
    projectFilter, setProjectFilter, todayOnly, setTodayOnly, sortOrder, setSortOrder, hasActiveFilters, clearFilters,
    createTask: (dto: CreateTaskDTO) => mutate(() => taskRepository.createTask(dto)),
    updateTask: (id: string, dto: UpdateTaskDTO) => mutate(() => taskRepository.updateTask(id, dto)),
    toggleStatus: (id: string) => mutate(() => taskRepository.toggleTaskStatus(id)),
    toggleSubtask: (id: string, subId: string) => mutate(() => taskRepository.toggleSubtask(id, subId)),
    moveTask: (id: string, status: TaskStatus) => mutate(() => taskRepository.moveTaskKanban(id, status)),
    archiveTask: (id: string) => mutate(() => taskRepository.archiveTask(id)),
    restoreTask: (id: string) => mutate(() => taskRepository.restoreTask(id)),
    deleteTask: (id: string) => mutate(() => taskRepository.deleteTask(id)),
    createProject: (dto: CreateProjectDTO) => mutate(() => taskRepository.createProject(dto)),
    deleteProject: async (id: string) => { await mutate(() => taskRepository.deleteProject(id)); if (projectFilter === id) setProjectFilter('all'); },
  };
}
