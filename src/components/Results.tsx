import { Link } from "@tanstack/react-router";
import type { AssessmentResult, RiskLevel, Severity } from "@/types/assessment";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: "border-danger text-danger",
  High: "border-warning text-warning",
  Medium: "border-medium text-medium",
  Low: "border-low text-low",
};

export const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", SEVERITY_STYLES[severity])}>
      {severity}
    </span>
  );
}

function riskColor(risk: RiskLevel) {
  return risk === "Low risk" ? "text-low" : risk === "Moderate risk" ? "text-medium" : risk === "High risk" ? "text-warning" : "text-danger";
}

export function ScoreRing({ score, risk, size = 160, selfReported = false }: { score: number; risk: RiskLevel; size?: number; selfReported?: boolean }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-raised" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className={cn("transition-all", riskColor(risk))}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {/* Larger rings get a bigger score number so it stays the strongest element. */}
        <span className={cn(size >= 176 ? "text-5xl" : "text-4xl", "font-semibold tracking-tight text-foreground")}>{score}</span>
        <span className="text-xs text-muted-foreground">{selfReported ? "(self-reported)" : "out of 100"}</span>
      </div>
    </div>
  );
}

export function RiskLabel({ risk }: { risk: RiskLevel }) {
  return <p className={cn("text-lg font-semibold", riskColor(risk))}>{risk}</p>;
}

const SEVERITY_PARAM: Record<Severity, string> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
};

export function SeverityCounts({ counts }: { counts: AssessmentResult["counts"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SEVERITIES.map((s) => (
        <Link
          key={s}
          to="/app/findings"
          search={{ severity: SEVERITY_PARAM[s] }}
          className="group flex items-start justify-between rounded-card border border-border/75 bg-card p-4 shadow-sm shadow-background/10 transition-colors hover:border-primary/40 hover:bg-surface-raised"
        >
          <div>
            <p className="text-2xl font-semibold text-foreground">{counts[s]}</p>
            <div className="mt-2">
              <SeverityBadge severity={s} />
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
