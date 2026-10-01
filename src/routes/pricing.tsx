import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { UpgradeButton } from "@/components/UpgradeButton";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SecureCheck" },
      { name: "description", content: "SecureCheck Free, Pro (₹999/month) and a one-time ₹15,000 Full Audit." },
      { property: "og:title", content: "Pricing — SecureCheck" },
      { property: "og:description", content: "Free, Pro ₹999/month, and a ₹15,000 one-time audit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

const FREE = [
  "Complete the security assessment",
  "Security score",
  "Findings list with suggested fixes",
  "Action plan checklist",
];
const PRO = [
  "Everything in Free",
  "Download the full PDF report",
  "Step-by-step remediation playbooks on every finding",
  "Score history across all assessments",
  "Monthly re-scan reminder email",
  "Monthly email report: score change and top 3 open findings",
  "One 30-minute video call per quarter with Aman",
  "Priority email support (24h on business days)",
];
const AUDIT = [
  "1-hour video call with Aman",
  "Full manual review of your setup",
  "Written PDF report with personalized recommendations",
  "30-day follow-up email check-in",
];

const COMPARISON: [string, boolean, boolean, boolean][] = [
  ["Complete security assessment", true, true, true],
  ["Security score", true, true, true],
  ["Findings list", true, true, true],
  ["Action plan", true, true, true],
  ["PDF report download", false, true, true],
  ["Extended remediation playbooks", false, true, true],
  ["Score history chart", false, true, true],
  ["Monthly re-scan reminder email", false, true, false],
  ["Monthly email report", false, true, false],
  ["Quarterly 1-hour call", false, true, false],
  ["Priority email support (24h response)", false, true, true],
  ["1-hour audit call with founder", false, false, true],
  ["Written personalized PDF report", false, false, true],
  ["30-day follow-up email check-in", false, false, true],
  ["Retainer discount (₹5,000/mo option)", false, false, true],
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-1 shrink-0 text-primary" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function ProCta() {
  const { isPro } = useSubscription();
  if (isPro) return <Link to="/app" className="block"><Button fullWidth variant="secondary">You're on Pro — go to app</Button></Link>;
  return <UpgradeButton fullWidth />;
}

function PricingPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  return (
    <div className="min-h-screen bg-background px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center justify-between">
          <Link to="/" className="text-base font-semibold tracking-tight text-foreground">SecureCheck</Link>
          <Link to={signedIn ? "/app" : "/login"} className="text-sm text-muted-foreground hover:text-foreground">
            {signedIn ? "Go to app" : "Log in"}
          </Link>
        </div>
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">Simple pricing</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">Start free. Upgrade when you want the full toolkit.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <PlanCard name="Free" price="₹0" features={FREE}>
            <Link to={signedIn ? "/app" : "/signup"} className="block">
              <Button fullWidth variant="secondary">Get started free</Button>
            </Link>
          </PlanCard>
          <PlanCard name="Pro" price="₹999" suffix="/month" features={PRO} highlighted>
            {signedIn ? <ProCta /> : (
              <Link to="/signup" className="block"><Button fullWidth>Upgrade to Pro</Button></Link>
            )}
          </PlanCard>
          <PlanCard name="Audit" price="₹15,000" suffix=" one-time" features={AUDIT}>
            <Link to="/audit" className="block"><Button fullWidth variant="secondary">Book Full Audit</Button></Link>
            <p className="mt-3 text-xs text-muted-foreground">One-time payment. Includes a 1-hour call and a written report.</p>
          </PlanCard>
        </div>

        <div className="mt-12 overflow-x-auto rounded-card border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Feature</th>
                <th className="px-5 py-3 text-center font-medium text-foreground">Free</th>
                <th className="bg-primary/10 px-5 py-3 text-center font-medium text-primary">Pro</th>
                <th className="px-5 py-3 text-center font-medium text-foreground">Audit</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, ...tiers]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-foreground">{label}</td>
                  {tiers.map((on, i) => (
                    <td key={i} className={cn("px-5 py-3 text-center", i === 1 && "bg-primary/10")}>
                      {on ? <span className="inline-flex justify-center"><Check /></span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">All prices in INR. Secure payments via Razorpay. Cancel Pro anytime.</p>
      </div>
    </div>
  );
}

function PlanCard({ name, price, suffix, features, highlighted, children }: {
  name: string; price: string; suffix?: string | undefined; features: string[]; highlighted?: boolean | undefined; children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex flex-col rounded-card border bg-card p-6", highlighted ? "border-primary" : "border-border")}>
      {highlighted ? (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Recommended</span>
      ) : null}
      <h2 className="text-base font-semibold text-foreground">{name}</h2>
      <p className="mt-3">
        <span className="text-3xl font-semibold text-foreground">{price}</span>
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </p>
      <ul className="mt-6 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-foreground"><Check />{f}</li>
        ))}
      </ul>
      <div className="mt-8">{children}</div>
    </div>
  );
}
