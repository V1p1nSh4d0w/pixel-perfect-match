import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { supabase } from "@/integrations/supabase/client";
import { createAuditOrder, verifyAuditPayment } from "@/lib/billing.functions";
import { openRazorpayOrderCheckout } from "@/lib/razorpay-checkout";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Full Security Audit — SecureCheck" },
      { name: "description", content: "A done-for-you manual security audit: 1-hour call, full review, written report and 30-day follow-up. ₹15,000 one-time." },
      { property: "og:title", content: "Full Security Audit — SecureCheck" },
      { property: "og:description", content: "Done-for-you manual security audit for ₹15,000 one-time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

const INCLUDED = [
  ["1-hour video call with Aman", "Walk through your setup with the founder of SecureCheck."],
  ["Full manual review", "A hands-on review of your business's setup, based on your assessment answers."],
  ["Written PDF report", "Prioritized, personalized recommendations you can act on."],
  ["30-day follow-up", "An email check-in a month later to see how the fixes are going."],
] as const;

function AuditPage() {
  const navigate = useNavigate();
  const createOrder = useServerFn(createAuditOrder);
  const verify = useServerFn(verifyAuditPayment);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { setSignedIn(true); setEmail(data.user.email ?? ""); }
    });
  }, []);

  async function buy(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Enter a valid email address"); return; }
    setError(undefined);
    setBusy(true);
    try {
      const order = await createOrder({ data: { email: email.trim() } });
      const res = await openRazorpayOrderCheckout({ keyId: order.keyId, orderId: order.orderId, amount: order.amount, email: email.trim() });
      if (!res) return;
      await verify({ data: res });
      await navigate({ to: "/audit/confirmed" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 flex items-center justify-between">
          <Link to="/pricing" className="text-base font-semibold tracking-tight text-foreground">SecureCheck</Link>
          <Link to={signedIn ? "/app" : "/login"} className="text-sm text-muted-foreground hover:text-foreground">
            {signedIn ? "Go to app" : "Log in"}
          </Link>
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">One-time audit</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Full Security Audit</h1>
        <p className="mt-3 text-sm text-muted-foreground">A done-for-you manual audit of your business's security, with a clear written plan.</p>

        <div className="mt-8 space-y-3">
          {INCLUDED.map(([t, d]) => (
            <div key={t} className="rounded-card border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <form onSubmit={buy} className="mt-8 space-y-4 rounded-card border border-primary bg-card p-6">
          <p><span className="text-3xl font-semibold text-foreground">₹15,000</span> <span className="text-sm text-muted-foreground">one-time</span></p>
          <Input label="Email for the booking link" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" fullWidth loading={busy}>Book Full Audit — ₹15,000</Button>
          <p className="text-xs text-muted-foreground">One-time payment. Includes a 1-hour call and a written report. Secure payments via Razorpay.</p>
        </form>
      </div>
    </div>
  );
}
