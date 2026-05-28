create table if not exists public.ai_brain_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null check (status in ('Active', 'Needs Data', 'Paused')),
  last_run_at timestamptz not null default now(),
  confidence_score integer not null check (confidence_score between 0 and 100),
  data_coverage_score integer not null check (data_coverage_score between 0 and 100),
  automation_mode text not null check (automation_mode in ('read-only', 'approval-required', 'autonomous-disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_brain_insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  narrative text not null,
  area text not null check (area in ('visibility', 'traffic', 'conversion', 'authority', 'local', 'aeo', 'geo', 'technical', 'execution')),
  confidence integer not null check (confidence between 0 and 100),
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  evidence_refs text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_brain_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  reason text not null,
  target_action text not null,
  priority text not null check (priority in ('critical', 'high', 'medium', 'low')),
  expected_lift text not null,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_brain_narratives (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audience text not null check (audience in ('client', 'internal', 'hod')),
  title text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_brain_risks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  mitigation text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_brain_profiles_workspace_updated
  on public.ai_brain_profiles(workspace_id, updated_at desc);

create index if not exists idx_ai_brain_insights_workspace_area
  on public.ai_brain_insights(workspace_id, area);

create index if not exists idx_ai_brain_recommendations_workspace_priority
  on public.ai_brain_recommendations(workspace_id, priority);

create index if not exists idx_ai_brain_narratives_workspace_audience
  on public.ai_brain_narratives(workspace_id, audience);

create index if not exists idx_ai_brain_risks_workspace_severity
  on public.ai_brain_risks(workspace_id, severity);
