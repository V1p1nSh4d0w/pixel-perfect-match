import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently deletes the signed-in user's data and auth account. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const table of ["action_items", "findings", "assessments", "subscriptions", "quarterly_calls", "user_roles", "profiles"] as const) {
      const col = table === "profiles" ? "id" : "user_id";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabaseAdmin.from(table) as any).delete().eq(col, userId);
      if (error) throw new Error(`Could not delete account data (${table})`);
    }
    // Keep paid audit records for accounting, but detach them from the account.
    await supabaseAdmin.from("audits").update({ user_id: null }).eq("user_id", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("Could not delete account");
    return { ok: true };
  });
