import { Link } from "@tanstack/react-router";
import { ASSESSMENT_STEPS } from "@/lib/assessment-questions";
const QUESTION_COUNT = ASSESSMENT_STEPS.reduce((n, s) => n + s.questions.length, 0);
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOnboarding, setOnboardingFlag } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

export const ONBOARDING_KEY = ["onboarding"] as const;

export function OnboardingChecklist() {
  const qc = useQueryClient();
  const { isPro } = useSubscription();
  const { data } = useQuery({ queryKey: ONBOARDING_KEY, queryFn: fetchOnboarding, refetchOnMount: "always" });
  if (!data || !data.eligible || data.dismissed_onboarding) return null;

  const steps = [
    { title: "Complete your first assessment", desc: `Answer ${QUESTION_COUNT} questions about your business.`, done: data.hasAssessment, label: "Start assessment", to: "/app/assessment" },
    { title: "Review your findings", desc: "See what needs attention and why.", done: data.viewed_findings, label: "View findings", to: "/app/findings" },
    { title: "Build your action plan", desc: "Pick which fixes to tackle first.", done: data.hasActionItem, label: "Open action plan", to: "/app/action-plan" },
    {
      title: "Download your report", desc: "Get a PDF you can share with your team or accountant.", done: data.downloaded_report,
      label: isPro ? "View report" : "Unlock with Pro", to: isPro ? "/app/reports" : "/pricing",
    },
  ] as const;
  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  const dismiss = async () => {
    qc.setQueryData(ONBOARDING_KEY, { ...data, dismissed_onboarding: true });
    await setOnboardingFlag("dismissed_onboarding").catch(() => {});
  };

  return (
    <div className="mb-6 rounded-card border border-primary/30 bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Getting started</h2>
          <p className="mt-1 text-sm text-muted-foreground">Finish these steps to get the most out of SecureCheck.</p>
        </div>
        <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">{completed} of 4 completed</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / 4) * 100}%` }} />
        </div>
      </div>
      <ul className="mt-5 divide-y divide-border">
        {steps.map((s) => (
          <li key={s.title} className="flex items-center gap-4 py-3">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                s.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
              aria-label={s.done ? "Done" : "Not done"}
            >
              {s.done && (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3.5 8.5l3 3 6-7" /></svg>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", s.done ? "text-muted-foreground line-through" : "font-semibold text-foreground")}>{s.title}</p>
              <p className="truncate text-xs text-muted-foreground">{s.desc}</p>
            </div>
            {!s.done && (
              <Link to={s.to} className="inline-flex h-8 shrink-0 items-center rounded-button border border-border bg-surface-raised px-3 text-xs font-medium text-foreground hover:bg-border">
                {s.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
