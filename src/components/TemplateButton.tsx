import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { UpgradeButton } from "@/components/UpgradeButton";
import { PremiumRequestButton } from "@/components/PremiumRequestButton";
import { getTemplateDownloadUrl } from "@/lib/templates.functions";
import { trackEvent } from "@/lib/supabase";

export function TemplateButton({ templateId, findingId }: { templateId: string; findingId: string }) {
  const download = useServerFn(getTemplateDownloadUrl);
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState<{ title: string; preview: string } | null>(null);

  async function onClick() {
    setBusy(true);
    try {
      await trackEvent("template_button_clicked", templateId, { finding_id: findingId }).catch(() => {});
      const res = await download({ data: { templateId, findingId } });
      if (!res.ok) { setLocked({ title: res.title, preview: res.preview }); return; }
      window.location.assign(res.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open the template.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={onClick} loading={busy}>Get the template</Button>
      {locked && (
        <div role="dialog" aria-modal="true" aria-label={locked.title} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setLocked(null)}>
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">Preview</p>
            <h2 className="type-card-title mt-1">{locked.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{locked.preview}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <UpgradeButton>Unlock the Starter Kit — ₹499</UpgradeButton>
              <PremiumRequestButton />
            </div>
            <Button variant="ghost" className="mt-2" onClick={() => setLocked(null)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}
