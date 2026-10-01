import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/Button";
import { createProSubscription, verifyProPayment } from "@/lib/billing.functions";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { SUBSCRIPTION_KEY } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";

/** Starts Razorpay checkout for Pro. Requires a signed-in user. */
export function UpgradeButton({ children = "Upgrade to Pro", ...props }: ButtonProps) {
  const [busy, setBusy] = useState(false);
  const createSub = useServerFn(createProSubscription);
  const verify = useServerFn(verifyProPayment);
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  async function upgrade() {
    setBusy(true);
    try {
      const { subscriptionId, keyId, email } = await createSub();
      const res = await openRazorpayCheckout({
        keyId,
        subscriptionId,
        email: email || profile?.email || "",
        businessName: profile?.profile?.business_name ?? "",
      });
      if (!res) return;
      await verify({ data: res });
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      toast.success("You're on Pro. All features are unlocked.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button {...props} loading={busy} onClick={upgrade}>
      {children}
    </Button>
  );
}

export function LockIcon({ className }: { className?: string | undefined }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
