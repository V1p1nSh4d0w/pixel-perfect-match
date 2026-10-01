import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";

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
import type { AssessmentAnswers, AssessmentResult, Finding, RiskLevel, Severity } from "@/types/assessment";

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
