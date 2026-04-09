import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskStore } from "../app/store";

vi.mock("../app/repositories/taskRepository", () => ({
  taskRepository: {
    isEnabled: vi.fn(() => false),
    fetchTasks: vi.fn(async () => []),
    upsertTask: vi.fn(async () => undefined),
  },
}));

describe("TaskStore", () => {
  let store: TaskStore;

  beforeEach(() => {
    store = new TaskStore();
  });

  it("creates a new task with generated id and scheduled date", () => {
    const task = store.addTask({
      title: "Teste de tarefa",
      duration: 20,
      completed: false,
      progress: 0,
      subtasks: [],
    });

    expect(task.id).toBeTruthy();
    expect(task.scheduledDate).toBe(new Date().toISOString().slice(0, 10));
    expect(store.getTask(task.id)).toEqual(task);
  });

  it("updates a task and keeps id stable", () => {
    const task = store.addTask({
      title: "Tarefa para editar",
      duration: 10,
      completed: false,
      progress: 0,
      subtasks: [],
    });

    store.updateTask(task.id, { title: "Tarefa editada" });
    const updated = store.getTask(task.id);

    expect(updated).toBeDefined();
    expect(updated?.title).toBe("Tarefa editada");
    expect(updated?.id).toBe(task.id);
  });

  it("returns current tasks count and completed tasks count", () => {
    const task = store.addTask({
      title: "Tarefa de contagem",
      duration: 15,
      completed: false,
      progress: 0,
      subtasks: [],
    });

    expect(store.getTotalTasksCount()).toBeGreaterThanOrEqual(1);
    expect(store.getCompletedTasksCount()).toBe(0);

    store.completeTask(task.id);
    expect(store.getCompletedTasksCount()).toBe(1);
  });
});
