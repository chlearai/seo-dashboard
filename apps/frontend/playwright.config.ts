import { defineConfig, devices } from "@playwright/test";
import { join } from "node:path";

const repoRoot = join(process.cwd(), "../..");
const backendUrl = "http://127.0.0.1:4100";
const frontendUrl = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "npm run dev:backend",
      cwd: repoRoot,
      env: {
        ...process.env,
        CORS_ORIGIN: frontendUrl,
        PORT: "4100"
      },
      url: `${backendUrl}/health`,
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: "npm exec -w @rankflow/frontend next -- dev --hostname 127.0.0.1 --port 3100",
      cwd: repoRoot,
      env: {
        ...process.env,
        RANKFLOW_API_URL: backendUrl
      },
      url: frontendUrl,
      reuseExistingServer: true,
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
