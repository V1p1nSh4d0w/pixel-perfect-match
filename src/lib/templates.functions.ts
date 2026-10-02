import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Client-safe finding-title → linked_finding_key map. Templates themselves live in the database. */
export const FINDING_KEY_FOR_TITLE: Record<string, string> = {
  "No written security policy": "no_written_security_policy",
  "MFA is not enabled for all important accounts": "mfa_not_enabled",
  "Backups have not been tested": "backups_not_tested",
};

const input = z.object({ templateId: z.string().uuid(), findingId: z.string().uuid().optional() });

/**
 * Issues a 60-second signed URL. Server checks: signed in, template published (RLS),
 * and — only when premium_enabled is on — a database-verified entitlement.
 */
export const getTemplateDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }) => {
    const { data: tpl } = await context.supabase
      .from("templates").select("id, title, file_path, preview_text, published")
      .eq("id", data.templateId).eq("published", true).maybeSingle();
    if (!tpl) throw new Error("Template not found.");
    const { data: allowed, error } = await context.supabase.rpc("has_feature_access", { _user_id: context.userId });
    if (error) throw new Error("Could not verify access.");
    if (!allowed) return { ok: false as const, title: tpl.title, preview: tpl.preview_text ?? "" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("templates")
      .createSignedUrl(tpl.file_path, 60, { download: tpl.file_path });
    if (signError || !signed) throw new Error("Template is not available yet.");
    await context.supabase.from("events").insert({
      user_id: context.userId, event_name: "template_downloaded", object_id: tpl.id,
      metadata: data.findingId ? { finding_id: data.findingId } : null,
    });
    return { ok: true as const, url: signed.signedUrl };
  });
