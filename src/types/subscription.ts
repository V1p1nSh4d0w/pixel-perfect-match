export type Plan = "free" | "pro";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";

export interface Subscription {
  id: string;
  user_id: string;
  plan: Plan;
  status: SubscriptionStatus;
  razorpay_subscription_id: string | null;
  razorpay_payment_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingPayment {
  id: string;
  amount: number; // in rupees
  status: string;
  date: string; // ISO
}

/** Pro features stay unlocked until the paid period ends, even after cancelling. */
export function isProActive(sub: Subscription | null | undefined): boolean {
  if (!sub || sub.plan !== "pro") return false;
  if (sub.status === "active") return true;
  if (sub.status === "cancelled" && sub.current_period_end) {
    return new Date(sub.current_period_end).getTime() > Date.now();
  }
  return false;
}
