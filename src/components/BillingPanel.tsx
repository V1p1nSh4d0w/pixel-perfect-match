import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { UpgradeButton } from "@/components/UpgradeButton";
import { SUBSCRIPTION_KEY, useSubscription } from "@/hooks/useSubscription";
import { cancelProSubscription, getPaymentHistory } from "@/lib/billing.functions";
import { fetchCallsSince, fetchMyAudits } from "@/lib/supabase";
import { QUARTERLY_CALL_BOOKING_URL, SUPPORT_EMAIL, quarterStart } from "@/lib/config";

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

  const calls = useQuery({ queryKey: ["my-calls"], queryFn: () => fetchCallsSince(quarterStart()), enabled: isPro });
  const audits = useQuery({ queryKey: ["my-audits"], queryFn: fetchMyAudits });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const cancelled = subscription?.status === "cancelled";
  const callUsed = (calls.data?.length ?? 0) >= 1;
  const audit = audits.data?.[0];

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
              Priority support: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>
              <span className="block text-xs">Responses within 24 hours on business days.</span>
            </p>
            <div className="border-t border-border pt-4">
              <p className="text-foreground">Quarterly call with Aman (30 min)</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {callUsed ? "This quarter's call is used. Next one opens at the start of next quarter." : "1 call available this quarter."}
              </p>
              {callUsed ? (
                <Button className="mt-3" disabled>Book quarterly call</Button>
              ) : (
                <a href={QUARTERLY_CALL_BOOKING_URL} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                  <Button>Book quarterly call</Button>
                </a>
              )}
            </div>
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
        <p className="border-t border-border pt-4 text-xs">
          <Link to="/audit" className="text-primary hover:underline">Book a full audit</Link>
          <span className="text-muted-foreground"> — ₹15,000 one-time, 1-hour call + written report</span>
        </p>
        {audit ? (
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">Audit purchased — {fmt(audit.paid_at)}</p>
        ) : null}
      </div>
    </Card>
  );
}
