import { useEffect, useRef, useState } from "react";
import { setOnboardingFlag } from "@/lib/supabase";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SEVERITIES, SeverityBadge } from "@/components/Results";
import { LATEST_RESULT_KEY, useLatestResult } from "@/lib/use-latest-result";
import { addFindingToActionPlan, fetchActionPlanFindingIds, fetchControlReferences, fetchPlaybookProgress, reassessFinding, revertReassessment, setFindingStatus, setPlaybookStep } from "@/lib/supabase";
import { controlForFinding } from "@/lib/scoring";
import type { AssessmentResult, Finding, Severity } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { LockIcon } from "@/components/UpgradeButton";
import { useServerFn } from "@tanstack/react-start";
import { getRemediationPlaybooks } from "@/lib/playbooks.functions";
import { FINDING_KEY_FOR_TITLE } from "@/lib/templates.functions";
import { fetchPublishedTemplates } from "@/lib/supabase";
import { TemplateButton } from "@/components/TemplateButton";
import { fetchLatestCheckupResults } from "@/lib/checkup-results";
import { CheckupFindings } from "@/components/CheckupFindings";

export const Route = createFileRoute("/_authenticated/app/findings")({
  validateSearch: (search: Record<string, unknown>) => {
    const severity = typeof search["severity"] === "string" && search["severity"] ? { severity: search["severity"] } : {};
    const finding = typeof search["finding"] === "string" && search["finding"] ? { finding: search["finding"] } : {};
    const from = typeof search["from"] === "string" && search["from"].startsWith("/checkup/") ? { from: search["from"] as string } : {};
    return { ...severity, ...finding, ...from } as { severity?: string; finding?: string; from?: string };
  },
  head: () => ({ meta: [
    { title: "Findings — SecureCheck" },
    { name: "description", content: "Review security self-assessment findings and recommended fixes." },
    { property: "og:title", content: "Findings — SecureCheck" },
    { property: "og:description", content: "Review security self-assessment findings and recommended fixes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FindingsPage,
});

const PARAM_TO_SEVERITY: Record<string, Severity> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "resolved", label: "Resolved / Reported fixed" },
];

const ACTION_PLAN_KEY = ["action-plan-finding-ids"] as const;
const PROGRESS_KEY = ["playbook-progress"] as const;

const CONFIDENCE_HELP: Record<string, string> = {
  Low: "Low: based on your self-assessment answers only.",
  Medium: "Medium: self-assessment plus every playbook step ticked.",
  High: "High: reserved for technically verified evidence (not available yet).",
};

function ConfidenceBadge({ level }: { level: "Low" | "Medium" }) {
  return (
    <span className="group relative inline-flex cursor-help items-center gap-1 underline decoration-dotted underline-offset-2" tabIndex={0}>
      {level}
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-lg border border-border bg-surface p-3 text-xs font-normal leading-relaxed text-muted-foreground no-underline shadow-md group-hover:block group-focus:block">
        {Object.values(CONFIDENCE_HELP).map((t) => <span key={t} className="block">{t}</span>)}
      </span>
    </span>
  );
}

function FindingsPage() {
  const { from } = Route.useSearch();
  const q = useQuery({ queryKey: ["checkup-results"], queryFn: fetchLatestCheckupResults });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (q.error) return <p className="text-sm text-destructive">Couldn't load your checkup results. Please refresh the page.</p>;
  if ((q.data ?? []).length > 0) return <CheckupFindings results={q.data!} from={from} />;
  return <LegacyFindingsPage />;
}

function LegacyFindingsPage() {
  const { result, isLoading } = useLatestResult();
  const { severity, finding } = Route.useSearch();
  const planQuery = useQuery({ queryKey: ACTION_PLAN_KEY, queryFn: fetchActionPlanFindingIds });
  const inPlan = new Set(planQuery.data ?? []);
  const [flash, setFlash] = useState(false);
  const scrolledFor = useRef<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setOnboardingFlag("viewed_findings").catch(() => {}); }, []);

  // Auto-scroll to the linked finding once the list has rendered. The ~100ms
  // delay lets the list paint first; the highlight starts ~400ms after the
  // scroll begins so the user sees it land, then holds for 5s and fades out
  // over 1s.
  useEffect(() => {
    if (!result || !finding || scrolledFor.current === finding) return;
    const scrollTimer = setTimeout(() => {
      const el = document.querySelector(`[data-finding-id="${finding}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      scrolledFor.current = finding;
      flashTimer.current = setTimeout(() => {
        setFlash(true);
        flashTimer.current = setTimeout(() => setFlash(false), 5000);
      }, 400);
    }, 100);
    return () => {
      clearTimeout(scrollTimer);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [result, finding]);

  if (isLoading) return <p className="py-8 text-sm text-muted-foreground">Loading…</p>;

  if (!result) {
    return (
      <>
        <PageHeader title="Findings" />
        <Card className="mx-auto max-w-md text-center">
          <CardTitle>No findings yet</CardTitle>
          <CardBody className="mt-2">Complete the assessment to see what to fix.</CardBody>
          <Link
            to="/app/assessment"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-button bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Start assessment
          </Link>
        </Card>
      </>
    );
  }

  const showResolvedBase = severity === "resolved";
  const severityBase = severity && PARAM_TO_SEVERITY[severity] ? PARAM_TO_SEVERITY[severity] : null;
  // A highlighted finding (linked from the action plan) must stay visible: if it
  // is resolved, show the Resolved tab; if the severity filter would hide it,
  // fall back to all open findings.
  const highlightFinding = finding ? result.findings.find((f) => f.id === finding) : undefined;
  const showResolved = highlightFinding?.status === "Resolved" ? true : showResolvedBase;
  const activeSeverity =
    highlightFinding && highlightFinding.status !== "Resolved" && severityBase && highlightFinding.severity !== severityBase
      ? null
      : severityBase;
  const activeTab = showResolved ? "resolved" : activeSeverity ? severity : "";
  const open = result.findings.filter((f) => f.status !== "Resolved");
  const resolved = result.findings.filter((f) => f.status === "Resolved");
  const SEV_RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const visible = (showResolved ? resolved : activeSeverity ? open.filter((f) => f.severity === activeSeverity) : open)
    .slice()
    .sort((a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9));

  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
  open.forEach((f) => counts[f.severity]++);

  const emptyText = result.findings.length === 0
    ? "Your assessment currently has no unresolved findings. Keep reassessing as your security practices change."
    : showResolved
      ? "No resolved findings yet."
      : activeSeverity
        ? `No open ${activeSeverity.toLowerCase()} findings.`
        : "Your assessment currently has no unresolved findings. Keep reassessing as your security practices change.";

  return (
    <>
      <PageHeader title="Findings" description="Most serious first." />

      <Card className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 p-4">
        <div>
          <p className="text-2xl font-semibold text-foreground">{result.findings.length}</p>
          <p className="text-xs text-muted-foreground">Total findings</p>
        </div>
        {SEVERITIES.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">{counts[s]}</span>
            <SeverityBadge severity={s} />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">{resolved.length}</span>
          <span className="text-xs text-muted-foreground">Resolved</span>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.label}
            to="/app/findings"
            search={tab.value ? { severity: tab.value } : {}}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              tab.value === activeTab
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-surface-raised hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card><CardBody>{emptyText}</CardBody></Card>
      ) : (
        <div className="space-y-4">
          {visible.map((f) => (
            <FindingCard key={f.id} finding={f} inPlan={inPlan.has(f.id)} highlighted={finding === f.id} flash={flash} />
          ))}
        </div>
      )}
    </>
  );
}

function FindingCard({ finding: f, inPlan, highlighted, flash }: { finding: Finding; inPlan: boolean; highlighted?: boolean | undefined; flash?: boolean | undefined }) {
  const [expanded, setExpanded] = useState(Boolean(highlighted));

  const queryClient = useQueryClient();

  const [reassessing, setReassessing] = useState(false);
  const [reply, setReply] = useState<"" | "Yes" | "No" | "Not sure">("");
  const [scoreChange, setScoreChange] = useState<{ previousScore: number; newScore: number } | null>(null);
  const control = controlForFinding(f.title);
  const resolve = useMutation({
    mutationFn: () => reassessFinding(f.id, f.title),
    onSuccess: (change) => {
      setScoreChange(change);
      setReassessing(false);
      queryClient.invalidateQueries({ queryKey: ACTION_PLAN_KEY });
      // Optimistic update for instant UI, then reconcile with the database so
      // an in-flight refetch (e.g. triggered by window focus) can't overwrite
      // the change with stale pre-resolve counts.
      queryClient.setQueryData<AssessmentResult | null>(LATEST_RESULT_KEY, (prev) =>
        prev ? { ...prev, score: change.newScore, findings: prev.findings.map((x) => (x.id === f.id ? { ...x, status: "Resolved" } : x)) } : prev,
      );
      queryClient.invalidateQueries({ queryKey: LATEST_RESULT_KEY });
      toast.success("Marked as reported fixed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the finding."),
  });

  const startProgress = useMutation({
    mutationFn: () => setFindingStatus(f.id, "In progress"),
    onSuccess: () => {
      queryClient.setQueryData<AssessmentResult | null>(LATEST_RESULT_KEY, (prev) =>
        prev ? { ...prev, findings: prev.findings.map((x) => (x.id === f.id ? { ...x, status: "In progress" } : x)) } : prev,
      );
      queryClient.invalidateQueries({ queryKey: LATEST_RESULT_KEY });
      toast.success("Marked as in progress");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the finding."),
  });

  const addToPlan = useMutation({
    mutationFn: () => addFindingToActionPlan(f),
    onSuccess: (added) => {
      queryClient.invalidateQueries({ queryKey: ACTION_PLAN_KEY });
      toast.success(added ? "Added to action plan" : "Already in your action plan");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add to action plan."),
  });

  const isResolved = f.status === "Resolved";
  const { hasAccess: isPro } = useSubscription();
  const fetchPlaybooks = useServerFn(getRemediationPlaybooks);
  const playbooksQuery = useQuery({ queryKey: ["remediation-playbooks"], queryFn: () => fetchPlaybooks() });
  const playbook = playbooksQuery.data?.playbooks[f.title];
  const templatesQuery = useQuery({ queryKey: ["published-templates"], queryFn: fetchPublishedTemplates });
  const template = (templatesQuery.data ?? []).find((t) => t.linked_finding_key === FINDING_KEY_FOR_TITLE[f.title]);
  const progressQuery = useQuery({ queryKey: PROGRESS_KEY, queryFn: fetchPlaybookProgress });
  const refsQuery = useQuery({ queryKey: ["control-references"], queryFn: fetchControlReferences });
  const refs = (refsQuery.data ?? []).filter((r) => r.control_id === control?.id);
  const done = new Set(progressQuery.data?.[f.id] ?? []);
  const stepCount = playbook?.length ?? 0;
  const doneCount = playbook ? playbook.filter((_, i) => done.has(i)).length : 0;
  const allStepsDone = stepCount > 0 && doneCount === stepCount;
  // Low = self-assessment only; Medium = self-assessment + every playbook step ticked; High = reserved.
  const confidence: "Low" | "Medium" = allStepsDone ? "Medium" : "Low";
  const toggleStep = useMutation({
    mutationFn: async ({ i, checked }: { i: number; checked: boolean }) => {
      await setPlaybookStep(f.id, i, checked);
      if (!checked && (f.status === "Resolved" || f.reassessment)) await revertReassessment(f.id, f.title);
      else if (checked && f.status === "Open") await setFindingStatus(f.id, "In progress");
    },
    onMutate: ({ i, checked }) => {
      queryClient.setQueryData<Record<string, number[]>>(PROGRESS_KEY, (prev) => {
        const cur = new Set(prev?.[f.id] ?? []);
        if (checked) cur.add(i); else cur.delete(i);
        return { ...(prev ?? {}), [f.id]: [...cur] };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEY });
      queryClient.invalidateQueries({ queryKey: LATEST_RESULT_KEY });
      queryClient.invalidateQueries({ queryKey: ACTION_PLAN_KEY });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save the step."),
  });

  return (
    <div data-finding-id={f.id} className={cn("rounded-card ring-2 transition-shadow duration-1000", highlighted && flash ? "ring-primary" : "ring-transparent")}>
      <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={f.severity} />
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{f.category}</span>
          </div>
          <h2 className="type-card-title">{f.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {f.effort && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
              Effort: <span className="text-foreground">{f.effort}</span>
            </span>
          )}
          <span className={cn("rounded-full border px-2.5 py-0.5", isResolved ? "border-success/40 text-success" : f.status === "In progress" ? "border-medium/40 text-medium" : "border-border text-foreground")}>
            {isResolved && f.reassessment ? "Reported fixed" : f.status}
          </span>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-5 border-t border-border pt-5">
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Why it matters</h3>
            <p className="text-sm leading-relaxed text-foreground">{f.why_it_matters}</p>
          </section>
          {f.evidence && (
            <section>
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Evidence · based on your assessment</h3>
              <div className="rounded-lg border-l-2 border-primary/60 bg-surface-raised px-4 py-3">
                <p className="text-sm text-foreground">You answered: “{f.evidence.answer}”</p>
                <p className="mt-2 text-xs text-muted-foreground">Assessment question</p>
                <p className="text-sm text-muted-foreground">“{f.evidence.question}”</p>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <div className="flex gap-1.5"><dt className="text-muted-foreground">Source:</dt><dd className="text-foreground">Self-assessment</dd></div>
                  <div className="flex gap-1.5"><dt className="text-muted-foreground">Confidence:</dt><dd className="text-foreground"><ConfidenceBadge level={confidence} /></dd></div>
                </dl>
              </div>
            </section>
          )}
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Recommended fix</h3>
            <p className="text-sm leading-relaxed text-foreground">{f.recommended_action}</p>
          </section>
          {playbook ? (
            <section>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Remediation playbook</h3>
                <span className="text-xs text-muted-foreground">{doneCount} of {stepCount} steps done</span>
              </div>
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface-raised">
                <div className="h-full bg-primary transition-all" style={{ width: `${stepCount ? (doneCount / stepCount) * 100 : 0}%` }} />
              </div>
              <ol className="space-y-3">
                {playbook.map((step, i) => (
                  <li key={step.text} className="flex gap-3 text-sm leading-relaxed">
                    <input
                      type="checkbox"
                      aria-label={`Step ${i + 1} done`}
                      checked={done.has(i)}
                      onChange={(e) => toggleStep.mutate({ i, checked: e.target.checked })}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    />
                    <div>
                      <p className={cn(done.has(i) ? "text-muted-foreground line-through" : "text-foreground")}>Step {i + 1}: {step.text}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.time}{step.tool ? ` · Use: ${step.tool}` : ""}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {template ? <div className="mt-4"><TemplateButton templateId={template.id} findingId={f.id} /></div> : null}
            </section>
          ) : template ? <TemplateButton templateId={template.id} findingId={f.id} /> : null}
          {refs.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Reference</h3>
              <ul className="space-y-1 text-sm text-foreground">
                {refs.map((r) => (
                  <li key={r.id}>
                    {r.framework}: {r.reference}
                    {!r.verified && <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">to verify</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {isResolved && f.reassessment ? (
            <section className="rounded-lg border border-success/30 bg-success/5 px-4 py-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-success">Control improved</h3>
              <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-muted-foreground">Previous response</dt><dd className="text-foreground">“{f.reassessment.previous_answer ?? "Not answered"}”</dd></div>
                <div><dt className="text-xs text-muted-foreground">Current response</dt><dd className="text-foreground">“{f.reassessment.reassessed_answer}” (reported)</dd></div>
                <div><dt className="text-xs text-muted-foreground">Verification</dt><dd className="text-foreground">Self-assessment</dd></div>
                <div><dt className="text-xs text-muted-foreground">Last reassessed</dt><dd className="text-foreground">{new Date(f.reassessment.reassessed_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</dd></div>
              </dl>
              {f.reassessment.previous_score != null && f.reassessment.new_score != null && (
                <ScoreDelta from={f.reassessment.previous_score} to={f.reassessment.new_score} />
              )}
              <p className="mt-2 text-xs text-muted-foreground">This is self-reported. SecureCheck has not technically checked this setting.</p>
            </section>
          ) : null}
          {scoreChange && !f.reassessment ? <ScoreDelta from={scoreChange.previousScore} to={scoreChange.newScore} /> : null}
          {!isResolved && reassessing && control ? (
            <section className="rounded-lg border border-border bg-surface-raised px-4 py-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Reassess</h3>
              <p className="mt-1.5 text-sm text-foreground">Now that you've made the change: “{control.question}”</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-5" role="radiogroup">
                {(["Yes", "No", "Not sure"] as const).map((o) => (
                  <label key={o} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input type="radio" name={`reassess-${f.id}`} checked={reply === o} onChange={() => setReply(o)} className="accent-primary" />
                    {o === "Yes" ? `Yes — ${control.best}` : o}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Verification source: Self-assessment</p>
              {reply === "No" && <p className="mt-2 text-sm text-muted-foreground">This control is still unresolved, so the finding stays open. Follow the playbook above, then reassess.</p>}
              {reply === "Not sure" && <p className="mt-2 text-sm text-muted-foreground">The finding stays open. Check the setting first, then come back and reassess.</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {reply === "Yes" && <Button onClick={() => resolve.mutate()} loading={resolve.isPending}>Save reassessment</Button>}
                <Button variant="ghost" onClick={() => { setReassessing(false); setReply(""); }}>Cancel</Button>
              </div>
            </section>
          ) : null}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              variant="secondary"
              onClick={() => addToPlan.mutate()}
              loading={addToPlan.isPending}
              disabled={inPlan}
            >
              {inPlan ? "In action plan" : "Add to action plan"}
            </Button>
            {!isResolved && control && !reassessing && (
              <span title={allStepsDone ? undefined : "Tick every playbook step to mark this as fixed."}>
                <Button onClick={() => setReassessing(true)} disabled={!allStepsDone}>I've fixed this → Reassess</Button>
              </span>
            )}
            {f.status === "Open" && (
              <Button variant="ghost" onClick={() => startProgress.mutate()} loading={startProgress.isPending}>Mark in progress</Button>
            )}
            <Button variant="ghost" onClick={() => setExpanded(false)}>Hide</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{f.why_it_matters}</p>
          <Button variant="secondary" onClick={() => setExpanded(true)}>View remediation</Button>
        </>
      )}
      {!isPro && playbook ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border/60 bg-surface-raised p-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockIcon />
            Full step-by-step playbook available with Starter Kit
          </span>
          <Link to="/pricing" className="text-sm text-primary hover:underline">Get Starter Kit</Link>
        </div>
      ) : null}
      </Card>
    </div>
  );
}

function ScoreDelta({ from, to }: { from: number; to: number }) {
  const d = to - from;
  return (
    <div className="mt-3 flex items-baseline gap-3">
      <span className="text-xs text-muted-foreground">Security score (self-reported)</span>
      <span className="text-lg font-semibold text-foreground">{from} → {to} <span className="text-xs font-normal text-muted-foreground">(self-reported)</span></span>
      <span className={cn("text-sm", d > 0 ? "text-success" : "text-muted-foreground")}>{d > 0 ? `+${d}` : d} points</span>
    </div>
  );
}
