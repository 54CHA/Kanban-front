export type Priority = 'low' | 'medium' | 'high';
export type Status = 'backlog' | 'active' | 'finished';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string | null;
  dueTime: string | null;
  subTasks: Task[];
}