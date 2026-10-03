import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { CheckupShell } from "@/components/CheckupShell";

const TITLE = "Security Checkup — Personal or Business | SecureCheck";
const DESC = "Choose a personal security checkup for you and your family, or a business checkup for teams without a security department.";

export const Route = createFileRoute("/checkup/")({
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
  component: CheckupChooser,
});

function CheckupChooser() {
  return (
    <CheckupShell>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Start your Security Checkup</h1>
      <p className="mt-3 text-muted-foreground">Who is this checkup for?</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Personal Security</p>
          <p className="mt-2 text-lg font-semibold">For individuals, students, and families.</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Check your phone, computer, online accounts, web safety, and privacy.
          </p>
          <Link to="/checkup/personal" className="mt-6">
            <Button fullWidth>Start Personal Checkup</Button>
          </Link>
        </div>
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Business Security</p>
          <p className="mt-2 text-lg font-semibold">For small and growing businesses.</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Security checks for businesses that don't have a dedicated security team.
          </p>
          <Link to="/checkup/business" className="mt-6">
            <Button fullWidth variant="secondary">I'm a Business</Button>
          </Link>
        </div>
      </div>
    </CheckupShell>
  );
}
