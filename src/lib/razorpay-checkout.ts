type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

interface RazorpayInstance { open: () => void }
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;

let loader: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if ((window as unknown as { Razorpay?: RazorpayCtor }).Razorpay) return Promise.resolve();
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => { loader = null; reject(new Error("Could not load Razorpay checkout.")); };
    document.body.appendChild(s);
  });
  return loader;
}

/** Opens Razorpay checkout for a subscription. Resolves with the payment response, or null if dismissed. */
export async function openRazorpayCheckout(opts: {
  keyId: string;
  subscriptionId: string;
  email: string;
  businessName: string;
}): Promise<RazorpayResponse | null> {
  return open<RazorpayResponse>({
    key: opts.keyId,
    subscription_id: opts.subscriptionId,
    description: "SecureCheck Pro — ₹999/month",
    prefill: { email: opts.email, name: opts.businessName },
  });
}

export type RazorpayOrderResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

/** Opens Razorpay checkout for a one-time order (the Audit). */
export async function openRazorpayOrderCheckout(opts: {
  keyId: string;
  orderId: string;
  amount: number;
  email: string;
}): Promise<RazorpayOrderResponse | null> {
  return open<RazorpayOrderResponse>({
    key: opts.keyId,
    order_id: opts.orderId,
    amount: opts.amount,
    currency: "INR",
    description: "SecureCheck Full Audit — ₹15,000",
    prefill: { email: opts.email },
  });
}

async function open<T>(options: Record<string, unknown>): Promise<T | null> {
  await loadScript();
  const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
  return new Promise((resolve) => {
    const rzp = new Razorpay({
      ...options,
      name: "SecureCheck",
      theme: { color: "#3D8BFF" },
      handler: (res: T) => resolve(res),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
