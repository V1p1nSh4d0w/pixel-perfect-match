import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody } from "@/components/Card";
import { Button } from "@/components/Button";
import { deleteActionItem, fetchActionItems, setActionItemCompleted } from "@/lib/supabase";
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
  const { data: items, isLoading } = useQuery({
    queryKey: ACTION_ITEMS_KEY,
    queryFn: fetchActionItems,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      setActionItemCompleted(id, completed),
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

  if (isLoading || !items) {
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
          <CardBody className="flex flex-col items-center py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">No actions yet.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Add findings to your action plan from the Findings page to start building your
              remediation checklist.
            </p>
            <Link to="/app/findings" className="mt-6">
              <Button>Go to Findings</Button>
            </Link>
          </CardBody>
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
        <CardBody>
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
        </CardBody>
      </Card>

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const sectionItems = items.filter((it) => section.priorities.includes(it.priority));
          if (sectionItems.length === 0) return null;
          return (
            <section key={section.name}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section.name}
              </h2>
              <Card className="p-0">
                <div className="divide-y divide-border">
                  {sectionItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) =>
                          toggleMutation.mutate({ id: item.id, completed: e.target.checked })
                        }
                        className="h-4 w-4 shrink-0 accent-primary"
                        aria-label={`Mark "${item.title}" as completed`}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.title}
                      </span>
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
