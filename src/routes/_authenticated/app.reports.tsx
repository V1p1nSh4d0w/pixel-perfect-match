import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/app/reports")({
  component: () => <PageHeader title="Reports" description="Coming next" />,
});
