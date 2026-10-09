import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { SELF_REPORTED_SCORE_CAP, controlForFinding, enrichFindings, riskLevelFor, scoreAssessment } from "@/lib/scoring";
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

export async function changePassword(currentPassword: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.email) throw authError ?? new Error("Your session has expired. Sign in again and retry.");

  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Password verification is unavailable. Please try again later.");

  // Verify in a non-persistent client so the active browser session is never replaced.
  const verificationClient = createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
        if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
        if ((key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error: verificationError } = await verificationClient.auth.signInWithPassword({ email: authData.user.email, password: currentPassword });
  if (verificationError) {
    if (verificationError.message.toLowerCase().includes("invalid") || verificationError.status === 400 || verificationError.status === 401) {
      throw new Error("Your current password is incorrect.");
    }
    throw new Error("We couldn't verify your current password. Please try again.");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/** Used by password-reset flow after its recovery link has authenticated the user. */
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOutOtherSessions() {
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) throw error;
}

export async function exportMyAccountData() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("You need to be signed in.");
  const user = authData.user;

  const [profile, checkupResults, assessments, findings, actionItems, playbookProgress, subscription, paymentHistory, calls] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("checkup_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("assessments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("findings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("action_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("playbook_progress").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("audits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("quarterly_calls").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  const queryError = [profile.error, checkupResults.error, assessments.error, findings.error, actionItems.error, playbookProgress.error, subscription.error, paymentHistory.error, calls.error].find(Boolean);
  if (queryError) throw queryError;

  return {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email ?? null, createdAt: user.created_at ?? null },
    profile: profile.data,
    checkupResults: checkupResults.data ?? [],
    assessments: assessments.data ?? [],
    findings: findings.data ?? [],
    actionItems: actionItems.data ?? [],
    playbookProgress: playbookProgress.data ?? [],
    subscription: subscription.data,
    paymentHistory: paymentHistory.data ?? [],
    quarterlyCalls: calls.data ?? [],
  };
}

export async function deleteMyAccount() {
  // delete_my_account is not in the generated types yet (database function not created).
  const { error } = await supabase.rpc("delete_my_account" as never);
  if (error) throw error;
  // The database has removed this user and cascaded their account records.
  // Clear this browser's local token without calling the Auth API again.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) throw signOutError;
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
  const selfReported = findings.some((f) => f.reassessment);
  return { score: a.score, riskLevel: riskLevelFor(a.score), findings, counts, created_at: a.created_at, selfReported };
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
  // Self-reported fixes are unverified: cap the score so it never reaches 100 on self-report alone.
  const capped = Math.min(next.score, SELF_REPORTED_SCORE_CAP);
  const { error: ue } = await supabase.from("assessments").update({ answers, score: capped, risk_level: riskLevelFor(capped) }).eq("id", a.id);
  if (ue) throw ue;
  const { error: re } = await supabase.from("findings").update({
    status: "Resolved", reassessed_at: new Date().toISOString(), previous_answer: previousAnswer,
    reassessed_answer: control.best, previous_score: a.score, new_score: capped,
  }).eq("id", findingId);
  if (re) throw re;
  await supabase.from("action_items").update({ completed: true }).eq("finding_id", findingId);
  return { previousScore: a.score, newScore: capped };
}

/** Undo a self-reported fix (a playbook step was unticked): restore the answer, rescore, set "In progress". */
export async function revertReassessment(findingId: string, title: string) {
  const control = controlForFinding(title);
  const { data: f, error: fe } = await supabase.from("findings").select("assessment_id, previous_answer, reassessed_at").eq("id", findingId).single();
  if (fe) throw fe;
  if (control && f.reassessed_at) {
    const { data: a, error: ae } = await supabase.from("assessments").select("id, answers").eq("id", f.assessment_id).single();
    if (ae) throw ae;
    const answers = { ...((a.answers ?? {}) as AssessmentAnswers) };
    if (f.previous_answer) answers[control.id] = f.previous_answer; else delete answers[control.id];
    const { count } = await supabase.from("findings").select("id", { count: "exact", head: true })
      .eq("assessment_id", f.assessment_id).not("reassessed_at", "is", null).neq("id", findingId);
    const raw = scoreAssessment(answers).score;
    const score = count ? Math.min(raw, SELF_REPORTED_SCORE_CAP) : raw;
    const { error: ue } = await supabase.from("assessments").update({ answers, score, risk_level: riskLevelFor(score) }).eq("id", a.id);
    if (ue) throw ue;
  }
  const { error } = await supabase.from("findings").update({
    status: "In progress", reassessed_at: null, previous_answer: null, reassessed_answer: null, previous_score: null, new_score: null,
  }).eq("id", findingId);
  if (error) throw error;
  await supabase.from("action_items").update({ completed: false }).eq("finding_id", findingId);
}

export async function fetchPlaybookProgress(): Promise<Record<string, number[]>> {
  const { data, error } = await supabase.from("playbook_progress").select("finding_id, step_index");
  if (error) throw error;
  const out: Record<string, number[]> = {};
  for (const r of data ?? []) (out[r.finding_id] ??= []).push(r.step_index);
  return out;
}

export async function setPlaybookStep(findingId: string, stepIndex: number, done: boolean) {
  if (done) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("You need to be signed in.");
    const { error } = await supabase.from("playbook_progress").upsert(
      { user_id: u.user.id, finding_id: findingId, step_index: stepIndex },
      { onConflict: "finding_id,step_index", ignoreDuplicates: true },
    );
    if (error) throw error;
  } else {
    const { error } = await supabase.from("playbook_progress").delete().eq("finding_id", findingId).eq("step_index", stepIndex);
    if (error) throw error;
  }
}

export interface ControlReference { id: string; control_id: string; framework: string; reference: string; verified: boolean }
export async function fetchControlReferences(): Promise<ControlReference[]> {
  const { data, error } = await supabase.from("control_references").select("id, control_id, framework, reference, verified");
  if (error) throw error;
  return data ?? [];
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

/** Database-stored premium flag. Off = free beta: nothing is gated. */
export async function fetchPremiumEnabled(): Promise<boolean> {
  const { data } = await supabase.from("feature_flags").select("enabled").eq("key", "premium_enabled").maybeSingle();
  return data?.enabled === true;
}

/** True when premium is off, or the user holds a database-verified entitlement. */
export async function fetchFeatureAccess(): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_feature_access");
  if (error) return false;
  return Boolean(data);
}

export type AppEventName = "template_button_clicked" | "template_downloaded" | "domain_check_run" | "report_shared" | "help_requested" | "premium_requested";

/** Records a demand-tracking event for the signed-in user (RLS: own rows only). */
export async function trackEvent(event_name: AppEventName, object_id?: string | null, metadata?: Record<string, string | number | boolean | null>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("events").insert({ user_id: user.id, event_name, object_id: object_id ?? null, metadata: metadata ?? null });
}

export async function fetchPublishedTemplates() {
  const { data, error } = await supabase.from("templates").select("id, title, description, linked_finding_key, preview_text").eq("published", true);
  if (error) throw error;
  return data ?? [];
}

