export type Plan = "free" | "pro" | "starter";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";

export interface Subscription {
  id: string;
  user_id: string;
  plan: Plan;
  status: SubscriptionStatus;
  razorpay_subscription_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  current_period_end: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  paid_access: boolean;
}

export interface BillingPayment {
  id: string;
  amount: number;
  status: string;
  date: string;
}

/** Paid access is decided by the database, never inferred from browser state. */
export function hasPaidAccess(sub: Subscription | null | undefined): boolean {
  return sub?.paid_access === true;
}
