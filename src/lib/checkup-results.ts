import { supabase } from "@/integrations/supabase/client";

/** Result group for one check: found = Needs attention, unsure = Worth reviewing, good = Looks good, skipped = Not checked. */
export type CheckupItemStatus = "found" | "unsure" | "good" | "skipped";

export interface CheckupItem {
  id: string;
  title: string;
  category: string;
  status: CheckupItemStatus;

  /** Stable internal key connecting this check to a Finding definition. */
  findingKey?: string;

  /** Plain-language explanation carried from the check into the finding. */
  why?: string;

  /** Answer the user picked, as displayed. */
  answer?: string | undefined;
  review?: string;
  where?: string;
}

export interface SavedCheckupResult {
  id: string;
  scope: "personal" | "business";
  checkup_path: string;
  checkup_name: string;
  answers: Record<string, string>;
  items: CheckupItem[];
  created_at: string;
}

const localKey = (path: string) => `securecheck-checkup-result:${path}`;
const pendingResultKey = (path: string) => `securecheck-pending-result:${path}`;
const PENDING_RESULT_MAX_AGE_MS = 30 * 60 * 1000;

interface PendingCheckupResult {
  id: string;
  path: string;
  name: string;
  answers: Record<string, string>;
  items: CheckupItem[];
  createdAt: number;
}

export function scopeForPath(path: string): "personal" | "business" {
  return path.startsWith("/checkup/business") ? "business" : "personal";
}

function readPendingResult(path: string): PendingCheckupResult | null {
  try {
    const raw = sessionStorage.getItem(pendingResultKey(path));
    if (!raw) return null;
    const value = JSON.parse(raw) as PendingCheckupResult;
    if (value.path !== path || typeof value.id !== "string" || typeof value.name !== "string" || !Array.isArray(value.items) ||
        !value.answers || typeof value.answers !== "object" || !Number.isFinite(value.createdAt) ||
        Date.now() - value.createdAt > PENDING_RESULT_MAX_AGE_MS || value.createdAt > Date.now() + 60_000) {
      sessionStorage.removeItem(pendingResultKey(path));
      return null;
    }
    return value;
  } catch { return null; }
}

/** Prepare a durable, tab-local ID for a guest result before its link is rendered. */
export function prepareCheckupResult(input: { path: string; name: string; answers: Record<string, string>; items: CheckupItem[] }): string {
  try { sessionStorage.setItem(localKey(input.path), JSON.stringify(input.answers)); } catch { /* storage unavailable */ }
  const previous = readPendingResult(input.path);
  const id = previous && JSON.stringify(previous.answers) === JSON.stringify(input.answers)
    ? previous.id
    : crypto.randomUUID();
  const pending: PendingCheckupResult = { id, ...input, createdAt: Date.now() };
  try { sessionStorage.setItem(pendingResultKey(input.path), JSON.stringify(pending)); } catch { /* storage unavailable */ }
  return id;
}

export function getPendingCheckupResultId(path: string): string | null {
  return readPendingResult(path)?.id ?? null;
}

/** Latest answers for a checkup kept in this tab (works signed out too). */
export function loadLocalAnswers(path: string): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(localKey(path));
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch { return null; }
}

/**
 * Keeps answers in this tab always; when signed in, also saves the completed
 * checkup to the account. Throws if the account save fails.
 */
export async function saveCheckupResult(input: { path: string; name: string; answers: Record<string, string>; items: CheckupItem[] }, id: string): Promise<boolean> {
  const pending = readPendingResult(input.path);
  if (!pending || pending.id !== id) throw new Error("The checkup result is no longer available in this browser tab.");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false; // guests: session-only, no account save attempted
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) { console.error("Checkup save: could not verify the signed-in user", userError); throw userError ?? new Error("Not signed in"); }
  const { data: existing, error: lookupError } = await supabase.from("checkup_results")
    .select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    try { sessionStorage.removeItem(pendingResultKey(input.path)); } catch { /* storage unavailable */ }
    return true;
  }
  const { error } = await supabase.from("checkup_results").insert({
    id,
    user_id: user.id,
    scope: scopeForPath(input.path),
    checkup_path: input.path,
    checkup_name: input.name,
    created_at: new Date(pending.createdAt).toISOString(),
    answers: input.answers,
    items: input.items as unknown as never,
  });
  if (error) { console.error("Checkup save failed", { code: error.code, message: error.message, details: error.details, hint: error.hint }); throw error; }
  try { sessionStorage.removeItem(pendingResultKey(input.path)); } catch { /* storage unavailable */ }
  return true;
}

/** Associate a guest result with the currently authenticated user, relying on the existing INSERT RLS policy. */
export async function claimGuestCheckupResult(path: string, intendedId?: string): Promise<string | null> {
  const pending = readPendingResult(path);
  if (!pending || (intendedId && pending.id !== intendedId)) return null;
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;
  const user = authData.user;

  // This lookup is owner-scoped and protected by RLS; it makes retries idempotent.
  const { data: existing, error: lookupError } = await supabase.from("checkup_results")
    .select("id").eq("id", pending.id).eq("user_id", user.id).maybeSingle();
  if (lookupError) throw lookupError;
  if (!existing) {
    const { error } = await supabase.from("checkup_results").insert({
      id: pending.id,
      user_id: user.id,
      scope: scopeForPath(path),
      checkup_path: path,
      checkup_name: pending.name,
      created_at: new Date(pending.createdAt).toISOString(),
      answers: pending.answers,
      items: pending.items as unknown as never,
    });
    if (error) throw error;
  }
  try { sessionStorage.removeItem(pendingResultKey(path)); } catch { /* storage unavailable */ }
  return pending.id;
}

/** Latest saved answers for one checkup in the signed-in account. */
export async function fetchLatestAnswersFor(path: string): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase.from("checkup_results").select("answers").eq("checkup_path", path)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data?.answers as Record<string, string> | undefined) ?? null;
}

/** Saved checkup runs (newest first), retaining each run so Findings can show history. */
export async function fetchLatestCheckupResults(): Promise<SavedCheckupResult[]> {
  const pageSize = 500;
  const results: SavedCheckupResult[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from("checkup_results")
      .select("id, scope, checkup_path, checkup_name, answers, items, created_at")
      .order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);
    if (error) { console.error("Loading checkup results failed", { code: error.code, message: error.message, details: error.details, hint: error.hint }); throw error; }
    results.push(...((data ?? []) as unknown as SavedCheckupResult[]));
    if (!data || data.length < pageSize) break;
  }
  return results;
}
