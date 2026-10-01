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
import { addFindingToActionPlan, fetchActionPlanFindingIds, markFindingResolved } from "@/lib/supabase";
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
  head: () => ({ meta: [{ title: "Findings — SecureCheck" }] }),
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
  const visible = showResolved ? resolved : activeSeverity ? open.filter((f) => f.severity === activeSeverity) : open;

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
      <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SeverityBadge severity={f.severity} />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{f.category}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Status: <span className={isResolved ? "text-success" : "text-foreground"}>{f.status}</span>
        </span>
      </div>
      <h2 className="text-base font-semibold text-foreground">{f.title}</h2>

      {expanded ? (
        <div className="space-y-4 border-t border-border pt-4">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Why it matters</p>
            <p className="text-sm text-foreground">{f.why_it_matters}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Suggested fix</p>
            <p className="text-sm text-foreground">{f.recommended_action}</p>
          </div>
          {isPro && playbook ? (
            <div className="rounded-button border border-border bg-surface-raised p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Remediation playbook</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-foreground">
                {playbook.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {!isResolved && (
              <Button onClick={() => resolve.mutate()} loading={resolve.isPending}>Mark as resolved</Button>
            )}
            <Button
              variant="secondary"
              onClick={() => addToPlan.mutate()}
              loading={addToPlan.isPending}
              disabled={inPlan}
            >
              {inPlan ? "In action plan" : "Add to action plan"}
            </Button>
            <Button variant="ghost" onClick={() => setExpanded(false)}>Hide</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="line-clamp-2 text-sm text-muted-foreground">{f.why_it_matters}</p>
          <Button variant="secondary" onClick={() => setExpanded(true)}>View remediation</Button>
        </>
      )}
      {!isPro && playbook ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-button border border-dashed border-border bg-surface-raised/50 p-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockIcon />
            Full remediation playbook available on Pro
          </span>
          <Link to="/pricing" className="text-sm text-primary hover:underline">Upgrade</Link>
        </div>
      ) : null}
      </Card>
    </div>
  );
}
