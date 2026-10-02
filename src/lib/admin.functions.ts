import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const EVENTS = ["template_button_clicked", "template_downloaded", "domain_check_run", "report_shared", "help_requested", "premium_requested"] as const;

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
}

/** Event counts per name. Admin role checked server-side; RLS also limits reads to admins. */
export const getEventCounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ range: z.enum(["today", "7d", "30d", "all"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let since: string | null = null;
    const now = new Date();
    if (data.range === "today") since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    if (data.range === "7d") since = new Date(now.getTime() - 7 * 864e5).toISOString();
    if (data.range === "30d") since = new Date(now.getTime() - 30 * 864e5).toISOString();
    const rows = await Promise.all(EVENTS.map(async (name) => {
      let q = context.supabase.from("events").select("id", { count: "exact", head: true }).eq("event_name", name);
      if (since) q = q.gte("created_at", since);
      const { count, error } = await q;
      if (error) throw new Error("Could not load events.");
      return { event: name, count: count ?? 0 };
    }));
    return rows;
  });

export const setPremiumEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("feature_flags").update({ enabled: data.enabled }).eq("key", "premium_enabled");
    if (error) throw new Error("Could not update the setting.");
    return { enabled: data.enabled };
  });
