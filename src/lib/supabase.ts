import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";
import type { AssessmentAnswers, AssessmentResult, Finding, RiskLevel, Severity } from "@/types/assessment";
import type { ActionItem } from "@/types/action-item";
import { shortActionFor } from "@/lib/scoring";

export { supabase };

export async function signUpWithEmail(email: string, password: string, businessName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { business_name: businessName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, business_name, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateBusinessName(userId: string, businessName: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ business_name: businessName })
    .eq("id", userId);
  if (error) throw error;
}

// ---- Assessments ----

export async function saveAssessment(answers: AssessmentAnswers, result: AssessmentResult) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You need to be signed in.");
  const userId = userData.user.id;
  const { data: row, error } = await supabase
    .from("assessments")
    .insert({ user_id: userId, answers, score: result.score, risk_level: result.riskLevel })
    .select("id")
    .single();
  if (error) throw error;
  if (result.findings.length > 0) {
    const { error: fErr } = await supabase.from("findings").insert(
      result.findings.map((f) => ({
        assessment_id: row.id,
        user_id: userId,
        severity: f.severity,
        category: f.category,
        title: f.title,
        why_it_matters: f.why_it_matters,
        recommended_action: f.recommended_action,
        status: f.status,
      })),
    );
    if (fErr) throw fErr;
  }
  return row.id;
}

const SEVERITY_ORDER: Severity[] = ["Critical", "High", "Medium", "Low"];

export async function fetchLatestResult(): Promise<AssessmentResult | null> {
  const { data: a, error } = await supabase
    .from("assessments")
    .select("id, score, risk_level")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!a) return null;
  const { data: rows, error: fErr } = await supabase
    .from("findings")
    .select("id, severity, category, title, why_it_matters, recommended_action, status")
    .eq("assessment_id", a.id);
  if (fErr) throw fErr;
  const findings = (rows ?? []) as Finding[];
  findings.sort((x, y) => SEVERITY_ORDER.indexOf(x.severity) - SEVERITY_ORDER.indexOf(y.severity));
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
  findings.forEach((f) => { if (f.severity in counts) counts[f.severity]++; });
  return { score: a.score, riskLevel: a.risk_level as RiskLevel, findings, counts };
}

// ---- Findings & action items ----
export async function markFindingResolved(findingId: string) {
  const { error } = await supabase.from("findings").update({ status: "Resolved" }).eq("id", findingId);
  if (error) throw error;
}

/** Returns false when the finding is already in the action plan. */
export async function addFindingToActionPlan(finding: Pick<Finding, "id" | "title" | "recommended_action" | "severity">) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You need to be signed in.");
  const { error } = await supabase.from("action_items").insert({
    user_id: userData.user.id,
    finding_id: finding.id,
    title: shortActionFor(finding),
    priority: finding.severity,
  });
  if (error) {
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}

export async function fetchActionPlanFindingIds(): Promise<string[]> {
  const { data, error } = await supabase.from("action_items").select("finding_id").not("finding_id", "is", null);
  if (error) throw error;
  return (data ?? []).map((r) => r.finding_id as string);
}

export async function fetchActionItems(): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from("action_items")
    .select("id, user_id, finding_id, title, priority, completed, created_at, finding:findings(category, recommended_action)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ActionItem[];
}

export async function setActionItemCompleted(id: string, completed: boolean) {
  const { error } = await supabase.from("action_items").update({ completed }).eq("id", id);
  if (error) throw error;
}

export async function deleteActionItem(id: string) {
  const { error } = await supabase.from("action_items").delete().eq("id", id);
  if (error) throw error;
}

// ---- Report ----
export interface AssessmentMeta {
  id: string;
  created_at: string;
  answers: AssessmentAnswers;
}

export async function fetchLatestAssessmentMeta(): Promise<AssessmentMeta | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, created_at, answers")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, created_at: data.created_at, answers: (data.answers ?? {}) as AssessmentAnswers };
}

// ---- Subscription & history ----
export async function fetchSubscription(): Promise<import("@/types/subscription").Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as import("@/types/subscription").Subscription | null;
}

export async function fetchScoreHistory(): Promise<{ id: string; created_at: string; score: number }[]> {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, created_at, score")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---- Audits, quarterly calls, admin ----
export async function fetchMyAudits(): Promise<{ id: string; paid_at: string }[]> {
  const { data, error } = await supabase.from("audits").select("id, paid_at").eq("status", "paid").order("paid_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as { id: string; paid_at: string }[];
}

export async function fetchCallsSince(since: Date, userId?: string): Promise<{ id: string; user_id: string; held_at: string }[]> {
  let q = supabase.from("quarterly_calls").select("id, user_id, held_at").gte("held_at", since.toISOString());
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) return false;
  return Boolean(data);
}

export async function adminFetchProUsers() {
  const { data: subs, error } = await supabase.from("subscriptions").select("user_id, plan, status, current_period_end").eq("plan", "pro");
  if (error) throw error;
  const ids = (subs ?? []).map((s) => s.user_id);
  if (ids.length === 0) return [];
  const { data: profiles } = await supabase.from("profiles").select("id, email, business_name").in("id", ids);
  return (subs ?? []).map((s) => ({ ...s, profile: profiles?.find((p) => p.id === s.user_id) ?? null }));
}

export async function adminFetchAudits() {
  const { data, error } = await supabase.from("audits").select("id, email, paid_at, status").eq("status", "paid").order("paid_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminMarkCall(userId: string) {
  const { error } = await supabase.from("quarterly_calls").insert({ user_id: userId });
  if (error) throw error;
}

export async function adminRemoveCall(id: string) {
  const { error } = await supabase.from("quarterly_calls").delete().eq("id", id);
  if (error) throw error;
}

// ---- Onboarding ----
export type OnboardingFlag = "viewed_findings" | "downloaded_report" | "dismissed_onboarding";

export interface OnboardingState {
  eligible: boolean;
  viewed_findings: boolean;
  downloaded_report: boolean;
  dismissed_onboarding: boolean;
  hasAssessment: boolean;
  hasActionItem: boolean;
}

export async function fetchOnboarding(): Promise<OnboardingState | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const [p, a, ai] = await Promise.all([
    supabase.from("profiles").select("onboarding_eligible, viewed_findings, downloaded_report, dismissed_onboarding").eq("id", u.user.id).maybeSingle(),
    supabase.from("assessments").select("id", { count: "exact", head: true }),
    supabase.from("action_items").select("id", { count: "exact", head: true }),
  ]);
  if (p.error) throw p.error;
  if (!p.data) return null;
  return {
    eligible: p.data.onboarding_eligible,
    viewed_findings: p.data.viewed_findings,
    downloaded_report: p.data.downloaded_report,
    dismissed_onboarding: p.data.dismissed_onboarding,
    hasAssessment: (a.count ?? 0) > 0,
    hasActionItem: (ai.count ?? 0) > 0,
  };
}

export async function setOnboardingFlag(flag: OnboardingFlag) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { error } = await supabase.from("profiles").update({ [flag]: true }).eq("id", u.user.id);
  if (error) throw error;
}
