import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { CheckupShell } from "@/components/CheckupShell";

const TITLE = "Personal Deep Check | SecureCheck";
const DESC = "The Personal Deep Check is being prepared.";

export const Route = createFileRoute("/checkup/personal/deep")({
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
  component: Placeholder,
});

function Placeholder() {
  return (
    <CheckupShell back>
      <h1 className="text-3xl font-semibold tracking-tight">Personal Deep Check</h1>
      <div className="mt-8 rounded-card border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">The Deep Check isn't available yet. No checks have been run.</p>
        <Link to="/checkup/personal" className="mt-5 inline-block"><Button variant="secondary">Back to Personal Checkup</Button></Link>
      </div>
    </CheckupShell>
  );
}
