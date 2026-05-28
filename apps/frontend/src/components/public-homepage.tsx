import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Globe2,
  LogIn,
  ScanSearch,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const loopStages = [
  {
    title: "Audit",
    detail: "Crawler rules, imported deep crawls, analytics, and authority evidence."
  },
  {
    title: "Analyse",
    detail: "Rank movement, issue severity, traffic drops, and local visibility shifts."
  },
  {
    title: "Act",
    detail: "Assigned actions, external completion logs, and evidence-backed execution."
  },
  {
    title: "Report",
    detail: "Client-ready summaries, progress deltas, and approval-gated narratives."
  },
  {
    title: "Re-audit",
    detail: "Repeat scans that prove whether the work changed the organic outcome."
  }
] as const;

const modulePreviews = [
  {
    title: "Audit Intelligence",
    icon: ScanSearch,
    detail: "Own crawler, Screaming Frog, GSC, GA4, DataForSEO, Ahrefs, Semrush, and Claude evidence in one layer."
  },
  {
    title: "Growth Cycle",
    icon: Sparkles,
    detail: "Track assigned actions, overdue work, external execution, and the impact delivered by each SEO expert."
  },
  {
    title: "Local + AI Search",
    icon: Globe2,
    detail: "GBP, local pack visibility, AEO readiness, GEO coverage, and location-page performance."
  },
  {
    title: "AI Brain",
    icon: BrainCircuit,
    detail: "Interpret the evidence stack, prioritise what matters, and draft report language with approvals."
  }
] as const;

const proofPoints = [
  {
    title: "Source-backed truth",
    detail: "Every score, delta, and recommendation stays tied to evidence."
  },
  {
    title: "Operational accountability",
    detail: "Actions can be completed inside RankFlow or logged with proof outside it."
  },
  {
    title: "International SaaS ready",
    detail: "Built for multiple markets, working styles, and reporting cadences."
  }
] as const;

export function PublicHomepage() {
  return (
    <main className="public-page">
      <header className="public-topbar">
        <Link className="public-brand" href="/">
          <span className="brand-mark">R</span>
          <span>
            <strong>RankFlow</strong>
            <span>Organic growth OS</span>
          </span>
        </Link>

        <div className="public-topbar-actions">
          <span className="public-proof-line">Audit, analyse, act, report, re-audit.</span>
          <Link className="button primary" href="/dashboard">
            Sign in
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="public-hero" aria-label="RankFlow introduction">
        <div className="public-hero-copy">
          <p className="eyebrow">International SEO operations</p>
          <h1>Operate organic growth like a system.</h1>
          <p className="public-lede">
            RankFlow gives agencies and in-house teams one place to audit, analyse, act, report,
            and re-audit across SEO, AEO, GEO, local visibility, authority, traffic, and leads.
          </p>

          <div className="public-hero-actions">
            <Link className="button primary" href="/dashboard">
              <LogIn size={16} aria-hidden="true" />
              Sign in to RankFlow
            </Link>
            <Link className="button" href="/workspaces/aurora-education">
              Preview the workspace
            </Link>
          </div>

          <ul className="public-proof-points" aria-label="Product proof">
            {proofPoints.map((point) => (
              <li key={point.title}>
                <ShieldCheck size={16} aria-hidden="true" />
                <div>
                  <strong>{point.title}</strong>
                  <span>{point.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="public-login-panel" aria-label="Sign in form">
          <div className="public-login-header">
            <p className="eyebrow">Workspace access</p>
            <h2>Sign in</h2>
          </div>

          <div className="public-login-form" role="group" aria-label="Workspace access fields">
            <label>
              Work email
              <input
                autoComplete="email"
                name="email"
                placeholder="name@agency.com"
                type="email"
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                name="password"
                placeholder="••••••••"
                type="password"
              />
            </label>

            <Link className="button primary public-login-button" href="/dashboard">
              <LogIn size={16} aria-hidden="true" />
              Open dashboard
            </Link>
          </div>

          <p className="muted public-login-note">
            This shell is ready for the live auth layer. For now, the dashboard opens directly.
          </p>
        </aside>
      </section>

      <section className="public-band">
        <div className="public-band-header">
          <div>
            <p className="eyebrow">Operating loop</p>
            <h2>Audit, analyse, act, report, then improve again.</h2>
          </div>
          <span className="small-label">Built for continuous organic improvement</span>
        </div>

        <div className="public-evidence-strip" aria-label="Operating stages">
          {loopStages.map((stage) => (
            <article className="public-stage" key={stage.title}>
              <strong>{stage.title}</strong>
              <span>{stage.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="public-band">
        <div className="public-band-header">
          <div>
            <p className="eyebrow">Product proof</p>
            <h2>Evidence across SEO, AEO, GEO, local, and authority.</h2>
          </div>
          <span className="small-label">Modules and signals</span>
        </div>

        <div className="public-module-strip" aria-label="Module previews">
          {modulePreviews.map((module) => (
            <Link className="public-module-card" href="/dashboard" key={module.title}>
              <strong>
                <module.icon size={16} aria-hidden="true" />
                {module.title}
              </strong>
              <span>{module.detail}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
