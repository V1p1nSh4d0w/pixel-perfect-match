import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STARTER_KIT_AMOUNT_PAISE = 49900;

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
  if (!res.ok) throw new Error(json.error?.description ?? "Payment provider error.");
  return json;
}

async function hmacHex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export const createStarterKitOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: premiumOn } = await context.supabase.rpc("premium_enabled");
    if (!premiumOn) throw new Error("SecureCheck is free during the beta — no purchase needed.");
    const { data: alreadyPaid, error: accessError } = await context.supabase.rpc("has_paid_access", { _user_id: context.userId });
    if (accessError) throw new Error("Could not verify your current access.");
    if (alreadyPaid) throw new Error("Starter Kit is already active on this account.");

    const { keyId } = razorpayCreds();
    const order = await rzp<{ id: string }>("/orders", {
      method: "POST",
      body: {
        amount: STARTER_KIT_AMOUNT_PAISE,
        currency: "INR",
        receipt: `starter_${Date.now()}`,
        notes: { product: "starter_kit", user_id: context.userId },
      },
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: context.userId,
      razorpay_order_id: order.id,
      razorpay_payment_id: null,
    }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    const email = (context.claims as { email?: string } | undefined)?.email ?? "";
    return { orderId: order.id, keyId, amount: STARTER_KIT_AMOUNT_PAISE, email };
  });

export const verifyStarterKitPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    razorpay_payment_id: z.string().min(1).max(100),
    razorpay_order_id: z.string().min(1).max(100),
    razorpay_signature: z.string().min(1).max(200),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { keySecret } = razorpayCreds();
    const expected = await hmacHex(keySecret, `${data.razorpay_order_id}|${data.razorpay_payment_id}`);
    if (!safeEqual(expected, data.razorpay_signature)) throw new Error("Payment could not be verified.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: readError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, razorpay_order_id, razorpay_payment_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row || row.user_id !== context.userId || row.razorpay_order_id !== data.razorpay_order_id) {
      throw new Error("This payment does not belong to your account.");
    }
    if (row.razorpay_payment_id) return { ok: true };

    const { error } = await supabaseAdmin.from("subscriptions").update({
      plan: "starter",
      status: "active",
      razorpay_payment_id: data.razorpay_payment_id,
      paid_at: new Date().toISOString(),
      current_period_end: null,
    }).eq("user_id", context.userId).eq("razorpay_order_id", data.razorpay_order_id).is("razorpay_payment_id", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPaymentHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row, error } = await context.supabase
      .from("subscriptions")
      .select("plan, razorpay_payment_id, razorpay_subscription_id, paid_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return [];
    if (row.plan === "starter" && row.razorpay_payment_id && row.paid_at) {
      return [{ id: row.razorpay_payment_id, amount: 499, status: "paid", date: row.paid_at }];
    }
    if (row.plan !== "pro" || !row.razorpay_subscription_id) return [];
    try {
      const invoices = await rzp<{ items: { id: string; amount_paid: number; status: string; paid_at: number | null; created_at: number }[] }>(
        `/invoices?subscription_id=${encodeURIComponent(row.razorpay_subscription_id)}`,
      );
      return invoices.items.map((item) => ({
        id: item.id,
        amount: item.amount_paid / 100,
        status: item.status,
        date: new Date((item.paid_at ?? item.created_at) * 1000).toISOString(),
      }));
    } catch {
      return [];
    }
  });

export const authorizePaidFeature = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_feature_access", { _user_id: context.userId });
    if (error || !allowed) throw new Error("Starter Kit access is required.");
    return { allowed: true };
  });
