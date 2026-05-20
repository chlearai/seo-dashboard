import { expect, test } from "@playwright/test";

test("HOD command centre renders the SaaS operating view", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /all clients, scans/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Aurora Education Group/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Nimbus Health Clinics/ })).toBeVisible();
});

test("workspace drill-down renders scan and AI suggestion data", async ({ page }) => {
  await page.goto("/workspaces/aurora-education");
  await expect(page.getByRole("heading", { name: "Aurora Education Group" })).toBeVisible();
  await expect(page.getByText("AI Suggestion Inbox")).toBeVisible();
  await expect(page.getByText("Front-load the MBA admissions keyword")).toBeVisible();
});

test("client portal preview hides internal command centre framing", async ({ page }) => {
  await page.goto("/client-portal/aurora-education");
  await expect(page.getByRole("heading", { name: /Aurora Education Group SEO progress/i })).toBeVisible();
  await expect(page.getByText("Client portal preview")).toBeVisible();
});
