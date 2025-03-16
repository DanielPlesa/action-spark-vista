
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  project: string;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}
