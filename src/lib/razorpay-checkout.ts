export type RazorpayOrderResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

interface RazorpayInstance { open: () => void }
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;
let loader: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if ((window as unknown as { Razorpay?: RazorpayCtor }).Razorpay) return Promise.resolve();
  loader ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => { loader = null; reject(new Error("Could not load Razorpay checkout.")); };
    document.body.appendChild(script);
  });
  return loader;
}

export async function openStarterKitCheckout(opts: {
  keyId: string;
  orderId: string;
  amount: number;
  email: string;
  businessName: string;
}): Promise<RazorpayOrderResponse | null> {
  await loadScript();
  const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
  return new Promise((resolve) => {
    const checkout = new Razorpay({
      key: opts.keyId,
      order_id: opts.orderId,
      amount: opts.amount,
      currency: "INR",
      name: "SecureCheck",
      description: "SecureCheck Starter Kit — ₹499 one-time",
      prefill: { email: opts.email, name: opts.businessName },
      theme: { color: "#3D8BFF" },
      handler: (response: RazorpayOrderResponse) => resolve(response),
      modal: { ondismiss: () => resolve(null) },
    });
    checkout.open();
  });
}
