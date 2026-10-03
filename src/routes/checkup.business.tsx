import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";

const TITLE = "Business Security Checkup | SecureCheck";
const DESC = "Security checks for small and growing businesses that don't have a dedicated security team.";

export const Route = createFileRoute("/checkup/business")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BusinessCheckup,
});

function BusinessCheckup() {
  return (
    <CheckupShell back>
      <h1 className="text-3xl font-semibold tracking-tight">Business Security Checkup</h1>
      <p className="mt-3 text-muted-foreground">{DESC}</p>
      <div className="mt-8 rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
        The business checkup is coming soon.
      </div>
    </CheckupShell>
  );
}
