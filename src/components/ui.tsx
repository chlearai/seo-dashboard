import Link from "next/link";
import type { ScoreTone, Severity } from "@/lib/rankflow-types";
import { scoreHealth } from "@/lib/rankflow-data";

export function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p className="muted">{detail}</p> : null}
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  const health = scoreHealth(score);

  return (
    <span className={`score-pill ${health.tone}`}>
      {score} · {health.label}
    </span>
  );
}

export function ToneBadge({
  label,
  tone
}: {
  label: string;
  tone: Severity | ScoreTone | "success";
}) {
  return <span className={`badge ${tone}`}>{label}</span>;
}

export function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const sign = value > 0 ? "+" : "";
  const className = value >= 0 ? "delta positive" : "delta negative";

  return (
    <strong className={className}>
      {sign}
      {value}
      {suffix}
    </strong>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button primary" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </header>
  );
}
