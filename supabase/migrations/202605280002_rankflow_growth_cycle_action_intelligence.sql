create table if not exists public.organic_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  measured_at timestamptz not null,
  search_impressions integer not null default 0 check (search_impressions >= 0),
  organic_clicks integer not null default 0 check (organic_clicks >= 0),
  organic_ctr numeric(6, 2) not null default 0,
  average_position numeric(6, 2) not null default 0,
  keywords_top_3 integer not null default 0 check (keywords_top_3 >= 0),
  keywords_top_10 integer not null default 0 check (keywords_top_10 >= 0),
  ranking_improved integer not null default 0 check (ranking_improved >= 0),
  ranking_declined integer not null default 0 check (ranking_declined >= 0),
  organic_sessions integer not null default 0 check (organic_sessions >= 0),
  organic_users integer not null default 0 check (organic_users >= 0),
  referral_sessions integer not null default 0 check (referral_sessions >= 0),
  organic_leads integer not null default 0 check (organic_leads >= 0),
  organic_conversion_rate numeric(6, 2) not null default 0,
  backlinks integer not null default 0 check (backlinks >= 0),
  referring_domains integer not null default 0 check (referring_domains >= 0),
  new_backlinks integer not null default 0 check (new_backlinks >= 0),
  lost_backlinks integer not null default 0 check (lost_backlinks >= 0),
  aeo_visibility integer not null default 0 check (aeo_visibility between 0 and 100),
  geo_visibility integer not null default 0 check (geo_visibility between 0 and 100),
  local_visibility integer not null default 0 check (local_visibility between 0 and 100),
  technical_health integer not null default 0 check (technical_health between 0 and 100)
);

create table if not exists public.organic_growth_cycles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  period text not null,
  stage text not null check (stage in ('Audit', 'Analyse', 'Act', 'Report', 'Re-audit')),
  audit_id uuid references public.scans(id) on delete set null,
  baseline_snapshot_id uuid references public.organic_metric_snapshots(id) on delete set null,
  latest_snapshot_id uuid references public.organic_metric_snapshots(id) on delete set null,
  actions_created integer not null default 0 check (actions_created >= 0),
  actions_completed integer not null default 0 check (actions_completed >= 0),
  actions_overdue integer not null default 0 check (actions_overdue >= 0),
  reports_published integer not null default 0 check (reports_published >= 0),
  next_audit_due date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null check (source in ('audit', 'ai-suggestion', 'local-visibility', 'keyword', 'report', 'manual')),
  source_id text not null,
  title text not null,
  impact_area text not null check (impact_area in ('visibility', 'traffic', 'conversion', 'authority', 'local', 'aeo', 'geo', 'technical', 'execution')),
  priority text not null check (priority in ('critical', 'high', 'medium', 'low')),
  status text not null check (status in ('Backlog', 'Planned', 'In Progress', 'Evidence Review', 'Done', 'Blocked')),
  execution_mode text not null check (execution_mode in ('inside-rankflow', 'outside-rankflow')),
  owner_name text not null,
  due_date date,
  expected_impact text not null,
  completed_at timestamptz,
  evidence_required boolean not null default true,
  impact_score integer not null default 0 check (impact_score between 0 and 100),
  client_report_contribution boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.action_evidence (
  id uuid primary key default gen_random_uuid(),
  action_item_id uuid not null references public.action_items(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  submitted_by text not null,
  evidence_type text not null check (evidence_type in ('url', 'screenshot', 'note', 'cms-log', 'analytics-snapshot')),
  label text not null,
  value text not null,
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  approval_status text not null check (approval_status in ('Pending', 'Approved', 'Rejected'))
);

create table if not exists public.expert_efficiency_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_name text not null,
  assigned_actions integer not null default 0 check (assigned_actions >= 0),
  completed_actions integer not null default 0 check (completed_actions >= 0),
  overdue_actions integer not null default 0 check (overdue_actions >= 0),
  average_completion_days numeric(6, 2) not null default 0,
  evidence_approval_rate integer not null default 0 check (evidence_approval_rate between 0 and 100),
  impact_delivered integer not null default 0 check (impact_delivered between 0 and 100),
  client_report_contributions integer not null default 0 check (client_report_contributions >= 0),
  measured_at timestamptz not null default now()
);

create index if not exists idx_organic_metric_snapshots_workspace_measured
  on public.organic_metric_snapshots(workspace_id, measured_at desc);

create index if not exists idx_organic_growth_cycles_workspace_period
  on public.organic_growth_cycles(workspace_id, period);

create index if not exists idx_action_items_workspace_status
  on public.action_items(workspace_id, status);

create index if not exists idx_action_items_workspace_owner
  on public.action_items(workspace_id, owner_name);

create index if not exists idx_action_items_workspace_due_date
  on public.action_items(workspace_id, due_date);

create index if not exists idx_action_evidence_action_item_id
  on public.action_evidence(action_item_id);

create index if not exists idx_expert_efficiency_workspace_measured
  on public.expert_efficiency_snapshots(workspace_id, measured_at desc);
