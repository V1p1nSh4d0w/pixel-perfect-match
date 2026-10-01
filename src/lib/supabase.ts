import { supabase } from "@/integrations/supabase/client";
import { enrichFindings, riskLevelFor } from "@/lib/scoring";
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
    .select("id, score, risk_level, answers, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!a) return null;
  const { data: rows, error: fErr } = await supabase
    .from("findings")
    .select("id, severity, category, title, why_it_matters, recommended_action, status, reassessed_at, previous_answer, reassessed_answer, previous_score, new_score")
    .eq("assessment_id", a.id);
  if (fErr) throw fErr;
  const mapped: Finding[] = (rows ?? []).map(({ reassessed_at, previous_answer, reassessed_answer, previous_score, new_score, ...f }) => ({
    ...(f as Finding),
    reassessment: reassessed_at ? { reassessed_at, previous_answer, reassessed_answer, previous_score, new_score } : null,
  }));
  const findings = enrichFindings(mapped, (a.answers ?? {}) as AssessmentAnswers);
  findings.sort((x, y) => SEVERITY_ORDER.indexOf(x.severity) - SEVERITY_ORDER.indexOf(y.severity));
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
  findings.forEach((f) => { if (f.severity in counts) counts[f.severity]++; });
  return { score: a.score, riskLevel: riskLevelFor(a.score), findings, counts, created_at: a.created_at };
}

// ---- Findings & action items ----
/**
 * Self-reported reassessment. "Yes" sets the control's answer to its best
 * option, re-runs the existing scoring engine, saves the new score, and marks
 * the finding "Reported fixed" (status Resolved + reassessment fields).
 */
export async function reassessFinding(findingId: string, title: string) {
  const control = controlForFinding(title);
  if (!control) throw new Error("This finding can't be reassessed.");
  const { data: f, error: fe } = await supabase.from("findings").select("assessment_id").eq("id", findingId).single();
  if (fe) throw fe;
  const { data: a, error: ae } = await supabase.from("assessments").select("id, answers, score").eq("id", f.assessment_id).single();
  if (ae) throw ae;
  const answers = { ...((a.answers ?? {}) as AssessmentAnswers) };
  const previousAnswer = answers[control.id] ?? null;
  answers[control.id] = control.best;
  const next = scoreAssessment(answers);
  const { error: ue } = await supabase.from("assessments").update({ answers, score: next.score, risk_level: next.riskLevel }).eq("id", a.id);
  if (ue) throw ue;
  const { error: re } = await supabase.from("findings").update({
    status: "Resolved", reassessed_at: new Date().toISOString(), previous_answer: previousAnswer,
    reassessed_answer: control.best, previous_score: a.score, new_score: next.score,
  }).eq("id", findingId);
  if (re) throw re;
  await supabase.from("action_items").update({ completed: true }).eq("finding_id", findingId);
  return { previousScore: a.score, newScore: next.score };
}

export async function markFindingResolved(findingId: string) {
  return setFindingStatus(findingId, "Resolved");
}

export async function setFindingStatus(findingId: string, status: Finding["status"]) {
  const { error } = await supabase.from("findings").update({ status }).eq("id", findingId);
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
    .select("id, user_id, finding_id, title, priority, completed, created_at, finding:findings(category, recommended_action, title, severity, status, assessment_id)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ActionItem[];
}

/**
 * Completing an action resolves its linked finding; un-completing reopens it
 * (only if it is currently Resolved). The security score is NOT changed: the
 * score is calculated from assessment answers, and the scoring model does not
 * treat a resolved finding as an improved control until the user retakes the
 * assessment with updated answers.
 */
export async function setActionItemCompleted(id: string, completed: boolean, findingId?: string | null) {
  const { error } = await supabase.from("action_items").update({ completed }).eq("id", id);
  if (error) throw error;
  if (!findingId) return;
  const q = supabase.from("findings").update({ status: completed ? "Resolved" : "Open" }).eq("id", findingId);
  const { error: fErr } = completed ? await q : await q.eq("status", "Resolved");
  if (fErr) throw fErr;
}

/**
 * Builds the action plan for an assessment from its unresolved findings.
 * Runs once per assessment: if any of these findings already has an action
 * item, nothing is added (so items the user removed don't come back).
 * Returns the number of actions created.
 */
export async function generateActionPlan(findings: Finding[]): Promise<number> {
  const open = findings.filter((f) => f.status !== "Resolved");
  if (open.length === 0) return 0;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You need to be signed in.");
  const { data: existing, error } = await supabase
    .from("action_items")
    .select("finding_id")
    .in("finding_id", findings.map((f) => f.id));
  if (error) throw error;
  if ((existing ?? []).length > 0) return 0;
  const rows = open.map((f) => ({
    user_id: userData.user.id,
    finding_id: f.id,
    title: shortActionFor(f),
    priority: f.severity,
  }));
  const { error: insErr } = await supabase.from("action_items").insert(rows);
  if (insErr) throw insErr;
  return rows.length;
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

// ---- Paid access ----
export async function fetchSubscription(): Promise<import("@/types/subscription").Subscription | null> {
  const [{ data, error }, { data: paidAccess, error: accessError }] = await Promise.all([
    supabase.from("subscriptions").select("*").maybeSingle(),
    supabase.rpc("has_paid_access"),
  ]);
  if (error) throw error;
  if (accessError) throw accessError;
  if (!data) return null;
  return { ...data, paid_access: Boolean(paidAccess) } as import("@/types/subscription").Subscription;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) return false;
  return Boolean(data);
}

export async function adminFetchPaidUsers() {
  const { data: subs, error } = await supabase.from("subscriptions").select("user_id, plan, status, current_period_end, paid_at").in("plan", ["starter", "pro"]);
  if (error) throw error;
  const ids = (subs ?? []).map((s) => s.user_id);
  if (ids.length === 0) return [];
  const { data: profiles } = await supabase.from("profiles").select("id, email, business_name").in("id", ids);
  return (subs ?? []).map((s) => ({ ...s, profile: profiles?.find((p) => p.id === s.user_id) ?? null }));
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
  const { error } = await supabase.from("profiles").update({ [flag]: true } as Partial<Record<OnboardingFlag, boolean>>).eq("id", u.user.id);
  if (error) throw error;
}
