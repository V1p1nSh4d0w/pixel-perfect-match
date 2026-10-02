import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { getEventCounts } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [
    { title: "Analytics — SecureCheck Admin" },
    { name: "description", content: "Demand-tracking event counts for SecureCheck admins." },
    { property: "og:title", content: "Analytics — SecureCheck Admin" },
    { property: "og:description", content: "Demand-tracking event counts for SecureCheck admins." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AnalyticsPage,
});

const LABELS: Record<string, string> = {
  template_button_clicked: "Template button clicks",
  template_downloaded: "Template downloads",
  domain_check_run: "Domain checks",
  report_shared: "Reports shared",
  help_requested: "Help requests",
  premium_requested: "Premium requests",
};
const RANGES = [["today", "Today"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["all", "All time"]] as const;

function AnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("all");
  const fetchCounts = useServerFn(getEventCounts);
  const q = useQuery({ queryKey: ["admin-event-counts", range], queryFn: () => fetchCounts({ data: { range } }), retry: false });

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/app/admin" className="text-sm text-muted-foreground hover:text-foreground">← Back to admin</Link>
        <PageHeader title="Analytics" description="Counts come directly from recorded events." />
        <div className="flex flex-wrap gap-2">
          {RANGES.map(([v, l]) => (
            <button key={v} type="button" onClick={() => setRange(v)}
              className={`rounded-button border px-3 py-1.5 text-sm ${range === v ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>
        <Card>
          {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
            : q.isError ? <p className="text-sm text-muted-foreground">You don't have access to this page.</p>
            : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-2 font-medium">Event</th><th className="pb-2 text-right font-medium">Count</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {(q.data ?? []).map((r) => (
                    <tr key={r.event}><td className="py-3 text-foreground">{LABELS[r.event] ?? r.event}</td><td className="py-3 text-right font-semibold tabular-nums">{r.count}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
        </Card>
      </div>
    </div>
  );
}
