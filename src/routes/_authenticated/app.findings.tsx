import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/Results";
import { useAssessment } from "@/lib/assessment-store";
import type { Severity } from "@/types/assessment";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/findings")({
  validateSearch: (search: Record<string, unknown>) => {
    const severity = typeof search.severity === "string" ? search.severity : "";
    return severity ? { severity } : {};
  },
  head: () => ({ meta: [{ title: "Findings — SecureCheck" }] }),
  component: FindingsPage,
});

const PARAM_TO_SEVERITY: Record<string, Severity> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function FindingsPage() {
  const { result } = useAssessment();
  const { severity } = Route.useSearch();
  const activeSeverity = severity && PARAM_TO_SEVERITY[severity] ? PARAM_TO_SEVERITY[severity] : null;
  const visible = activeSeverity ? result?.findings.filter((f) => f.severity === activeSeverity) : result?.findings;

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
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = tab.value === (activeSeverity ? severity : "");
          return (
            <Link
              key={tab.label}
              to="/app/findings"
              search={tab.value ? { severity: tab.value } : {}}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {result.findings.length === 0 ? (
        <Card><CardBody>No findings — every answer was the best option.</CardBody></Card>
      ) : visible && visible.length === 0 ? (
        <Card><CardBody>No {activeSeverity!.toLowerCase()} findings.</CardBody></Card>
      ) : (
        <div className="space-y-4">
          {visible!.map((f) => (
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
