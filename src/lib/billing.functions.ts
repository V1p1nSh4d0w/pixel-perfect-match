import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/*
 * Razorpay keys (TEST MODE ONLY for now):
 *   RAZORPAY_KEY_ID     — "rzp_test_..." from Razorpay Dashboard → Account & Settings → API Keys
 *   RAZORPAY_KEY_SECRET — the matching Key Secret (server-only, never sent to the browser)
 * Both are stored as backend secrets and read inside handlers via process.env.
 * Optional: RAZORPAY_PLAN_ID — if set, that plan is used instead of auto-creating one.
 */

const PRO_AMOUNT_PAISE = 99900; // ₹999
const PLAN_NOTE = "securecheck_pro_monthly";

function razorpayCreds() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) throw new Error("Payments are not configured yet.");
  return { keyId, keySecret };
}

async function rzp<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { keyId, keySecret } = razorpayCreds();
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  const json = (await res.json()) as T & { error?: { description?: string } };
  if (!res.ok) {
    console.error("Razorpay error", path, json);
    throw new Error(json.error?.description ?? "Payment provider error.");
  }
  return json;
}

async function getOrCreatePlanId(): Promise<string> {
  const configured = process.env["RAZORPAY_PLAN_ID"];
  if (configured) return configured;
  const list = await rzp<{ items: { id: string; item: { amount: number }; notes?: Record<string, string> }[] }>(
    "/plans?count=100",
  );
  const existing = list.items.find((p) => p.notes?.["app"] === PLAN_NOTE && p.item.amount === PRO_AMOUNT_PAISE);
  if (existing) return existing.id;
  const plan = await rzp<{ id: string }>("/plans", {
    method: "POST",
    body: {
      period: "monthly",
      interval: 1,
      item: { name: "SecureCheck Pro", amount: PRO_AMOUNT_PAISE, currency: "INR", description: "SecureCheck Pro — monthly" },
      notes: { app: PLAN_NOTE },
    },
  });
  return plan.id;
}

export const createProSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { keyId } = razorpayCreds();
    const planId = await getOrCreatePlanId();
    const sub = await rzp<{ id: string }>("/subscriptions", {
      method: "POST",
      body: { plan_id: planId, total_count: 120, customer_notify: 1, notes: { user_id: context.userId } },
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert({ user_id: context.userId, razorpay_subscription_id: sub.id }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    const email = (context.claims as { email?: string } | undefined)?.email ?? "";
    return { subscriptionId: sub.id, keyId, email };
  });

async function hmacHex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const verifyProPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        razorpay_payment_id: z.string().min(1).max(100),
        razorpay_subscription_id: z.string().min(1).max(100),
        razorpay_signature: z.string().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { keySecret } = razorpayCreds();
    const expected = await hmacHex(keySecret, `${data.razorpay_payment_id}|${data.razorpay_subscription_id}`);
    if (!safeEqual(expected, data.razorpay_signature)) throw new Error("Payment could not be verified.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("subscriptions")
      .select("razorpay_subscription_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (row?.razorpay_subscription_id !== data.razorpay_subscription_id) {
      throw new Error("This payment does not belong to your account.");
    }
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: "pro",
        status: "active",
        razorpay_payment_id: data.razorpay_payment_id,
        current_period_end: periodEnd,
      })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cancelProSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row, error } = await context.supabase
      .from("subscriptions")
      .select("razorpay_subscription_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.razorpay_subscription_id) throw new Error("No active subscription.");
    // Cancel at the end of the paid cycle so Pro stays unlocked until current_period_end.
    await rzp(`/subscriptions/${row.razorpay_subscription_id}/cancel`, {
      method: "POST",
      body: { cancel_at_cycle_end: 1 },
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: upErr } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", context.userId);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });

export const getPaymentHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row } = await context.supabase
      .from("subscriptions")
      .select("razorpay_subscription_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row?.razorpay_subscription_id) return [];
    try {
      const res = await rzp<{ items: { id: string; amount_paid: number; status: string; paid_at: number | null; created_at: number }[] }>(
        `/invoices?subscription_id=${encodeURIComponent(row.razorpay_subscription_id)}`,
      );
      return res.items.map((i) => ({
        id: i.id,
        amount: i.amount_paid / 100,
        status: i.status,
        date: new Date((i.paid_at ?? i.created_at) * 1000).toISOString(),
      }));
    } catch {
      return [];
    }
  });

// ---------------- Audit (one-time ₹15,000) ----------------
/*
 * One-time payment uses a Razorpay Order (POST /v1/orders), created server-side below.
 * If you prefer a Razorpay Payment Link instead, create it in the Dashboard and swap the CTA href.
 */
const AUDIT_AMOUNT_PAISE = 1500000; // ₹15,000

async function optionalUserId(): Promise<string | null> {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const auth = getRequestHeader("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.auth.getUser(token);
  return data.user?.id ?? null;
}

export const createAuditOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const { keyId } = razorpayCreds();
    const userId = await optionalUserId();
    const order = await rzp<{ id: string }>("/orders", {
      method: "POST",
      body: { amount: AUDIT_AMOUNT_PAISE, currency: "INR", receipt: `audit_${Date.now()}`, notes: { product: "audit", email: data.email } },
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("audits").insert({
      user_id: userId, email: data.email, amount_paise: AUDIT_AMOUNT_PAISE, razorpay_order_id: order.id,
    });
    if (error) throw new Error(error.message);
    return { orderId: order.id, keyId, amount: AUDIT_AMOUNT_PAISE };
  });

export const verifyAuditPayment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      razorpay_payment_id: z.string().min(1).max(100),
      razorpay_order_id: z.string().min(1).max(100),
      razorpay_signature: z.string().min(1).max(200),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { keySecret } = razorpayCreds();
    const expected = await hmacHex(keySecret, `${data.razorpay_order_id}|${data.razorpay_payment_id}`);
    if (!safeEqual(expected, data.razorpay_signature)) throw new Error("Payment could not be verified.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("audits")
      .update({ status: "audit_paid", razorpay_payment_id: data.razorpay_payment_id, paid_at: new Date().toISOString() })
      .eq("razorpay_order_id", data.razorpay_order_id);
    if (error) throw new Error(error.message);
    // TODO: send audit confirmation email (with booking link) once an email domain is set up.
    return { ok: true };
  });
