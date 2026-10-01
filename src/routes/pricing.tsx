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
      { name: "description", content: "SecureCheck Free and Pro plans. Pro is ₹999/month with PDF reports, remediation playbooks and score history." },
      { property: "og:title", content: "Pricing — SecureCheck" },
      { property: "og:description", content: "SecureCheck Free and Pro plans. Pro is ₹999/month." },
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
  "Priority support email",
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex items-center justify-between">
          <Link to="/" className="text-base font-semibold tracking-tight text-foreground">SecureCheck</Link>
          <Link to={signedIn ? "/app" : "/login"} className="text-sm text-muted-foreground hover:text-foreground">
            {signedIn ? "Go to app" : "Log in"}
          </Link>
        </div>
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">Simple pricing</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">Start free. Upgrade when you want the full toolkit.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
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
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">Prices in INR. Cancel anytime. Secure payments via Razorpay.</p>
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
