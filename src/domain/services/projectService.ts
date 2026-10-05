import type { Project, Task } from '../entities/task';

export interface ProjectProgressSummary {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}

export function calculateProjectProgress(project: Project, tasks: Task[]): ProjectProgressSummary {
  const projectTasks = tasks.filter((task) => task.projectId === project.id && !task.archived);
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((task) => task.status === 'done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    projectId: project.id,
    projectName: project.name,
    totalTasks,
    completedTasks,
    progressPercent,
  };
}

export function getAllProjectsProgress(projects: Project[], tasks: Task[]): ProjectProgressSummary[] {
  return projects.map((project) => calculateProjectProgress(project, tasks));
}
