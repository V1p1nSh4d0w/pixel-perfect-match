import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/Button";
import { createStarterKitOrder, verifyStarterKitPayment } from "@/lib/billing.functions";
import { openStarterKitCheckout } from "@/lib/razorpay-checkout";
import { SUBSCRIPTION_KEY } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";

export function UpgradeButton({ children = "Get Starter Kit", ...props }: ButtonProps) {
  const [busy, setBusy] = useState(false);
  const createOrder = useServerFn(createStarterKitOrder);
  const verify = useServerFn(verifyStarterKitPayment);
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  async function buy() {
    setBusy(true);
    try {
      const order = await createOrder();
      const response = await openStarterKitCheckout({
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        email: order.email || profile?.email || "",
        businessName: profile?.profile?.business_name ?? "",
      });
      if (!response) return;
      await verify({ data: response });
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      toast.success("Starter Kit unlocked.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return <Button {...props} loading={busy} onClick={buy}>{children}</Button>;
}

export function LockIcon({ className }: { className?: string | undefined }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
