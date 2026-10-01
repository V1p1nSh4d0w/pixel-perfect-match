import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/Results";
import { useAssessment } from "@/lib/assessment-store";

export const Route = createFileRoute("/_authenticated/app/findings")({
  head: () => ({ meta: [{ title: "Findings — SecureCheck" }] }),
  component: FindingsPage,
});

function FindingsPage() {
  const { result } = useAssessment();

  if (!result) {
    return (
      <>
        <PageHeader title="Findings" />
        <Card className="mx-auto max-w-md text-center">
          <CardTitle>No findings yet</CardTitle>
          <CardBody className="mt-2">Complete the assessment to see what to fix.</CardBody>
          <Link
            to="/app/assessment"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-button bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Start assessment
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Findings" description={`${result.findings.length} findings, most serious first.`} />
      {result.findings.length === 0 ? (
        <Card><CardBody>No findings — every answer was the best option.</CardBody></Card>
      ) : (
        <div className="space-y-4">
          {result.findings.map((f) => (
            <Card key={f.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={f.severity} />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{f.category}</span>
                </div>
                <span className="text-xs text-muted-foreground">Status: <span className="text-foreground">{f.status}</span></span>
              </div>
              <h2 className="text-base font-semibold text-foreground">{f.title}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Why it matters</p>
                  <p className="text-sm text-foreground">{f.why_it_matters}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Recommended action</p>
                  <p className="text-sm text-foreground">{f.recommended_action}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
