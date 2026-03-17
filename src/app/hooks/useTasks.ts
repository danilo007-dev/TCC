import { useEffect, useState } from "react";
import { taskStore } from "../store";
import { Task } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  return tasks;
}
