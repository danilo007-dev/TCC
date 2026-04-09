import { Task } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type SubtaskRow = {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
};

type TaskRow = {
  id: string;
  title: string;
  duration: number;
  estimated_time: string | null;
  scheduled_date: string | null;
  completed: boolean;
  completed_at: string | null;
  progress: number;
  time_of_day: string | null;
  color: string | null;
  subtasks: SubtaskRow[] | null;
};

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    duration: row.duration,
    estimatedTime: row.estimated_time ?? undefined,
    scheduledDate: row.scheduled_date ?? undefined,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    progress: row.progress,
    timeOfDay: row.time_of_day ?? undefined,
    color: row.color ?? undefined,
    subtasks: (row.subtasks ?? [])
      .sort((a, b) => a.position - b.position)
      .map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        completed: subtask.completed,
      })),
  };
}

export const taskRepository = {
  isEnabled() {
    return isSupabaseConfigured && Boolean(supabase);
  },

  async fetchTasks(userId: string): Promise<Task[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id,title,duration,estimated_time,scheduled_date,completed,completed_at,progress,time_of_day,color,subtasks(id,task_id,title,completed,position)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as TaskRow[]).map(mapRowToTask);
  },

  async upsertTask(task: Task, userId: string): Promise<void> {
    if (!supabase || !userId) return;

    const { error: taskError } = await supabase.from("tasks").upsert(
      {
        id: task.id,
        title: task.title,
        duration: task.duration,
        estimated_time: task.estimatedTime ?? null,
        scheduled_date: task.scheduledDate ?? null,
        completed: task.completed,
        completed_at: task.completedAt ?? null,
        progress: task.progress,
        time_of_day: task.timeOfDay ?? null,
        color: task.color ?? null,
        user_id: userId,
      },
      { onConflict: "id" }
    );

    if (taskError) {
      throw new Error(taskError.message);
    }

    const { error: deleteError } = await supabase.from("subtasks").delete().eq("task_id", task.id);
    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (task.subtasks.length === 0) return;

    const rows = task.subtasks.map((subtask, index) => ({
      id: subtask.id,
      task_id: task.id,
      title: subtask.title,
      completed: subtask.completed,
      position: index,
    }));

    const { error: insertError } = await supabase.from("subtasks").insert(rows);
    if (insertError) {
      throw new Error(insertError.message);
    }
  },
};
