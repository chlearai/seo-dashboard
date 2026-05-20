create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('super_admin', 'hod', 'manager', 'specialist', 'analyst', 'client')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  client_name text not null,
  industry text not null,
  manager_profile_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('Delivering', 'At Risk', 'Active', 'Paused')),
  team_size integer not null default 0 check (team_size >= 0),
  next_report_due date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.workspace_scores (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  composite_score integer not null check (composite_score between 0 and 100),
  technical_score integer not null check (technical_score between 0 and 100),
  on_page_score integer not null check (on_page_score between 0 and 100),
  off_page_score integer not null check (off_page_score between 0 and 100),
  local_score integer not null check (local_score between 0 and 100),
  aeo_score integer not null check (aeo_score between 0 and 100),
  geo_score integer not null check (geo_score between 0 and 100),
  score_delta_mom integer not null default 0,
  organic_traffic_delta numeric(8, 2) not null default 0,
  keywords_top_10 integer not null default 0 check (keywords_top_10 >= 0),
  measured_at timestamptz not null default now()
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  scan_type text not null check (scan_type in ('Full Site Crawl', 'On-Page Deep Audit', 'Performance Scan', 'Rank Snapshot')),
  initiated_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  status text not null check (status in ('Queued', 'Running', 'Completed', 'Partial', 'Failed')),
  pages_crawled integer not null default 0 check (pages_crawled >= 0),
  keywords_checked integer not null default 0 check (keywords_checked >= 0),
  score integer not null check (score between 0 and 100),
  delta integer not null default 0,
  issues jsonb not null default '{"critical":0,"high":0,"medium":0,"low":0}'::jsonb,
  suggestions_generated integer not null default 0 check (suggestions_generated >= 0),
  raw_data_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_key text not null,
  name text not null,
  score integer not null check (score between 0 and 100),
  failed_checks integer not null default 0 check (failed_checks >= 0),
  total_checks integer not null check (total_checks > 0),
  top_issue text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  updated_at timestamptz not null default now(),
  unique (workspace_id, category_key)
);

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  check_id text not null,
  page_path text not null,
  title text not null,
  recommendation text not null,
  source text not null,
  status text not null check (status in ('New', 'Accepted', 'Edited', 'Rejected', 'Implemented')),
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  estimated_impact text not null check (estimated_impact in ('High', 'Medium', 'Low')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workbook_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  suggestion_id uuid references public.ai_suggestions(id) on delete set null,
  title text not null,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  owner_name text not null,
  priority text not null check (priority in ('critical', 'high', 'medium', 'low')),
  status text not null check (status in ('Backlog', 'In Progress', 'Review', 'Done')),
  due_date date,
  evidence_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_organization_id on public.profiles(organization_id);
create index if not exists idx_workspaces_organization_id on public.workspaces(organization_id);
create index if not exists idx_workspace_scores_workspace_id_measured_at on public.workspace_scores(workspace_id, measured_at desc);
create index if not exists idx_scans_workspace_id_created_at on public.scans(workspace_id, created_at desc);
create index if not exists idx_audit_categories_workspace_id on public.audit_categories(workspace_id);
create index if not exists idx_ai_suggestions_workspace_id_status on public.ai_suggestions(workspace_id, status);
create index if not exists idx_workbook_tasks_workspace_id_status on public.workbook_tasks(workspace_id, status);
