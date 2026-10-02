import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRemediationPlaybooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: paid, error } = await context.supabase.rpc("has_paid_access", { _user_id: context.userId });
    if (error) throw new Error("Could not verify paid access.");
    const { PLAYBOOKS } = await import("@/lib/playbooks.server");
    return {
      hasFullAccess: Boolean(paid),
      totalSteps: Object.fromEntries(Object.entries(PLAYBOOKS).map(([t, steps]) => [t, steps.length])),
      playbooks: Object.fromEntries(Object.entries(PLAYBOOKS).map(([title, steps]) => [title, paid ? steps : steps.slice(0, 2)])),
    };
  });
