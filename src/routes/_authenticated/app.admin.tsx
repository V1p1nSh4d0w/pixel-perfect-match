import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { useProfile } from "@/hooks/useProfile";
import { adminFetchPaidUsers, isAdmin } from "@/lib/supabase";

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
  const admin = useQuery({ queryKey: ["is-admin", me?.userId], queryFn: () => isAdmin(me!.userId), enabled: Boolean(me?.userId) });
  const enabled = admin.data === true;
  const users = useQuery({ queryKey: ["admin-paid-users"], queryFn: adminFetchPaidUsers, enabled });

  if (admin.isLoading || !me) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!enabled) return <p className="text-sm text-muted-foreground">You don't have access to this page.</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" description="Review paid-access customers." />
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
