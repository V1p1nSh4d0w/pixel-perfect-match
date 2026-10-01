import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { useProfile } from "@/hooks/useProfile";
import { quarterStart } from "@/lib/config";
import { adminFetchAudits, adminFetchProUsers, adminMarkCall, adminRemoveCall, fetchCallsSince, isAdmin } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => ({ meta: [{ title: "Admin — SecureCheck" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function AdminPage() {
  const { data: me } = useProfile();
  const qc = useQueryClient();
  const admin = useQuery({ queryKey: ["is-admin", me?.userId], queryFn: () => isAdmin(me!.userId), enabled: Boolean(me?.userId) });
  const enabled = admin.data === true;
  const users = useQuery({ queryKey: ["admin-pro-users"], queryFn: adminFetchProUsers, enabled });
  const calls = useQuery({ queryKey: ["admin-calls"], queryFn: () => fetchCallsSince(quarterStart()), enabled });
  const audits = useQuery({ queryKey: ["admin-audits"], queryFn: adminFetchAudits, enabled });
  const mark = useMutation({
    mutationFn: adminMarkCall,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-calls"] }); toast.success("Call recorded."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const undo = useMutation({
    mutationFn: adminRemoveCall,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-calls"] }),
  });

  if (admin.isLoading || !me) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!enabled) return <p className="text-sm text-muted-foreground">You don't have access to this page.</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" description="Record quarterly calls and see audit purchases." />
      <Card>
        <CardTitle>Pro customers — calls this quarter</CardTitle>
        <div className="mt-4 divide-y divide-border text-sm">
          {(users.data ?? []).length === 0 ? <p className="text-muted-foreground">No Pro customers yet.</p> : null}
          {(users.data ?? []).map((u) => {
            const call = calls.data?.find((c) => c.user_id === u.user_id);
            return (
              <div key={u.user_id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-foreground">{u.profile?.business_name || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.profile?.email}</p>
                </div>
                {call ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-success">Call held {fmt(call.held_at)}</span>
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => undo.mutate(call.id)}>Undo</button>
                  </div>
                ) : (
                  <Button variant="secondary" loading={mark.isPending && mark.variables === u.user_id} onClick={() => mark.mutate(u.user_id)}>Mark call held</Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <CardTitle>Audit purchases</CardTitle>
        <div className="mt-4 divide-y divide-border text-sm">
          {(audits.data ?? []).length === 0 ? <p className="text-muted-foreground">No audits yet.</p> : null}
          {(audits.data ?? []).map((a) => (
            <div key={a.id} className="flex justify-between py-3">
              <span className="text-foreground">{a.email}</span>
              <span className="text-muted-foreground">{a.paid_at ? fmt(a.paid_at) : ""}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
