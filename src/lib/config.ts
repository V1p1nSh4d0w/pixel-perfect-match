// PLACEHOLDER URLs — paste your real Calendly / Google Calendar booking links here.
export const QUARTERLY_CALL_BOOKING_URL = "https://calendly.com/your-link/30min";
export const AUDIT_CALL_BOOKING_URL = "https://calendly.com/your-link/audit-60min";

export const SUPPORT_EMAIL = "hello.securecheck@gmail.com";

export const AUDIT_PRICE_INR = 15000;
export const RETAINER_LINE =
  "Want ongoing help? Our Retainer at ₹5,000/month includes quarterly audits, monthly re-checks, and a private support channel. Reply to the confirmation email to discuss.";

/** Start of the current calendar quarter (Jan/Apr/Jul/Oct). */
export function quarterStart(d = new Date()): Date {
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
}
