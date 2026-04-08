export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  estimatedTime?: string;
  scheduledDate?: string;
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  progress: number;
  timeOfDay?: string;
  color?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DayProgress {
  date: string;
  label: string;
  tasksCompleted: number;
  isToday?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: "short" | "long";
  steps: string[];
  completedSteps: number;
}

export interface RoutineStep {
  id: string;
  title: string;
  duration?: string;
  completed: boolean;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorKey: string;
  isFavorite: boolean;
  steps: RoutineStep[];
}
