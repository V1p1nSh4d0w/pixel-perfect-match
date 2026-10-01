import type { AssessmentResult, RiskLevel, Severity } from "@/types/assessment";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: "border-danger text-danger",
  High: "border-warning text-warning",
  Medium: "border-primary text-primary",
  Low: "border-border text-muted-foreground",
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
  return risk === "Low risk" ? "text-success" : risk === "Moderate risk" ? "text-warning" : "text-danger";
}

export function ScoreRing({ score, risk, size = 160 }: { score: number; risk: RiskLevel; size?: number }) {
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
        <span className="text-4xl font-semibold tracking-tight text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

export function RiskLabel({ risk }: { risk: RiskLevel }) {
  return <p className={cn("text-lg font-semibold", riskColor(risk))}>{risk}</p>;
}

export function SeverityCounts({ counts }: { counts: AssessmentResult["counts"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SEVERITIES.map((s) => (
        <div key={s} className="rounded-card border border-border bg-card p-4">
          <p className="text-2xl font-semibold text-foreground">{counts[s]}</p>
          <div className="mt-2">
            <SeverityBadge severity={s} />
          </div>
        </div>
      ))}
    </div>
  );
}
