create table if not exists public.rankflow_live_state (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_rankflow_live_state_updated_at
  on public.rankflow_live_state(updated_at desc);
