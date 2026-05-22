create table if not exists public.keyword_rankings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  keyword text not null,
  intent text not null check (intent in ('Informational', 'Commercial', 'Transactional', 'Navigational', 'Local')),
  mapped_page text not null,
  current_position integer not null check (current_position > 0),
  previous_position integer not null check (previous_position > 0),
  position_delta integer not null default 0,
  volume integer not null default 0 check (volume >= 0),
  difficulty integer not null check (difficulty between 0 and 100),
  serp_features text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.report_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  period text not null,
  status text not null check (status in ('Draft', 'Review', 'Published', 'Scheduled')),
  due_date date not null,
  readiness_score integer not null check (readiness_score between 0 and 100),
  sections_ready integer not null default 0 check (sections_ready >= 0),
  total_sections integer not null check (total_sections > 0),
  last_updated timestamptz not null default now(),
  client_visible boolean not null default false,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  owner_name text not null
);

create index if not exists idx_keyword_rankings_workspace_id_position on public.keyword_rankings(workspace_id, current_position);
create index if not exists idx_keyword_rankings_workspace_id_updated_at on public.keyword_rankings(workspace_id, updated_at desc);
create index if not exists idx_report_snapshots_workspace_id_due_date on public.report_snapshots(workspace_id, due_date);
create index if not exists idx_report_snapshots_workspace_id_status on public.report_snapshots(workspace_id, status);
