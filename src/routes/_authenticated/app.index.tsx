import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { RiskLabel, ScoreRing, SeverityCounts } from "@/components/Results";
import { assessmentStore } from "@/lib/assessment-store";
import { useLatestResult } from "@/lib/use-latest-result";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { result, isLoading } = useLatestResult();
  if (isLoading) return <p className="py-8 text-sm text-muted-foreground">Loading…</p>;

  if (result) {
    const openFindings = result.findings.filter((f) => f.status !== "Resolved");
    const openCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
    openFindings.forEach((f) => { openCounts[f.severity]++; });
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
          <Card className="flex flex-col items-center gap-6 sm:flex-row">
            <ScoreRing score={result.score} risk={result.riskLevel} />
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Security score</p>
              <RiskLabel risk={result.riskLevel} />
              <CardBody>{openFindings.length} findings to review.</CardBody>
              {openFindings.length === 0 && (
                <p className="text-sm text-success">All findings resolved.</p>
              )}
              <Link to="/app/findings" className="inline-block text-sm text-primary hover:underline">
                View findings →
              </Link>
            </div>
          </Card>
          <SeverityCounts counts={openCounts} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" />
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
