import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { UpgradeButton } from "@/components/UpgradeButton";
import { SUBSCRIPTION_KEY, useSubscription } from "@/hooks/useSubscription";
import { cancelProSubscription, getPaymentHistory } from "@/lib/billing.functions";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function BillingPanel() {
  const { subscription, isPro, isLoading } = useSubscription();
  const queryClient = useQueryClient();
  const cancelFn = useServerFn(cancelProSubscription);
  const historyFn = useServerFn(getPaymentHistory);
  const history = useQuery({ queryKey: ["payment-history"], queryFn: () => historyFn(), enabled: isPro });
  const cancel = useMutation({
    mutationFn: () => cancelFn(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      toast.success("Subscription cancelled. Pro stays active until the end of this billing period.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel."),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const cancelled = subscription?.status === "cancelled";

  return (
    <Card>
      <CardTitle>Billing</CardTitle>
      <div className="mt-4 space-y-4 text-sm">
        <p className="text-foreground">
          Current plan: <span className="font-semibold">{isPro ? "Pro" : "Free"}</span>
          {isPro && cancelled ? <span className="text-muted-foreground"> (cancelled)</span> : null}
        </p>

        {!isPro ? (
          <>
            <p className="text-muted-foreground">Unlock PDF reports, remediation playbooks and score history for ₹999/month.</p>
            <UpgradeButton />
          </>
        ) : (
          <>
            {subscription?.current_period_end ? (
              <p className="text-muted-foreground">
                {cancelled ? "Pro access ends on " : "Next billing date: "}
                <span className="text-foreground">{fmt(subscription.current_period_end)}</span>
              </p>
            ) : null}
            <p className="text-muted-foreground">
              Priority support: <a href="mailto:support@securecheck.app" className="text-primary hover:underline">support@securecheck.app</a>
            </p>
            {!cancelled ? (
              <Button variant="secondary" loading={cancel.isPending} onClick={() => {
                if (confirm("Cancel your Pro subscription? You keep Pro until the end of this billing period.")) cancel.mutate();
              }}>
                Cancel subscription
              </Button>
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
