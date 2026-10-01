import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/app/action-plan")({
  component: () => <PageHeader title="Action Plan" description="Coming next" />,
});
