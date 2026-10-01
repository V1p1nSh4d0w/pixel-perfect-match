import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/app/findings")({
  component: () => <PageHeader title="Findings" description="Coming next" />,
});
