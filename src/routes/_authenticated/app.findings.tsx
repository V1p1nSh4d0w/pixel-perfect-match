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
import { addFindingToActionPlan, fetchActionPlanFindingIds, markFindingResolved, setFindingStatus } from "@/lib/supabase";
import type { AssessmentResult, Finding, Severity } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAYBOOKS } from "@/lib/playbooks";
import { LockIcon } from "@/components/UpgradeButton";

export const Route = createFileRoute("/_authenticated/app/findings")({
  validateSearch: (search: Record<string, unknown>) => {
    const severity = typeof search["severity"] === "string" && search["severity"] ? { severity: search["severity"] } : {};
    const finding = typeof search["finding"] === "string" && search["finding"] ? { finding: search["finding"] } : {};
    return { ...severity, ...finding };
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
  { value: "resolved", label: "Resolved" },
];

const ACTION_PLAN_KEY = ["action-plan-finding-ids"] as const;

function FindingsPage() {
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
    ? "No findings — every answer was the best option."
    : showResolved
      ? "No resolved findings yet."
      : activeSeverity
        ? `No open ${activeSeverity.toLowerCase()} findings.`
        : "All findings are resolved. Nice work.";

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

  const resolve = useMutation({
    mutationFn: () => markFindingResolved(f.id),
    onSuccess: () => {
      // Optimistic update for instant UI, then reconcile with the database so
      // an in-flight refetch (e.g. triggered by window focus) can't overwrite
      // the change with stale pre-resolve counts.
      queryClient.setQueryData<AssessmentResult | null>(LATEST_RESULT_KEY, (prev) =>
        prev ? { ...prev, findings: prev.findings.map((x) => (x.id === f.id ? { ...x, status: "Resolved" } : x)) } : prev,
      );
      queryClient.invalidateQueries({ queryKey: LATEST_RESULT_KEY });
      toast.success("Marked as resolved");
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
  const { isPro } = useSubscription();
  const playbook = PLAYBOOKS[f.title];

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
            {f.status}
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
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Evidence · from your assessment response</h3>
              <div className="rounded-lg border-l-2 border-primary/60 bg-surface-raised px-4 py-3">
                <p className="text-sm text-muted-foreground">{f.evidence.question}</p>
                <p className="mt-1 text-sm text-foreground">You answered: “{f.evidence.answer}”</p>
              </div>
            </section>
          )}
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Recommended fix</h3>
            <p className="text-sm leading-relaxed text-foreground">{f.recommended_action}</p>
          </section>
          {playbook ? (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Remediation playbook</h3>
              <ol className="space-y-2">
                {(isPro ? playbook : playbook.slice(0, 2)).map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
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
            {!isResolved && (
              <Button onClick={() => resolve.mutate()} loading={resolve.isPending}>Mark as resolved</Button>
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
            Full step-by-step playbook available on Pro
          </span>
          <Link to="/pricing" className="text-sm text-primary hover:underline">Upgrade</Link>
        </div>
      ) : null}
      </Card>
    </div>
  );
}
