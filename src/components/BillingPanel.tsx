import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardTitle } from "@/components/Card";
import { UpgradeButton } from "@/components/UpgradeButton";
import { useSubscription } from "@/hooks/useSubscription";
import { getPaymentHistory } from "@/lib/billing.functions";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function BillingPanel() {
  const { subscription, isPro, isLoading, premiumEnabled } = useSubscription();
  const historyFn = useServerFn(getPaymentHistory);
  const history = useQuery({ queryKey: ["payment-history"], queryFn: () => historyFn(), enabled: isPro });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!premiumEnabled && !isPro) return (
    <Card>
      <CardTitle>Billing</CardTitle>
      <p className="mt-4 text-sm text-muted-foreground">SecureCheck is free during the beta. Every feature is available on your account — no payment needed.</p>
    </Card>
  );
  const isLegacy = subscription?.plan === "pro";

  return (
    <Card>
      <CardTitle>Billing</CardTitle>
      <div className="mt-4 space-y-4 text-sm">
        <p className="text-foreground">
          Current plan: <span className="font-semibold">{isPro ? "Starter Kit" : "Free"}</span>
        </p>
        <a href="/pricing" className="inline-block text-sm text-primary hover:underline">Compare plans →</a>

        {!isPro ? (
          <>
            <p className="text-muted-foreground">Unlock PDF report downloads and extended remediation playbooks for ₹499, one time.</p>
            <UpgradeButton />
          </>
        ) : (
          <>
            {isLegacy && subscription.current_period_end ? (
              <p className="text-muted-foreground">
                Legacy paid access ends on 
                <span className="text-foreground">{fmt(subscription.current_period_end)}</span>
              </p>
            ) : null}
            {history.data && history.data.length > 0 ? (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Payment history</p>
                <ul className="space-y-1">
                  {history.data.map((p) => (
                    <li key={p.id} className="flex justify-between text-foreground">
                      <span>{fmt(p.date)}</span>
                      <span>₹{p.amount} · <span className="text-muted-foreground">{p.status}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
}
