import { createFileRoute } from "@tanstack/react-router";

/*
 * Razorpay recurring-billing webhook — PLACEHOLDER.
 *
 * Razorpay will send events here once configured in Dashboard → Webhooks:
 *   - subscription.charged   → extend current_period_end by one month, keep plan = "pro"
 *   - subscription.cancelled → set status = "cancelled"
 *   - payment.failed         → flag the subscription (e.g. status = "inactive") and notify the user
 *
 * TODO: verify the X-Razorpay-Signature header (HMAC-SHA256 of the raw body with a
 * RAZORPAY_WEBHOOK_SECRET) before handling any event, then update public.subscriptions
 * via the admin client (matched on razorpay_subscription_id).
 */
export const Route = createFileRoute("/api/razorpay/webhook")({
  server: {
    handlers: {
      POST: async () => new Response("ok"),
    },
  },
});
