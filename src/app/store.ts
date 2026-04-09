import { DayProgress, Task } from "./types";
import { taskRepository } from "./repositories/taskRepository";

const WEEK_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

const DEV_TASKS: Task[] = [
  {
    id: "bb9c5ff8-1f8a-4522-b809-49b13b4db4f0",
    title: "Estudar biologia",
    duration: 30,
    estimatedTime: "30 min",
    scheduledDate: "2026-04-08",
    completed: false,
    progress: 0,
    timeOfDay: "09:00",
    color: "#A8E6CF",
    subtasks: [
      { id: "d5606879-c745-4499-9cc6-e46fe5c96f0c", title: "Abrir o caderno", completed: false },
      { id: "af2ceda2-c4c5-4e44-a92d-22adfce31f0d", title: "Ler capítulo 3", completed: false },
      { id: "4f6828ce-730a-4be5-af74-34778eb545ab", title: "Fazer resumo", completed: false },
    ],
  },
  {
    id: "ea429e1c-a6c9-4d0f-b62f-59fe72af6fd8",
    title: "Comprar presente",
    duration: 15,
    estimatedTime: "15 min",
    scheduledDate: "2026-04-08",
    completed: false,
    progress: 0,
    timeOfDay: "14:00",
    color: "#FFD3B6",
    subtasks: [
      { id: "654568f9-13f8-4db5-9eaf-587c5d8cf7b4", title: "Pensar em ideias", completed: false },
      { id: "3dcf1018-065d-4257-969e-a79119859039", title: "Pesquisar online", completed: false },
      { id: "090d17d5-e39e-47ff-8229-ec4ccf454805", title: "Fazer o pedido", completed: false },
    ],
  },
  {
    id: "557e49b5-8d73-498d-a18f-f4d2ee99dd14",
    title: "Trabalho de história",
    duration: 45,
    estimatedTime: "45 min",
    scheduledDate: "2026-04-08",
    completed: false,
    progress: 0,
    timeOfDay: "16:00",
    color: "#FFAAA5",
    subtasks: [
      { id: "65a2ca1d-0132-4f18-a986-f935c25103d7", title: "Abrir documento", completed: false },
      { id: "6df8a9f2-4045-467d-9768-29bd5f5c0f9a", title: "Escrever introdução", completed: false },
      { id: "6404efee-5220-44fb-ab4c-f16f8f20f2d5", title: "Pesquisar tema", completed: false },
      { id: "dbdf967e-2115-ad8d-7ea64b3e4d9b", title: "Adicionar referências", completed: false },
    ],
  },
];

export class TaskStore {
  private tasks: Task[];
  private listeners: Array<() => void> = [];
  private currentUserId: string | null = null;

  constructor() {
    this.tasks = import.meta.env.DEV && !taskRepository.isEnabled() ? [...DEV_TASKS] : [];
    void this.hydrateFromDatabase();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private async hydrateFromDatabase() {
    if (!taskRepository.isEnabled() || !this.currentUserId) return;

    try {
      const tasks = await taskRepository.fetchTasks(this.currentUserId);
      if (tasks.length > 0) {
        this.tasks = tasks;
        this.notify();
      }
    } catch (error) {
      console.error("Failed to hydrate tasks from database:", error);
    }
  }

  private async syncTask(task: Task) {
    if (!taskRepository.isEnabled() || !this.currentUserId) return;
    try {
      await taskRepository.upsertTask(task, this.currentUserId);
    } catch (error) {
      console.error("Failed to sync task to database:", error);
    }
  }

  setUserId(userId: string | null) {
    if (this.currentUserId === userId) return;
    this.currentUserId = userId;

    this.tasks = import.meta.env.DEV && !taskRepository.isEnabled() && !userId ? [...DEV_TASKS] : [];
    this.notify();

    if (userId && taskRepository.isEnabled()) {
      void this.hydrateFromDatabase();
    }
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  getTask(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  addTask(task: Omit<Task, "id">) {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      scheduledDate: task.scheduledDate ?? new Date().toISOString().slice(0, 10),
      userId: this.currentUserId ?? undefined,
    };
    this.tasks.push(newTask);
    this.notify();
    void this.syncTask(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.notify();
      void this.syncTask(this.tasks[index]);
    }
  }

  toggleSubtask(taskId: string, subtaskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      const subtask = task.subtasks.find((s) => s.id === subtaskId);
      if (subtask) {
        subtask.completed = !subtask.completed;
        const completedCount = task.subtasks.filter((s) => s.completed).length;
        task.progress = (completedCount / task.subtasks.length) * 100;
        if (task.progress === 100) {
          task.completed = true;
          task.completedAt = new Date().toISOString();
        } else {
          task.completed = false;
          task.completedAt = undefined;
        }
        this.notify();
        void this.syncTask(task);
      }
    }
  }

  completeTask(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = true;
      task.completedAt = new Date().toISOString();
      task.progress = 100;
      task.subtasks.forEach((s) => (s.completed = true));
      this.notify();
      void this.syncTask(task);
    }
  }

  getCompletedTasksCount(): number {
    return this.tasks.filter((t) => t.completed).length;
  }

  getTotalTasksCount(): number {
    return this.tasks.length;
  }

  getWeeklyProgress(): DayProgress[] {
    const today = new Date();
    const days: DayProgress[] = [];

    for (let offset = 6; offset >= 0; offset--) {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - offset);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const tasksCompleted = this.tasks.filter((task) => {
        if (!task.completedAt) return false;
        const completedAt = new Date(task.completedAt);
        return completedAt >= day && completedAt < nextDay;
      }).length;

      days.push({
        date: day.toISOString().slice(0, 10),
        label: WEEK_LABELS[day.getDay()],
        tasksCompleted,
        isToday: offset === 0,
      });
    }

    return days;
  }

  getCurrentStreak(): number {
    const completedDates = new Set(
      this.tasks
        .filter((task) => task.completedAt)
        .map((task) => new Date(task.completedAt as string).toISOString().slice(0, 10))
    );

    if (completedDates.size === 0) return 0;

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (completedDates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  breakdownTask(taskTitle: string): {
    task: string;
    subtasks: string[];
    estimatedTime: string;
    encouragement: string;
  } {
    const keywords = taskTitle.toLowerCase();

    if (keywords.includes("estudar") || keywords.includes("study")) {
      return {
        task: taskTitle,
        subtasks: [
          "Separar material necessário",
          "Ler o conteúdo",
          "Fazer anotações",
          "Revisar pontos principais",
        ],
        estimatedTime: "30 min",
        encouragement: "Vamos começar pequeno. Apenas abra o material primeiro!",
      };
    }

    if (keywords.includes("trabalho") || keywords.includes("project")) {
      return {
        task: taskTitle,
        subtasks: [
          "Abrir o documento",
          "Escrever o primeiro parágrafo",
          "Pesquisar informações",
          "Organizar ideias",
        ],
        estimatedTime: "45 min",
        encouragement: "Um passo de cada vez. Que tal apenas abrir o documento?",
      };
    }

    return {
      task: taskTitle,
      subtasks: [
        "Preparar o que é necessário",
        "Começar a primeira parte",
        "Continuar o trabalho",
        "Finalizar",
      ],
      estimatedTime: "15 min",
      encouragement: "Vamos tornar isso simples. Comece com o primeiro passo!",
    };
  }

  async breakdownTaskWithAI(taskTitle: string): Promise<{
    task: string;
    subtasks: string[];
    estimatedTime: string;
    encouragement: string;
  }> {
    const endpoint = import.meta.env.VITE_AI_BREAKDOWN_ENDPOINT as string | undefined;

    if (!endpoint) {
      return this.breakdownTask(taskTitle);
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskTitle }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate AI suggestion");
      }

      const data = await response.json();
      if (!data?.task || !Array.isArray(data?.subtasks) || !data?.estimatedTime || !data?.encouragement) {
        throw new Error("Invalid AI response format");
      }

      return {
        task: data.task,
        subtasks: data.subtasks,
        estimatedTime: data.estimatedTime,
        encouragement: data.encouragement,
      };
    } catch {
      return this.breakdownTask(taskTitle);
    }
  }
}

export const taskStore = new TaskStore();
