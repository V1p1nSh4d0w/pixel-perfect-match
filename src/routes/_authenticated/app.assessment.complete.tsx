import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardBody, CardTitle } from "@/components/Card";

export const Route = createFileRoute("/_authenticated/app/assessment/complete")({
  head: () => ({ meta: [{ title: "Assessment complete — SecureCheck" }] }),
  component: CompletePage,
});

function CompletePage() {
  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md text-center">
        <CardTitle>Assessment complete</CardTitle>
        <CardBody className="mt-2">Thanks — your answers have been recorded.</CardBody>
        <Link
          to="/app"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-button bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          View findings
        </Link>
      </Card>
    </div>
  );
}
