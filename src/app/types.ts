export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  estimatedTime?: string;
  completed: boolean;
  subtasks: Subtask[];
  progress: number;
  timeOfDay?: string;
  dueDate?: string; // yyyy-mm-dd
  color?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DayProgress {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  streak: number;
}
