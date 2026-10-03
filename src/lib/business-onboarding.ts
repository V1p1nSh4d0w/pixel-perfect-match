export const BUSINESS_TYPES = [
  ["general", "🏪", "Small Business / General"],
  ["healthcare", "🏥", "Clinic / Healthcare"],
  ["education", "🎓", "Coaching / Education"],
  ["professional", "📊", "CA / Accounting / Professional Services"],
  ["ecommerce", "🛍️", "D2C / E-commerce"],
  ["other", "", "Other"],
] as const;

export const TEAM_SIZES = ["Just me", "2–5", "6–20", "21–50", "51+"] as const;

export interface BusinessOnboarding {
  type: string;
  otherType: string;
  teamSize: string;
  mode: "quick" | "deep" | "";
}

const KEY = "securecheck-business-onboarding";
export const EMPTY_ONBOARDING: BusinessOnboarding = { type: "", otherType: "", teamSize: "", mode: "" };

/** Kept in this browser tab only, so choices persist while moving through the Business flow. */
export function loadOnboarding(): BusinessOnboarding {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY_ONBOARDING, ...JSON.parse(raw) } : EMPTY_ONBOARDING;
  } catch {
    return EMPTY_ONBOARDING;
  }
}

export function saveOnboarding(v: BusinessOnboarding) {
  try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

export function businessTypeLabel(v: BusinessOnboarding) {
  if (v.type === "other") return v.otherType.trim() || "Other";
  return BUSINESS_TYPES.find((t) => t[0] === v.type)?.[2] ?? "";
}
