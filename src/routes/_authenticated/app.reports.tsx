import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RiskLabel, ScoreRing, SeverityBadge, SEVERITIES } from "@/components/Results";
import { useLatestResult } from "@/lib/use-latest-result";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { fetchActionItems, fetchLatestAssessmentMeta, setOnboardingFlag } from "@/lib/supabase";
import { ASSESSMENT_STEPS } from "@/lib/assessment-questions";
import { cn } from "@/lib/utils";
import type { RiskLevel, Severity } from "@/types/assessment";
import type { ActionItem } from "@/types/action-item";

export const Route = createFileRoute("/_authenticated/app/reports")({
  head: () => ({
    meta: [
      { title: "Security Assessment Report — SecureCheck" },
      { name: "description", content: "Your full, printable security assessment report." },
      { property: "og:title", content: "Security Assessment Report — SecureCheck" },
      { property: "og:description", content: "Your full, printable security assessment report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

const VERDICT: Record<RiskLevel, string> = {
  "Low risk": "Your business has a solid baseline. Address the remaining items to strengthen it.",
  "Moderate risk": "You have important gaps. Prioritize the high severity items first.",
  "High risk": "Your answers show significant gaps. Address the critical and high items soon.",
  "Critical risk": "Your answers show critical gaps that need immediate attention.",
};

const SEV_COLOR: Record<Severity, string> = {
  Critical: "text-danger print-danger",
  High: "text-warning print-warning",
  Medium: "text-medium",
  Low: "text-low",
};

const SECTIONS: { name: string; priorities: string[] }[] = [
  { name: "This week", priorities: ["Critical", "High"] },
  { name: "This month", priorities: ["Medium"] },
  { name: "Later", priorities: ["Low"] },
];

const TOTAL_QUESTIONS = ASSESSMENT_STEPS.reduce((n, s) => n + s.questions.length, 0);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function SectionHeading({ title, intro }: { title: string; intro?: string | undefined }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {intro ? <p className="mt-1 text-sm text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

function ReportPage() {
  const { result, isLoading } = useLatestResult();
  const { data: profileData } = useProfile();
  const { isPro } = useSubscription();
  const metaQ = useQuery({ queryKey: ["latest-assessment-meta"], queryFn: fetchLatestAssessmentMeta });
  const actionsQ = useQuery({ queryKey: ["action-items"], queryFn: fetchActionItems });

  if (isLoading || metaQ.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!result || !metaQ.data) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-semibold text-foreground">No report yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Complete your first security assessment to generate a report.</p>
        <Link to="/app/assessment" className="mt-6 inline-flex">
          <Button>Start assessment</Button>
        </Link>
      </Card>
    );
  }

  const meta = metaQ.data;
  const businessName = profileData?.profile?.business_name || "Your business";
  const date = formatDate(meta.created_at);
  const findings = [...result.findings].sort((a, b) => {
    const s = SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity);
    if (s !== 0) return s;
    return (a.status === "Resolved" ? 1 : 0) - (b.status === "Resolved" ? 1 : 0);
  });
  const resolved = findings.filter((f) => f.status === "Resolved").length;
  const openCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
  findings.forEach((f) => { if (f.status !== "Resolved") openCounts[f.severity]++; });
  const actions: ActionItem[] = actionsQ.data ?? [];
  const done = actions.filter((a) => a.completed).length;
  const answered = Object.values(meta.answers).filter((v) => typeof v === "string" && v.length > 0).length;
  const stepsReviewed = ASSESSMENT_STEPS.length;

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.", { position: "bottom-center" });
    } catch {
      toast.error("Couldn't copy the link.", { position: "bottom-center" });
    }
  }

  return (
    <div className="print-report space-y-8 print:space-y-5 print:pb-8">
      {/* Print-only header */}
      <div className="hidden items-baseline justify-between border-b border-border pb-2 text-xs text-muted-foreground print:flex">
        <span>{businessName} • {date}</span>
        <span>SecureCheck — Security Assessment Report</span>
      </div>
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Security Assessment Report</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {businessName} • {date}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2 print:hidden">
          {isPro ? (
            <Button onClick={() => { setOnboardingFlag("downloaded_report").catch(() => {}); window.print(); }}>Download PDF</Button>
          ) : (
            <div className="flex flex-col items-start gap-1.5">
              <span className="group relative inline-flex">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-button border border-border bg-surface-raised px-4 text-sm font-medium text-muted-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M4 21h16" />
                  </svg>
                  Download PDF
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-0.5" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </button>
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-64 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  Available with Starter Kit.
                </span>
              </span>
              <p className="text-xs text-muted-foreground">
                Unlock PDF downloads and full remediation playbooks.{" "}
                <Link to="/pricing" className="text-primary hover:underline">
                  Get Starter Kit →
                </Link>
              </p>
            </div>
          )}
          {isPro ? (
            <Button variant="secondary" onClick={share}>Share report</Button>
          ) : (
            <span className="group relative inline-flex">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-button border border-border bg-surface-raised px-4 text-sm font-medium text-muted-foreground"
              >
                Share report
              </button>
              <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-max max-w-64 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                Available with Starter Kit — share a read-only link with your accountant or team.
              </span>
            </span>
          )}
        </div>
      </header>

      {/* Score summary */}
      <Card className="print-avoid flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={result.score} risk={result.riskLevel} />
        <div className="text-center sm:text-left">
          <div className={cn(result.riskLevel === "Low risk" ? "print-low" : result.riskLevel === "Moderate risk" ? "print-medium" : result.riskLevel === "High risk" ? "print-warning" : "print-danger")}>
            <RiskLabel risk={result.riskLevel} />
          </div>
          <p className="mt-2 text-sm text-foreground">{VERDICT[result.riskLevel]}</p>
          <p className="mt-3 text-xs text-muted-foreground">This score is an assessment indicator, not a guarantee of security.</p>
        </div>
      </Card>

      {/* Risk summary */}
      <section className="print-avoid">
        <SectionHeading title="Risk summary" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SEVERITIES.map((s) => (
            <div key={s} className="rounded-card border border-border bg-card p-4">
              <p className={cn("text-2xl font-semibold", SEV_COLOR[s])}>{openCounts[s]}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s}</p>
            </div>
          ))}
          <div className="rounded-card border border-border bg-card p-4">
            <p className="print-success text-2xl font-semibold text-success">{resolved}</p>
            <p className="mt-1 text-xs text-muted-foreground">Resolved</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {resolved} of {findings.length} findings resolved
        </p>
      </section>

      {/* Print-only footer: bottom of page 1 */}
      <div className="mt-8 hidden items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground print:flex">
        <span>SecureCheck</span>
        <span>{date}</span>
      </div>

      {/* Findings */}
      <section>
        <SectionHeading title="Findings" intro="Issues identified during the assessment, in priority order." />
        {findings.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">No findings. Your baseline is strong.</p></Card>
        ) : (
          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="print-avoid flex flex-col gap-3 rounded-card border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(SEV_COLOR[f.severity])}><SeverityBadge severity={f.severity} /></span>
                    <span className="text-xs text-muted-foreground">{f.category}</span>
                  </div>
                  <p className="mt-2 font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.why_it_matters}</p>
                  <p className="mt-1 text-sm text-foreground">
                    <span className="text-muted-foreground">Suggested fix: </span>
                    {f.recommended_action}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 self-start rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    f.status === "Resolved" ? "print-success border-success text-success" : f.status === "In progress" ? "border-medium text-medium" : "border-border text-muted-foreground",
                  )}
                >
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Action plan */}
      <section className="print-avoid">
        <SectionHeading title="Action plan" />
        {actions.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">No actions yet.</p></Card>
        ) : (
          <Card>
            <p className="text-sm text-foreground">{done} of {actions.length} actions completed</p>
            <div className="mt-4 space-y-4">
              {SECTIONS.map((sec) => {
                const items = actions.filter((a) => sec.priorities.includes(a.priority));
                if (items.length === 0) return null;
                return (
                  <div key={sec.name}>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{sec.name}</p>
                    <ul className="mt-2 space-y-1.5">
                      {items.map((a) => (
                        <li key={a.id} className="flex items-start gap-2 text-sm">
                          <span
                            aria-label={a.completed ? "Completed" : "Not completed"}
                            className={cn(
                              "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              a.completed ? "print-primary border-primary bg-primary text-primary-foreground" : "border-border",
                            )}
                          >
                            {a.completed ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                            ) : null}
                          </span>
                          <span className={cn(a.completed ? "text-muted-foreground line-through" : "text-foreground")}>{a.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      {/* Details */}
      <section className="print-avoid">
        <SectionHeading title="Assessment details" />
        <Card>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {[
              ["Assessment date", date],
              ["Controls reviewed", String(stepsReviewed)],
              ["Questions answered", `${answered} of ${TOTAL_QUESTIONS}`],
              ["Assessment ID", meta.id.slice(0, 8)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      {/* Limitations */}
      <section className="print-avoid">
        <SectionHeading title="Assessment limitations" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          This assessment is based on the answers you provided and reflects a snapshot in time. It is a self-reported indicator, not a security audit or penetration test. It does not guarantee protection against cyber incidents. For a full technical audit, contact a qualified security professional.
        </p>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground print:text-center">
        Generated by SecureCheck • securecheck.app
      </footer>
    </div>
  );
}
