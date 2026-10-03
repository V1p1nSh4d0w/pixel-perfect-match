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
      <h2 className="mt-10 text-xl font-semibold tracking-tight">Choose a security area</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-lg font-semibold"><span aria-hidden="true">🔐</span> Accounts & Access</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">Review MFA, shared logins, admin access, former staff, recovery methods and connected apps.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/checkup/business/accounts/quick"><Button fullWidth variant={v.mode === "deep" ? "secondary" : "primary"}>Quick Check</Button></Link>
            <Link to="/checkup/business/accounts/deep"><Button fullWidth variant={v.mode === "deep" ? "primary" : "secondary"}>Deep Check</Button></Link>
          </div>
        </div>
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-lg font-semibold"><span aria-hidden="true">💻</span> Devices & Software</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">Review security protection, firewall, encryption, admin rights, remote access and installed software.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/checkup/business/devices/quick"><Button fullWidth variant={v.mode === "deep" ? "secondary" : "primary"}>Quick Check</Button></Link>
            <Link to="/checkup/business/devices/deep"><Button fullWidth variant={v.mode === "deep" ? "primary" : "secondary"}>Deep Check</Button></Link>
          </div>
        </div>
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-lg font-semibold"><span aria-hidden="true">📧</span> Email, Website & Online Presence</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">Review business email, domain, website, hosting and social-media account security.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/checkup/business/online/quick"><Button fullWidth variant={v.mode === "deep" ? "secondary" : "primary"}>Quick Check</Button></Link>
            <Link to="/checkup/business/online/deep"><Button fullWidth variant={v.mode === "deep" ? "primary" : "secondary"}>Deep Check</Button></Link>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">More business security areas are coming soon. Your choices are saved for this visit.</p>
      <div className="mt-6">
        <Link to="/checkup/business"><Button variant="secondary">Change my answers</Button></Link>
      </div>
    </CheckupShell>
  );
}
