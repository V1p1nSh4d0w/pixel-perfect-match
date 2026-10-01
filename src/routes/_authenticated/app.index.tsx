import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

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
