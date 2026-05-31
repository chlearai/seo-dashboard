import {
  actionItemsByWorkspace,
  aiBrainByWorkspace,
  auditIntelligenceByWorkspace,
  currentSession,
  expertEfficiencyByWorkspace,
  growthCyclesByWorkspace,
  organicMetricSnapshotsByWorkspace,
  ownCrawlerByWorkspace,
  screamingFrogByWorkspace,
  workspaces
} from "../rankflow-data";
import { createPostgresQueryClientFromEnv } from "../repositories/postgres-rankflow-repository";

const liveState = {
  session: currentSession,
  workspaces,
  growthCyclesByWorkspace,
  organicMetricSnapshotsByWorkspace,
  actionItemsByWorkspace,
  expertEfficiencyByWorkspace,
  ownCrawlerByWorkspace,
  screamingFrogByWorkspace,
  aiBrainByWorkspace,
  auditIntelligenceByWorkspace
};

export async function seedLiveState() {
  const client = createPostgresQueryClientFromEnv();

  await client.query(`
    create table if not exists public.rankflow_live_state (
      key text primary key,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);

  for (const [key, payload] of Object.entries(liveState)) {
    await client.query(
      `
        insert into public.rankflow_live_state (key, payload, updated_at)
        values ($1, $2::jsonb, now())
        on conflict (key) do update
        set payload = excluded.payload,
            updated_at = excluded.updated_at
      `,
      [key, JSON.stringify(payload)]
    );
  }
  console.log(`Seeded ${Object.keys(liveState).length} RankFlow live state records.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedLiveState()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
