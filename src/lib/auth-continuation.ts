import { claimGuestCheckupResult } from "@/lib/checkup-results";

const INTENT_KEY = "securecheck-findings-auth-intent";
const INTENT_MAX_AGE_MS = 30 * 60 * 1000;

export interface FindingsDestination {
  from: string;
  resultId?: string;
}

interface PendingFindingsIntent extends FindingsDestination {
  createdAt: number;
}

/** Accept only an internal Findings destination that names a real checkup path. */
export function parseFindingsDestination(value: unknown): FindingsDestination | null {
  if (typeof value !== "string" || !value || typeof window === "undefined") return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname !== "/app/findings") return null;
    const from = url.searchParams.get("from");
    if (!from || !/^\/checkup\/(personal|business)\/[a-z0-9/_-]+$/i.test(from)) return null;
    const resultId = url.searchParams.get("resultId") ?? undefined;
    if (resultId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resultId)) return null;
    return { from, ...(resultId ? { resultId } : {}) };
  } catch {
    return null;
  }
}

export function rememberFindingsDestination(value: unknown) {
  if (typeof window === "undefined") return;
  const destination = parseFindingsDestination(value);
  try {
    if (!destination) {
      sessionStorage.removeItem(INTENT_KEY);
      return;
    }
    const existing = readRememberedDestination();
    if (existing?.from === destination.from && existing.resultId === destination.resultId) return;
    sessionStorage.setItem(INTENT_KEY, JSON.stringify({ ...destination, createdAt: Date.now() }));
  } catch { /* session storage is best-effort */ }
}

function readRememberedDestination(): PendingFindingsIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as PendingFindingsIntent;
    const destination = parseFindingsDestination(
      `/app/findings?${new URLSearchParams({ from: value.from, ...(value.resultId ? { resultId: value.resultId } : {}) })}`,
    );
    if (!destination || typeof value.createdAt !== "number" || Date.now() - value.createdAt > INTENT_MAX_AGE_MS) {
      sessionStorage.removeItem(INTENT_KEY);
      return null;
    }
    return { ...destination, createdAt: value.createdAt };
  } catch {
    return null;
  }
}

async function finishDestination(intent: PendingFindingsIntent): Promise<FindingsDestination | null> {
  if (Date.now() - intent.createdAt > INTENT_MAX_AGE_MS) return null;
  const resultId = await claimGuestCheckupResult(intent.from, intent.resultId);
  return resultId ? { from: intent.from, resultId } : null;
}

/** Complete an auth-page redirect. Invalid, expired, or absent intent falls back to normal app entry. */
export async function completeFindingsDestination(value: unknown): Promise<FindingsDestination | null> {
  const destination = parseFindingsDestination(value);
  if (!destination) {
    clearFindingsDestination();
    return null;
  }
  const remembered = readRememberedDestination();
  if (!remembered || remembered.from !== destination.from || remembered.resultId !== destination.resultId) {
    clearFindingsDestination();
    return null;
  }
  const intent: PendingFindingsIntent = { ...destination, createdAt: remembered.createdAt };
  try {
    const result = await finishDestination(intent);
    clearFindingsDestination();
    return result;
  } catch (error) {
    // Keep the intent so a transient network failure can be retried from the auth page.
    throw error;
  }
}

/** Used when Supabase returns from email confirmation to the existing site URL. */
export async function completeRememberedFindingsDestination(): Promise<FindingsDestination | null> {
  const intent = readRememberedDestination();
  if (!intent) return null;
  try {
    const result = await finishDestination(intent);
    clearFindingsDestination();
    return result;
  } catch (error) {
    // Keep a recent intent available for a retry after a temporary network failure.
    throw error;
  }
}

export function clearFindingsDestination() {
  try { sessionStorage.removeItem(INTENT_KEY); } catch { /* session storage is best-effort */ }
}
