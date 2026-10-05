import type { Task, TaskFilterOptions } from '../entities/task';

export function filterTasks(tasks: Task[], options: TaskFilterOptions = {}): Task[] {
  return tasks.filter((task) =>
    !task.archived &&
    (!options.status || options.status === 'all' || task.status === options.status) &&
    (!options.category || options.category === 'all' || task.category === options.category) &&
    (!options.priority || options.priority === 'all' || task.priority === options.priority) &&
    (!options.projectId || options.projectId === 'all' || task.projectId === options.projectId) &&
    (!options.dueDate || task.dueDate === options.dueDate) &&
    (!options.searchQuery || task.title.toLocaleLowerCase().includes(options.searchQuery.toLocaleLowerCase()))
  );
}
