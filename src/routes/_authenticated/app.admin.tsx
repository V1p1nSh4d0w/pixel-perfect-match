import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { useProfile } from "@/hooks/useProfile";
import { adminFetchPaidUsers, isAdmin } from "@/lib/supabase";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { usePremiumEnabled } from "@/hooks/useSubscription";
import { setPremiumEnabled } from "@/lib/admin.functions";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => ({ meta: [
    { title: "Admin — SecureCheck" },
    { name: "description", content: "SecureCheck account administration." },
    { property: "og:title", content: "Admin — SecureCheck" },
    { property: "og:description", content: "SecureCheck account administration." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AdminPage,
});

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function AdminPage() {
  const { data: me } = useProfile();
  const userId = me?.userId;
  const admin = useQuery({ queryKey: ["is-admin", userId], queryFn: () => userId ? isAdmin(userId) : false, enabled: Boolean(userId) });
  const enabled = admin.data === true;
  const { premiumEnabled } = usePremiumEnabled();
  const qc = useQueryClient();
  const setFlag = useServerFn(setPremiumEnabled);
  const toggle = useMutation({
    mutationFn: (v: boolean) => setFlag({ data: { enabled: v } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["premium-enabled"] }); qc.invalidateQueries({ queryKey: ["subscription"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });
  const users = useQuery({ queryKey: ["admin-paid-users"], queryFn: adminFetchPaidUsers, enabled });

  if (admin.isLoading || !me) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!enabled) return <p className="text-sm text-muted-foreground">You don't have access to this page.</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" description="Review paid-access customers." />
      <Card>
        <CardTitle>Premium features</CardTitle>
        <div className="mt-3 flex items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground">{premiumEnabled ? "On — paid-candidate features are gated and the Starter Kit is offered." : "Off — free beta. Everything is free and checkout is hidden."}</p>
          <Switch
            checked={premiumEnabled}
            onCheckedChange={(checked) => toggle.mutate(checked)}
            aria-label="premium_enabled"
            disabled={toggle.isPending}
          />
        </div>
        <Link to="/admin/analytics" className="mt-4 inline-block text-sm text-primary hover:underline">View analytics →</Link>
      </Card>
      <Card>
        <CardTitle>Paid-access customers</CardTitle>
        <div className="mt-4 divide-y divide-border text-sm">
          {(users.data ?? []).length === 0 ? <p className="text-muted-foreground">No paid customers yet.</p> : null}
          {(users.data ?? []).map((u) => {
            return (
              <div key={u.user_id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-foreground">{u.profile?.business_name || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.profile?.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{u.plan === "starter" ? "Starter Kit" : `Legacy access${u.current_period_end ? ` until ${fmt(u.current_period_end)}` : ""}`}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
