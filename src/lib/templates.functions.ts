import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STARTER_KIT_PRICE_PAISE = 49900;

/** Client-safe finding-title → template-name map (names only, no content). */
export const TEMPLATE_FOR_FINDING: Record<string, string> = {
  "No written security policy": "Security Policy Template",
  "MFA is not enabled for all important accounts": "MFA Rollout Guide",
  "Important data is not reliably backed up": "Backup & Restore Checklist",
  "Backups have not been tested": "Backup & Restore Checklist",
};

const input = z.object({ findingId: z.string().uuid() });

async function loadFindingTemplate(supabase: any, findingId: string) {
  // RLS ensures the finding belongs to the caller.
  const { data: finding } = await supabase.from("findings").select("id, title").eq("id", findingId).maybeSingle();
  if (!finding) throw new Error("Finding not found.");
  const { FINDING_TEMPLATE, TEMPLATES } = await import("@/lib/templates.server");
  const key = FINDING_TEMPLATE[finding.title as string];
  if (!key) throw new Error("No template for this finding.");
  return TEMPLATES[key]!;
}

async function logEvent(row: { user_id: string; event: string; template_name: string; finding_id: string; price_paise?: number }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("template_events").insert(row);
}

/** Records the click and returns either a preview (free) or a flag to download (paid). */
export const openTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }) => {
    const def = await loadFindingTemplate(context.supabase, data.findingId);
    await logEvent({ user_id: context.userId, event: "template_button_clicked", template_name: def.name, finding_id: data.findingId });
    const { data: paid, error } = await context.supabase.rpc("has_paid_access", { _user_id: context.userId });
    if (error) throw new Error("Could not verify access.");
    if (paid) return { paid: true as const, name: def.name };
    const { templatePreview } = await import("@/lib/templates.server");
    return { paid: false as const, preview: templatePreview(def) };
  });

export const trackUnlockClicked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }) => {
    const def = await loadFindingTemplate(context.supabase, data.findingId);
    await logEvent({ user_id: context.userId, event: "unlock_clicked", template_name: def.name, finding_id: data.findingId, price_paise: STARTER_KIT_PRICE_PAISE });
    return { ok: true };
  });

/** Issues a 60-second signed URL only after a database-verified Starter Kit entitlement. */
export const getTemplateDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }) => {
    const def = await loadFindingTemplate(context.supabase, data.findingId);
    const { data: paid, error } = await context.supabase.rpc("has_paid_access", { _user_id: context.userId });
    if (error || !paid) throw new Error("Starter Kit required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("templates")
      .createSignedUrl(def.file, 60, { download: def.file });
    if (signError || !signed) throw new Error("Template is not available yet.");
    await logEvent({ user_id: context.userId, event: "template_downloaded", template_name: def.name, finding_id: data.findingId });
    return { url: signed.signedUrl };
  });
