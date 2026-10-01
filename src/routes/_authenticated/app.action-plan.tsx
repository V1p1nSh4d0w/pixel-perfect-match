import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { deleteActionItem, fetchActionItems, generateActionPlan, setActionItemCompleted } from "@/lib/supabase";
import { LATEST_RESULT_KEY, useLatestResult } from "@/lib/use-latest-result";
import { compareActions } from "@/lib/scoring";
import type { Severity } from "@/types/assessment";
import type { ActionItem } from "@/types/action-item";

export const Route = createFileRoute("/_authenticated/app/action-plan")({
  component: ActionPlanPage,
});

const ACTION_ITEMS_KEY = ["action-items"];

interface Section {
  name: string;
  priorities: string[];
}

const SECTIONS: Section[] = [
  { name: "This week", priorities: ["Critical", "High"] },
  { name: "This month", priorities: ["Medium"] },
  { name: "Later", priorities: ["Low"] },
];

function ActionPlanPage() {
  const queryClient = useQueryClient();
  const { data: allItems, isLoading } = useQuery({
    queryKey: ACTION_ITEMS_KEY,
    queryFn: fetchActionItems,
  });
  const { result, isLoading: resultLoading } = useLatestResult();
  // Only show actions for the latest assessment's findings (plus any manual,
  // unlinked items), so older assessments don't produce duplicate actions.
  const currentIds = new Set(result?.findings.map((f) => f.id) ?? []);
  const items = allItems?.filter((it) => !it.finding_id || currentIds.has(it.finding_id));

  // Auto-generate the plan from the latest assessment's unresolved findings
  // (once per assessment; see generateActionPlan).
  const generatedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!result || !items) return;
    const key = result.findings.map((f) => f.id).join(",");
    if (!key || generatedFor.current === key) return;
    generatedFor.current = key;
    generateActionPlan(result.findings)
      .then((n) => {
        if (n > 0) {
          queryClient.invalidateQueries({ queryKey: ACTION_ITEMS_KEY });
          queryClient.invalidateQueries({ queryKey: ["action-plan-finding-ids"] });
        }
      })
      .catch(() => toast.error("Couldn't build your action plan."));
  }, [result, items, queryClient]);

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed, findingId }: { id: string; completed: boolean; findingId: string | null }) =>
      setActionItemCompleted(id, completed, findingId),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ACTION_ITEMS_KEY });
      const previous = queryClient.getQueryData<ActionItem[]>(ACTION_ITEMS_KEY);
      queryClient.setQueryData<ActionItem[]>(ACTION_ITEMS_KEY, (old) =>
        (old ?? []).map((it) => (it.id === id ? { ...it, completed } : it)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(ACTION_ITEMS_KEY, context.previous);
      toast.error("Couldn't update the action. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACTION_ITEMS_KEY });
      // Linked finding status changed: refresh dashboard/findings counts.
      queryClient.invalidateQueries({ queryKey: LATEST_RESULT_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteActionItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ACTION_ITEMS_KEY });
      const previous = queryClient.getQueryData<ActionItem[]>(ACTION_ITEMS_KEY);
      queryClient.setQueryData<ActionItem[]>(ACTION_ITEMS_KEY, (old) =>
        (old ?? []).filter((it) => it.id !== id),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(ACTION_ITEMS_KEY, context.previous);
      toast.error("Couldn't remove the action. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACTION_ITEMS_KEY });
      queryClient.invalidateQueries({ queryKey: ["action-plan-finding-ids"] });
    },
  });

  if (isLoading || resultLoading || !items) {
    return (
      <div>
        <PageHeader title="Action plan" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Action plan" />
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">No actions yet.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Your action plan is built automatically from unresolved findings. Complete an
              assessment, or add findings from the Findings page.
            </p>
            <Link to="/app/findings" className="mt-6">
              <Button>Go to Findings</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const completedCount = items.filter((it) => it.completed).length;
  const percent = Math.round((completedCount / items.length) * 100);

  return (
    <div>
      <PageHeader title="Action plan" />

      <Card className="mb-8">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {completedCount} / {items.length} actions completed
            </span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          // Section by the linked finding's severity (falls back to stored priority),
          // then order by severity, security impact and effort.
          const sev = (it: ActionItem) => (it.finding?.severity ?? it.priority) as Severity;
          const sectionItems = items
            .filter((it) => section.priorities.includes(sev(it)))
            .sort((a, b) => compareActions(
              { title: a.finding?.title ?? a.title, severity: sev(a) },
              { title: b.finding?.title ?? b.title, severity: sev(b) },
            ));
          if (sectionItems.length === 0) return null;
          return (
            <section key={section.name}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section.name}
              </h2>
              <Card className="p-0">
                <div className="divide-y divide-border">
                  {sectionItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) =>
                          toggleMutation.mutate({ id: item.id, completed: e.target.checked, findingId: item.finding_id })
                        }
                        className="mt-1 h-4 w-4 shrink-0 accent-primary"
                        aria-label={`Mark "${item.title}" as completed`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-start gap-x-2">
                        <span
                          className={`text-sm ${
                            item.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.finding?.recommended_action && item.finding.recommended_action !== item.title && (
                          <FixInfo text={item.finding.recommended_action} />
                        )}
                        </span>
                        {item.finding?.category && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            From: {item.finding.category}
                          </span>
                        )}
                        {item.finding_id && (
                          <Link
                            to="/app/findings"
                            search={{ finding: item.finding_id }}
                            className="mt-1 inline-block text-xs text-primary transition-colors hover:text-primary-hover"
                          >
                            View related finding
                          </Link>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(item.id)}
                        className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function FixInfo({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={text}
        aria-label="Show full suggested fix"
        aria-expanded={open}
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        ?
      </button>
      {open && (
        <span className="mt-1 block basis-full rounded-button bg-surface-raised px-3 py-2 text-xs text-muted-foreground">
          {text}
        </span>
      )}
    </>
  );
}
