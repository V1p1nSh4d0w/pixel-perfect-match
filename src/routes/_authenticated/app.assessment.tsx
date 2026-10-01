import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/app/assessment")({
  component: () => <PageHeader title="Assessment" description="Coming next" />,
});
