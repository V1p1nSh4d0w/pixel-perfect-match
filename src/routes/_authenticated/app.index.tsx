import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { RiskLabel, ScoreRing } from "@/components/Results";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { ScoreHistory } from "@/components/ScoreHistory";
import { assessmentStore } from "@/lib/assessment-store";
import { useLatestResult } from "@/lib/use-latest-result";
import { useQuery } from "@tanstack/react-query";
import { fetchActionItems } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types/assessment";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [
    { title: "Security Dashboard — SecureCheck" },
    { name: "description", content: "Review your security posture score, findings, and action-plan progress." },
    { property: "og:title", content: "Security Dashboard — SecureCheck" },
    { property: "og:description", content: "Review your security posture score, findings, and action-plan progress." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DashboardPage,
});

const SEVERITY_VALUE_CLASS: Record<Severity, string> = {
  Critical: "text-danger",
  High: "text-warning",
  Medium: "text-medium",
  Low: "text-low",
};

/** Compact clickable metric card. Severity values are tinted with their status color. */
function StatCard({
  severityParam,
  value,
  label,
  valueClass,
}: {
  severityParam?: string;
  value: number;
  label: string;
  valueClass?: string;
}) {
  return (
    <Link
      to="/app/findings"
      search={severityParam ? { severity: severityParam } : {}}
      className="group flex items-start justify-between rounded-card border border-border/75 bg-card p-4 shadow-sm shadow-background/10 transition-colors hover:border-primary/40 hover:bg-surface-raised"
    >
      <div className="min-w-0">
        <p className={cn("text-2xl font-semibold tracking-tight", valueClass)}>{value}</p>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{label}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  // Every metric below is derived from the latest saved assessment
  // (useLatestResult) and the user's action items — no demo values.
  const { result, isLoading } = useLatestResult();
  const actions = useQuery({ queryKey: ["action-items"], queryFn: fetchActionItems });
  if (isLoading) return <p className="py-8 text-sm text-muted-foreground">Loading…</p>;

  if (result) {
    const openFindings = result.findings.filter((f) => f.status !== "Resolved");
    const openCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
    openFindings.forEach((f) => { openCounts[f.severity]++; });
    const resolvedCount = result.findings.length - openFindings.length;
    // Action-plan progress counts only actions linked to this assessment's findings.
    const ids = new Set(result.findings.map((f) => f.id));
    const planItems = (actions.data ?? []).filter((it) => !it.finding_id || ids.has(it.finding_id));
    const planDone = planItems.filter((it) => it.completed).length;
    const planPct = planItems.length ? Math.round((planDone / planItems.length) * 100) : 0;
    const lastAssessed = result.created_at
      ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(result.created_at))
      : null;
    return (
      <>
        <PageHeader
          title="Dashboard"
          actions={
            <Button variant="secondary" onClick={() => { assessmentStore.reset(); navigate({ to: "/app/assessment" }); }}>
              Retake assessment
            </Button>
          }
        />
        <div className="space-y-5">
          <OnboardingChecklist />

          {/* Primary security summary — the score is the strongest element. */}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
              <ScoreRing score={result.score} risk={result.riskLevel} size={176} />
              <div className="w-full min-w-0 space-y-1 sm:border-l sm:border-border/75 sm:pl-8 sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Security posture score</p>
                <RiskLabel risk={result.riskLevel} />
                <p className="text-xs text-muted-foreground">Based on your assessment responses.</p>
                {lastAssessed && <p className="text-xs text-muted-foreground">Last assessed {lastAssessed}</p>}
                <div className="my-3 border-t border-border/75" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">{openFindings.length} findings to review</p>
                <p className="text-xs text-muted-foreground">
                  {result.findings.length} total · {resolvedCount} resolved
                  {planItems.length > 0 && <> · Action plan {planDone}/{planItems.length} completed ({planPct}%)</>}
                </p>
                {openFindings.length === 0 && (
                  <p className="text-sm text-success">All findings resolved.</p>
                )}
                <Link to="/app/findings" className="inline-block text-sm text-primary hover:underline">
                  View findings →
                </Link>
              </div>
            </div>
          </Card>

          {/* Compact metrics row — real counts from the latest assessment. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard value={result.findings.length} label="Total findings" />
            {(["Critical", "High", "Medium", "Low"] as Severity[]).map((s) => (
              <StatCard
                key={s}
                severityParam={s.toLowerCase()}
                value={openCounts[s]}
                label={s}
                valueClass={SEVERITY_VALUE_CLASS[s]}
              />
            ))}
            <StatCard severityParam="resolved" value={resolvedCount} label="Resolved" />
          </div>

          <ScoreHistory />
          <p className="text-xs text-muted-foreground">
            SecureCheck provides a security self-assessment and practical recommendations. It does not replace a professional penetration test, vulnerability assessment, or security audit.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" />
      <OnboardingChecklist />
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardTitle>No assessment yet</CardTitle>
          <CardBody className="mt-2">
            Start your first security assessment to get a score, findings, and a clear action plan.
          </CardBody>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: "/app/assessment" })}>Start assessment</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
