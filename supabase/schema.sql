-- FocusGrid initial schema (tasks + subtasks)
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null,
  duration integer not null,
  estimated_time text,
  scheduled_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  progress real not null default 0,
  time_of_day text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subtasks_task_id on public.subtasks(task_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists subtasks_set_updated_at on public.subtasks;
create trigger subtasks_set_updated_at
before update on public.subtasks
for each row execute function public.set_updated_at();

-- IMPORTANT FOR TESTING ONLY:
-- If you are not using auth yet, you can disable RLS in early development.
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;

create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

create policy "subtasks_select_own" on public.subtasks for select using (auth.uid() = user_id);
create policy "subtasks_insert_own" on public.subtasks for insert with check (auth.uid() = user_id);
create policy "subtasks_update_own" on public.subtasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subtasks_delete_own" on public.subtasks for delete using (auth.uid() = user_id);

create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id),
  title text not null,
  description text not null,
  progress integer not null default 0,
  type text not null check (type in ('short', 'long')),
  scheduled_date date,
  completed_steps integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id text not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_goal_steps_goal_id on public.goal_steps(goal_id);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists goal_steps_set_updated_at on public.goal_steps;
create trigger goal_steps_set_updated_at
before update on public.goal_steps
for each row execute function public.set_updated_at();

create table if not exists public.routines (
  id text primary key,
  user_id uuid not null references auth.users(id),
  title text not null,
  description text not null,
  icon text not null,
  color_key text not null,
  scheduled_date date,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_steps (
  id text primary key,
  routine_id text not null references public.routines(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  title text not null,
  duration text,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_routine_steps_routine_id on public.routine_steps(routine_id);

drop trigger if exists routines_set_updated_at on public.routines;
create trigger routines_set_updated_at
before update on public.routines
for each row execute function public.set_updated_at();

drop trigger if exists routine_steps_set_updated_at on public.routine_steps;
create trigger routine_steps_set_updated_at
before update on public.routine_steps
for each row execute function public.set_updated_at();

alter table public.goals enable row level security;
alter table public.goal_steps enable row level security;

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

create policy "goal_steps_select_own" on public.goal_steps for select using (auth.uid() = user_id);
create policy "goal_steps_insert_own" on public.goal_steps for insert with check (auth.uid() = user_id);
create policy "goal_steps_update_own" on public.goal_steps for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goal_steps_delete_own" on public.goal_steps for delete using (auth.uid() = user_id);
alter table public.routines enable row level security;
alter table public.routine_steps enable row level security;

create policy "routines_select_own" on public.routines for select using (auth.uid() = user_id);
create policy "routines_insert_own" on public.routines for insert with check (auth.uid() = user_id);
create policy "routines_update_own" on public.routines for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routines_delete_own" on public.routines for delete using (auth.uid() = user_id);

create policy "routine_steps_select_own" on public.routine_steps for select using (auth.uid() = user_id);
create policy "routine_steps_insert_own" on public.routine_steps for insert with check (auth.uid() = user_id);
create policy "routine_steps_update_own" on public.routine_steps for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routine_steps_delete_own" on public.routine_steps for delete using (auth.uid() = user_id);

-- =============================================================
-- PRODUCTION HARDENING (apply when auth is enabled)
-- =============================================================
-- 1) Add ownership columns
-- alter table public.tasks add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table public.subtasks add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table public.goals add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table public.goal_steps add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table public.routines add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table public.routine_steps add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2) Enable RLS
-- alter table public.tasks enable row level security;
-- alter table public.subtasks enable row level security;
-- alter table public.goals enable row level security;
-- alter table public.goal_steps enable row level security;
-- alter table public.routines enable row level security;
-- alter table public.routine_steps enable row level security;

-- 3) Create policies (example for tasks)
-- create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
-- create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
-- create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
-- create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);
