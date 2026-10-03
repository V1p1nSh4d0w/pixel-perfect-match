import { supabase } from "@/integrations/supabase/client";

/** Result group for one check: found = Needs attention, unsure = Worth reviewing, good = Looks good, skipped = Not checked. */
export type CheckupItemStatus = "found" | "unsure" | "good" | "skipped";

export interface CheckupItem {
  id: string;
  title: string;
  category: string;
  status: CheckupItemStatus;
  /** Answer the user picked, as displayed. */
  answer?: string;
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

export function scopeForPath(path: string): "personal" | "business" {
  return path.startsWith("/checkup/business") ? "business" : "personal";
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
export async function saveCheckupResult(input: { path: string; name: string; answers: Record<string, string>; items: CheckupItem[] }): Promise<boolean> {
  try { sessionStorage.setItem(localKey(input.path), JSON.stringify(input.answers)); } catch { /* storage unavailable */ }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { error } = await supabase.from("checkup_results").insert({
    user_id: session.user.id,
    scope: scopeForPath(input.path),
    checkup_path: input.path,
    checkup_name: input.name,
    answers: input.answers,
    items: input.items as unknown as never,
  });
  if (error) throw error;
  return true;
}

/** Latest saved answers for one checkup in the signed-in account. */
export async function fetchLatestAnswersFor(path: string): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase.from("checkup_results").select("answers").eq("checkup_path", path)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data?.answers as Record<string, string> | undefined) ?? null;
}

/** The latest saved result of each checkup the user has completed (newest first). */
export async function fetchLatestCheckupResults(): Promise<SavedCheckupResult[]> {
  const { data, error } = await supabase.from("checkup_results")
    .select("id, scope, checkup_path, checkup_name, answers, items, created_at")
    .order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  const seen = new Set<string>();
  const out: SavedCheckupResult[] = [];
  for (const r of data ?? []) {
    if (seen.has(r.checkup_path)) continue;
    seen.add(r.checkup_path);
    out.push(r as unknown as SavedCheckupResult);
  }
  return out;
}
