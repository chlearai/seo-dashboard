import { seedLiveState } from "./seed-live-state";

async function start() {
  if (process.env.RANKFLOW_SEED_ON_START === "1" || process.env.RANKFLOW_SEED_ON_START === "true") {
    await seedLiveState();
  }

  await import("../server");
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
