import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { CheckupShell } from "@/components/CheckupShell";
import { EMPTY_ONBOARDING, businessTypeLabel, loadOnboarding } from "@/lib/business-onboarding";

const TITLE = "Business Security Checkup | SecureCheck";
const DESC = "Your Business Security checkup, tailored to your type of business and team size.";

export const Route = createFileRoute("/checkup/business/start")({
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
  component: Page,
});

function Page() {
  const [v, setV] = useState(EMPTY_ONBOARDING);
  useEffect(() => setV(loadOnboarding()), []);
  const mode = v.mode === "deep" ? "Deep Check" : v.mode === "quick" ? "Quick Check" : "";

  return (
    <CheckupShell back>
      <Link to="/checkup/business" className="-mt-8 mb-8 inline-flex min-h-11 items-center rounded-button border border-border bg-card px-4 text-sm font-medium hover:border-primary md:-mt-10">
        ← Business Security
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Business Security{mode ? ` · ${mode}` : ""}</h1>
      <dl className="mt-6 grid gap-3 rounded-card border border-border bg-card p-5 text-sm sm:grid-cols-3">
        <div><dt className="text-muted-foreground">Business type</dt><dd className="mt-1 font-medium">{businessTypeLabel(v) || "Not chosen"}</dd></div>
        <div><dt className="text-muted-foreground">Team size</dt><dd className="mt-1 font-medium">{v.teamSize || "Not chosen"}</dd></div>
        <div><dt className="text-muted-foreground">Checkup</dt><dd className="mt-1 font-medium">{mode || "Not chosen"}</dd></div>
      </dl>
      <div className="mt-6 rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
        The business security questions are coming soon. Your choices are saved for this visit.
      </div>
      <div className="mt-6">
        <Link to="/checkup/business"><Button variant="secondary">Change my answers</Button></Link>
      </div>
    </CheckupShell>
  );
}
