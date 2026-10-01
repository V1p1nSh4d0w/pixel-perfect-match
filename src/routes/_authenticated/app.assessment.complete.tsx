import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { RiskLabel, ScoreRing, SeverityCounts } from "@/components/Results";
import { useAssessment } from "@/lib/assessment-store";

export const Route = createFileRoute("/_authenticated/app/assessment/complete")({
  head: () => ({ meta: [{ title: "Assessment complete — SecureCheck" }] }),
  component: CompletePage,
});

const linkClass =
  "inline-flex h-10 items-center justify-center rounded-button bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover";

function CompletePage() {
  const { result } = useAssessment();

  if (!result) {
    return (
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardTitle>No results yet</CardTitle>
          <CardBody className="mt-2">Finish the assessment to see your score.</CardBody>
          <Link to="/app/assessment" className={`${linkClass} mt-6`}>Go to assessment</Link>
        </Card>
      </div>
    );
  }

  const total = result.findings.length;
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <Card className="flex flex-col items-center gap-4 text-center">
        <CardTitle>Assessment complete</CardTitle>
        <ScoreRing score={result.score} risk={result.riskLevel} />
        <RiskLabel risk={result.riskLevel} />
        <CardBody>
          {total === 0 ? "No findings — nice work." : `We found ${total} thing${total === 1 ? "" : "s"} to improve.`}
        </CardBody>
      </Card>
      <SeverityCounts counts={result.counts} />
      <div className="flex justify-center">
        <Link to="/app/findings" className={linkClass}>View findings</Link>
      </div>
    </div>
  );
}
