import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { RiskLabel, ScoreRing, SeverityCounts } from "@/components/Results";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { ScoreHistory } from "@/components/ScoreHistory";
import { assessmentStore } from "@/lib/assessment-store";
import { useLatestResult } from "@/lib/use-latest-result";
import { useQuery } from "@tanstack/react-query";
import { fetchActionItems } from "@/lib/supabase";
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
        <div className="space-y-6">
          <OnboardingChecklist />
          <Card className="flex flex-col items-center gap-6 sm:flex-row">
            <ScoreRing score={result.score} risk={result.riskLevel} />
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Security posture score</p>
              <p className="text-xs text-muted-foreground">Based on your assessment responses.</p>
              <RiskLabel risk={result.riskLevel} />
              <CardBody>{openFindings.length} findings to review.</CardBody>
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
          </Card>
          <ScoreHistory />
          <SeverityCounts counts={openCounts} />
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
