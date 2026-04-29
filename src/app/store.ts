import { Task } from "./types";

// Simple in-memory store for demo purposes
class TaskStore {
  private readonly today = new Date().toISOString().slice(0, 10);

  private tasks: Task[] = [
    {
      id: "1",
      title: "Estudar biologia",
      duration: 30,
      estimatedTime: "30 min",
      completed: false,
      progress: 0,
      timeOfDay: "09:00",
      dueDate: this.today,
      color: "#A8E6CF",
      subtasks: [
        { id: "1-1", title: "Abrir o caderno", completed: false },
        { id: "1-2", title: "Ler capítulo 3", completed: false },
        { id: "1-3", title: "Fazer resumo", completed: false },
      ],
    },
    {
      id: "2",
      title: "Comprar presente",
      duration: 15,
      estimatedTime: "15 min",
      completed: false,
      progress: 0,
      timeOfDay: "14:00",
      dueDate: this.today,
      color: "#FFD3B6",
      subtasks: [
        { id: "2-1", title: "Pensar em ideias", completed: false },
        { id: "2-2", title: "Pesquisar online", completed: false },
        { id: "2-3", title: "Fazer o pedido", completed: false },
      ],
    },
    {
      id: "3",
      title: "Trabalho de história",
      duration: 45,
      estimatedTime: "45 min",
      completed: false,
      progress: 0,
      timeOfDay: "16:00",
      dueDate: this.today,
      color: "#FFAAA5",
      subtasks: [
        { id: "3-1", title: "Abrir documento", completed: false },
        { id: "3-2", title: "Escrever introdução", completed: false },
        { id: "3-3", title: "Pesquisar tema", completed: false },
        { id: "3-4", title: "Adicionar referências", completed: false },
      ],
    },
  ];

  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
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
      id: Date.now().toString(),
    };
    this.tasks.push(newTask);
    this.notify();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.notify();
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
        }
        this.notify();
      }
    }
  }

  completeTask(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = true;
      task.progress = 100;
      task.subtasks.forEach((s) => (s.completed = true));
      this.notify();
    }
  }

  getCompletedTasksCount(): number {
    return this.tasks.filter((t) => t.completed).length;
  }

  getTotalTasksCount(): number {
    return this.tasks.length;
  }

  // Mock AI task breakdown
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
    
    // Default breakdown
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
}

export const taskStore = new TaskStore();
