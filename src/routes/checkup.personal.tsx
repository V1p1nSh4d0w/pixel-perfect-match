import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";

const TITLE = "Personal Security Checkup | SecureCheck";
const DESC = "A security checkup for your phone, computer, online accounts, web safety, and privacy.";

export const Route = createFileRoute("/checkup/personal")({
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
  component: PersonalCheckup,
});

function PersonalCheckup() {
  return (
    <CheckupShell back>
      <h1 className="text-3xl font-semibold tracking-tight">Personal Security Checkup</h1>
      <p className="mt-3 text-muted-foreground">{DESC}</p>
      <div className="mt-8 rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
        The personal checkup is coming soon.
      </div>
    </CheckupShell>
  );
}
