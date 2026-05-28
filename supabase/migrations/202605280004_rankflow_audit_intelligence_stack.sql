create table if not exists public.audit_evidence_source_statuses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null check (source in ('own-crawler', 'screaming-frog', 'gsc', 'ga4', 'ahrefs', 'semrush', 'dataforseo', 'claude-brain')),
  label text not null,
  status text not null check (status in ('Connected', 'Import Ready', 'Needs Setup', 'Error')),
  coverage_score integer not null default 0 check (coverage_score between 0 and 100),
  last_synced_at timestamptz,
  records_available integer not null default 0 check (records_available >= 0),
  primary_use text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.technical_rule_checks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null,
  label text not null,
  description text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  affected_urls integer not null default 0 check (affected_urls >= 0),
  passed_urls integer not null default 0 check (passed_urls >= 0),
  failed_urls integer not null default 0 check (failed_urls >= 0),
  source text not null check (source in ('own-crawler', 'screaming-frog')),
  measured_at timestamptz not null default now()
);

create table if not exists public.search_performance_signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null check (source in ('gsc', 'ga4')),
  label text not null,
  value numeric(14, 2) not null default 0,
  delta numeric(14, 2) not null default 0,
  category text not null check (category in ('impressions', 'clicks', 'ctr', 'sessions', 'leads', 'conversions')),
  measured_at timestamptz not null default now()
);

create table if not exists public.authority_signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null check (source in ('ahrefs', 'semrush', 'dataforseo')),
  label text not null,
  value numeric(14, 2) not null default 0,
  delta numeric(14, 2) not null default 0,
  category text not null check (category in ('backlinks', 'referring-domains', 'keyword-rank', 'competitor-gap', 'authority-score')),
  measured_at timestamptz not null default now()
);

create table if not exists public.claude_brain_audit_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null check (status in ('Ready', 'Running', 'Needs Approval', 'Completed', 'Blocked')),
  input_sources text[] not null default '{}',
  confidence_score integer not null default 0 check (confidence_score between 0 and 100),
  prompt_version text not null,
  findings_generated integer not null default 0 check (findings_generated >= 0),
  actions_generated integer not null default 0 check (actions_generated >= 0),
  report_narratives_generated integer not null default 0 check (report_narratives_generated >= 0),
  requires_human_approval boolean not null default true,
  last_run_at timestamptz not null default now()
);

create index if not exists idx_audit_evidence_source_statuses_workspace_status
  on public.audit_evidence_source_statuses(workspace_id, status);

create index if not exists idx_technical_rule_checks_workspace_severity
  on public.technical_rule_checks(workspace_id, severity);

create index if not exists idx_search_performance_signals_workspace_measured
  on public.search_performance_signals(workspace_id, measured_at desc);

create index if not exists idx_authority_signals_workspace_measured
  on public.authority_signals(workspace_id, measured_at desc);

create index if not exists idx_claude_brain_audit_runs_workspace_last_run
  on public.claude_brain_audit_runs(workspace_id, last_run_at desc);
