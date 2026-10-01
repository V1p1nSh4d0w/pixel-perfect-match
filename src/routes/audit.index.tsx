import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { supabase } from "@/integrations/supabase/client";
import { createAuditOrder, verifyAuditPayment } from "@/lib/billing.functions";
import { openRazorpayOrderCheckout } from "@/lib/razorpay-checkout";

export const Route = createFileRoute("/audit/")({
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
  "1-hour video call with a Security+ certified auditor",
  "Manual review of your setup based on your assessment answers",
  "A written PDF report with personalized recommendations, prioritized by risk",
  "A 30-day follow-up email check-in",
];
const NOT = ["Not a penetration test", "Not a compliance certification", "Not a substitute for a full technical audit"];

function AuditPage() {
  const navigate = useNavigate();
  const createOrder = useServerFn(createAuditOrder);
  const verify = useServerFn(verifyAuditPayment);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { setSignedIn(true); setEmail(data.user.email ?? ""); }
    });
  }, []);

  async function buy(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs["name"] = "Enter your name";
    if (!businessName.trim()) errs["business"] = "Enter your business name";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs["email"] = "Enter a valid email address";
    if (!/^[0-9+\-\s()]{6,20}$/.test(phone.trim())) errs["phone"] = "Enter a valid phone number";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const order = await createOrder({ data: { email: email.trim(), name: name.trim(), business_name: businessName.trim(), phone: phone.trim() } });
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
        <p className="mt-3 text-sm text-muted-foreground">A 1-hour call with a certified security auditor, a full review of your setup, and a written report with prioritized fixes.</p>

        <div className="mt-8 rounded-card border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">What's included</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
            {INCLUDED.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div className="mt-4 px-1">
          <h2 className="text-xs font-medium text-muted-foreground">What it's not</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {NOT.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>

        <form onSubmit={buy} className="mt-8 space-y-4 rounded-card border border-primary bg-card p-6">
          <p><span className="text-3xl font-semibold text-foreground">₹15,000</span> <span className="text-sm text-muted-foreground">(one-time)</span></p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} error={errors["name"]} />
            <Input label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} error={errors["business"]} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors["email"]} />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors["phone"]} />
          </div>
          <Button type="submit" fullWidth loading={busy}>Book Full Audit — ₹15,000</Button>
          <p className="text-xs text-muted-foreground">Payment via Razorpay. After payment, you'll receive a booking link by email within 24 hours.</p>
        </form>
      </div>
    </div>
  );
}
