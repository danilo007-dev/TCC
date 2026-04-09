import { Routine } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type RoutineRow = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color_key: string;
  is_favorite: boolean;
  scheduled_date: string | null;
};

type RoutineStepRow = {
  id: string;
  routine_id: string;
  title: string;
  duration: string | null;
  completed: boolean;
  position: number;
};

type RoutineWithStepsRow = RoutineRow & { routine_steps: RoutineStepRow[] | null };

function mapRowToRoutine(row: RoutineWithStepsRow): Routine {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    colorKey: row.color_key,
    isFavorite: row.is_favorite,
    scheduledDate: row.scheduled_date ?? undefined,
    steps: (row.routine_steps ?? [])
      .sort((a, b) => a.position - b.position)
      .map((step) => ({
        id: step.id,
        title: step.title,
        duration: step.duration ?? undefined,
        completed: step.completed,
      })),
  };
}

export const routinesRepository = {
  isEnabled() {
    return isSupabaseConfigured && Boolean(supabase);
  },

  async fetchRoutines(userId: string): Promise<Routine[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("routines")
      .select("id,title,description,icon,color_key,is_favorite,scheduled_date,routine_steps(id,routine_id,title,duration,completed,position)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as RoutineWithStepsRow[]).map(mapRowToRoutine);
  },

  async upsertRoutine(routine: Routine, userId: string): Promise<void> {
    if (!supabase || !userId) return;

    const { error: routineError } = await supabase.from("routines").upsert(
      {
        id: routine.id,
        title: routine.title,
        description: routine.description,
        icon: routine.icon,
        color_key: routine.colorKey,
        is_favorite: routine.isFavorite,
        scheduled_date: routine.scheduledDate ?? null,
        user_id: userId,
      },
      { onConflict: "id" }
    );

    if (routineError) {
      throw new Error(routineError.message);
    }

    const { error: deleteError } = await supabase.from("routine_steps").delete().eq("routine_id", routine.id);
    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (routine.steps.length === 0) return;

    const stepRows = routine.steps.map((step, index) => ({
      id: step.id,
      routine_id: routine.id,
      title: step.title,
      duration: step.duration ?? null,
      completed: step.completed,
      position: index,
    }));

    const { error: insertError } = await supabase.from("routine_steps").insert(stepRows);
    if (insertError) {
      throw new Error(insertError.message);
    }
  },
};
