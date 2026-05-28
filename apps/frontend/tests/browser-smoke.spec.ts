import { expect, test } from "@playwright/test";

test("HOD command centre renders the SaaS operating view", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /all clients, scans/i })).toBeVisible();
  await expect(page.getByText("hod access")).toBeVisible();
  await expect(page.getByRole("link", { name: /Reports/ })).toBeVisible();
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

test("workspace module routes render scan, audit, suggestion, and workbook surfaces", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/scans");
  await expect(page.getByRole("heading", { name: /Aurora Education Group scan history/i })).toBeVisible();
  await expect(page.getByText("Critical Resolved")).toBeVisible();

  await page.goto("/workspaces/aurora-education/audit");
  await expect(page.getByRole("heading", { name: /Aurora Education Group category health/i })).toBeVisible();
  await expect(page.getByText("Title Tags", { exact: true })).toBeVisible();

  await page.goto("/workspaces/aurora-education/suggestions");
  await expect(page.getByRole("heading", { name: /source-backed recommendations/i })).toBeVisible();
  await expect(page.getByText("Quick Wins")).toBeVisible();

  await page.goto("/workspaces/aurora-education/workbook");
  await expect(page.getByRole("heading", { name: /Aurora Education Group execution board/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In Progress" })).toBeVisible();
});

test("growth module routes render keyword tracking and report readiness", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/keywords");
  await expect(page.getByRole("heading", { name: /Aurora Education Group keyword visibility/i })).toBeVisible();
  await expect(page.getByText("Tracked Keywords")).toBeVisible();
  await expect(page.getByText("mba admissions", { exact: true })).toBeVisible();

  await page.goto("/workspaces/aurora-education/reports");
  await expect(page.getByRole("heading", { name: /Aurora Education Group report readiness/i })).toBeVisible();
  await expect(page.getByText("Avg Readiness")).toBeVisible();
  await expect(page.getByText("May SEO Progress Report")).toBeVisible();
});

test("local visibility route renders GBP, AEO, and GEO intelligence", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/local-visibility");
  await expect(page.getByRole("heading", { name: /Aurora Education Group local visibility/i })).toBeVisible();
  await expect(page.getByText("Google Business Profile", { exact: true })).toBeVisible();
  await expect(page.getByText("AEO Readiness", { exact: true })).toBeVisible();
  await expect(page.getByText("GEO Visibility", { exact: true })).toBeVisible();
  await expect(page.getByText("Scholarship service pages are missing from GBP").first()).toBeVisible();
});

test("growth cycle route renders audit analyse act report loop", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/growth-cycle");
  await expect(page.getByRole("heading", { name: /Aurora Education Group organic growth cycle/i })).toBeVisible();
  await expect(page.getByText("Audit", { exact: true })).toBeVisible();
  await expect(page.getByText("Analyse", { exact: true })).toBeVisible();
  await expect(page.getByText("Act", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Audit analyse act report cycle").getByText("Report", { exact: true })).toBeVisible();
  await expect(page.getByText("Re-audit", { exact: true })).toBeVisible();
  await expect(page.getByText("Organic Leads", { exact: true })).toBeVisible();
  await expect(page.getByText("Add scholarship services to Google Business Profile")).toBeVisible();
  await expect(page.getByText("SEO Expert Efficiency")).toBeVisible();
});

test("own crawler route renders rule engine evidence", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/own-crawler");
  await expect(page.getByRole("heading", { name: /Aurora Education Group crawler rules/i })).toBeVisible();
  await expect(page.getByText("Pages Crawled")).toBeVisible();
  await expect(page.getByText("Missing titles", { exact: true })).toBeVisible();
  await expect(page.getByText("Canonical conflicts", { exact: true })).toBeVisible();
  await expect(page.getByText("URL-level issues")).toBeVisible();
});

test("screaming frog route renders imported crawl evidence", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/screaming-frog");
  await expect(page.getByRole("heading", { name: /Aurora Education Group Screaming Frog import/i })).toBeVisible();
  await expect(page.getByRole("main").locator(".eyebrow").filter({ hasText: "Screaming Frog" })).toBeVisible();
  await expect(page.getByText("Import Ready")).toBeVisible();
  await expect(page.getByText("URL-level issues")).toBeVisible();
});

test("AI brain route renders approval gated system intelligence", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/ai-brain");
  await expect(page.getByRole("heading", { name: /Aurora Education Group AI brain/i })).toBeVisible();
  await expect(page.getByText("Brain Status")).toBeVisible();
  await expect(page.getByText("Organic leads rose after FAQ schema and title updates")).toBeVisible();
  await expect(page.getByText("Prioritize GEO evidence blocks on MBA pages")).toBeVisible();
  await expect(page.getByText("Requires approval").first()).toBeVisible();
  await expect(page.getByText("External GEO evidence work lacks approved proof")).toBeVisible();
});

test("audit intelligence route renders hybrid evidence stack", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/audit-intelligence");
  await expect(page.getByRole("heading", { name: /Aurora Education Group audit intelligence/i })).toBeVisible();
  await expect(page.getByText("Own crawler", { exact: true })).toBeVisible();
  await expect(page.getByRole("main").locator(".source-card strong").filter({ hasText: "Screaming Frog" })).toBeVisible();
  await expect(page.getByText("Google Search Console", { exact: true })).toBeVisible();
  await expect(page.getByText("Claude SEO Brain", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Missing titles", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Referring domains")).toBeVisible();
});
