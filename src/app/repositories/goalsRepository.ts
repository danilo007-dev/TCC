import { Goal } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type GoalRow = {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: "short" | "long";
  completed_steps: number;
};

type GoalStepRow = {
  id: string;
  goal_id: string;
  title: string;
  position: number;
};

type GoalWithStepsRow = GoalRow & { goal_steps: GoalStepRow[] | null };

function mapRowToGoal(row: GoalWithStepsRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    progress: row.progress,
    type: row.type,
    completedSteps: row.completed_steps,
    steps: (row.goal_steps ?? [])
      .sort((a, b) => a.position - b.position)
      .map((step) => step.title),
  };
}

export const goalsRepository = {
  isEnabled() {
    return isSupabaseConfigured && Boolean(supabase);
  },

  async fetchGoals(): Promise<Goal[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("goals")
      .select("id,title,description,progress,type,completed_steps,goal_steps(id,goal_id,title,position)")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as GoalWithStepsRow[]).map(mapRowToGoal);
  },

  async upsertGoal(goal: Goal): Promise<void> {
    if (!supabase) return;

    const { error: goalError } = await supabase.from("goals").upsert(
      {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        progress: goal.progress,
        type: goal.type,
        completed_steps: goal.completedSteps,
      },
      { onConflict: "id" }
    );

    if (goalError) {
      throw new Error(goalError.message);
    }

    const { error: deleteError } = await supabase.from("goal_steps").delete().eq("goal_id", goal.id);
    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (goal.steps.length === 0) return;

    const stepRows = goal.steps.map((title, index) => ({
      goal_id: goal.id,
      title,
      position: index,
    }));

    const { error: insertError } = await supabase.from("goal_steps").insert(stepRows);
    if (insertError) {
      throw new Error(insertError.message);
    }
  },

  async deleteGoal(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  },
};
