create table if not exists public.workspace_access (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin', 'hod', 'manager', 'specialist', 'analyst', 'client')),
  modules_enabled text[] not null default '{}',
  can_assign_tasks boolean not null default false,
  suggestion_access text not null default 'none' check (suggestion_access in ('full', 'view-only', 'none')),
  can_generate_reports boolean not null default false,
  can_see_internal_notes boolean not null default false,
  can_run_scans boolean not null default false,
  can_export boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, profile_id)
);

create index if not exists idx_workspace_access_profile_id on public.workspace_access(profile_id);
create index if not exists idx_workspace_access_workspace_id_role on public.workspace_access(workspace_id, role);
