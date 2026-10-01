import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { BrandLogo } from "@/components/BrandLogo";
import { UpgradeButton } from "@/components/UpgradeButton";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SecureCheck" },
      { name: "description", content: "Start SecureCheck free or unlock the ₹499 one-time Starter Kit." },
      { property: "og:title", content: "Pricing — SecureCheck" },
      { property: "og:description", content: "Free security self-assessment tools and a ₹499 one-time Starter Kit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

const FREE = [
  "Complete security assessment",
  "Security score",
  "Findings list",
  "Action plan",
];
const STARTER_KIT = [
  "Everything in Free",
  "PDF report download",
  "Extended remediation playbooks",
];

const COMPARISON: [string, boolean, boolean][] = [
  ["Complete security assessment", true, true],
  ["Security score", true, true],
  ["Findings list", true, true],
  ["Action plan", true, true],
  ["PDF report download", false, true],
  ["Extended remediation playbooks", false, true],
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-1 shrink-0 text-primary" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function StarterKitCta() {
  const { isPro } = useSubscription();
  if (isPro) return <Link to="/app" className="block"><Button fullWidth variant="secondary">Starter Kit active — go to app</Button></Link>;
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
          <BrandLogo className="text-base font-semibold tracking-tight text-foreground" />
          <Link to={signedIn ? "/app" : "/login"} className="text-sm text-muted-foreground hover:text-foreground">
            {signedIn ? "Go to app" : "Log in"}
          </Link>
        </div>
        <h1 className="text-center type-page-title text-3xl">Simple pricing</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">Start free. Upgrade when you're ready.</p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
          <PlanCard name="Free" price="₹0" note="Forever free" features={FREE}>
            <Link to={signedIn ? "/app" : "/signup"} className="block">
              <Button fullWidth variant="secondary">Get started free</Button>
            </Link>
          </PlanCard>
          <PlanCard name="Starter Kit" price="₹499" note="One-time payment" features={STARTER_KIT} highlighted>
            {signedIn ? <StarterKitCta /> : (
              <Link to="/signup" className="block"><Button fullWidth>Get Starter Kit</Button></Link>
            )}
          </PlanCard>
        </div>

        <div className="mt-12 overflow-x-auto rounded-card border border-border/75 bg-card shadow-sm shadow-background/10">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Feature</th>
                <th className="px-5 py-3 text-center font-medium text-foreground">Free</th>
                <th className="bg-surface-raised px-5 py-3 text-center font-medium text-primary">Starter Kit</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, ...tiers]) => (
                <tr key={label} className="border-b border-border/75 last:border-0 even:bg-surface-raised/50">
                  <td className="px-5 py-3 text-foreground">{label}</td>
                  {tiers.map((on, i) => (
                    <td key={i} className={cn("px-5 py-3 text-center", i === 1 && "bg-surface-raised")}> 
                      {on ? <span className="inline-flex justify-center"><Check /></span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">All prices in INR. Secure one-time payment via Razorpay.</p>
      </div>
    </div>
  );
}

function PlanCard({ name, price, suffix, note, features, highlighted, children }: {
  name: string; price: string; suffix?: string | undefined; note: string; features: string[]; highlighted?: boolean | undefined; children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex flex-col rounded-card border bg-card p-6 shadow-sm shadow-background/10", highlighted ? "border-primary/65 md:-my-3 md:py-9" : "border-border/75")}>
      {highlighted ? (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Recommended</span>
      ) : null}
      <h2 className="type-card-title">{name}</h2>
      <p className="mt-3">
        <span className="text-3xl font-semibold text-foreground">{price}</span>
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      <ul className="mt-6 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-foreground"><Check />{f}</li>
        ))}
      </ul>
      <div className="mt-8">{children}</div>
    </div>
  );
}
