import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { UpgradeButton } from "@/components/UpgradeButton";
import { getTemplateDownloadUrl, openTemplate, trackUnlockClicked } from "@/lib/templates.functions";

type Preview = { name: string; sections: { heading: string; body: string[] }[]; totalSections: number };

export function TemplateButton({ findingId }: { findingId: string }) {
  const open = useServerFn(openTemplate);
  const download = useServerFn(getTemplateDownloadUrl);
  const trackUnlock = useServerFn(trackUnlockClicked);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);

  async function onClick() {
    setBusy(true);
    try {
      const res = await open({ data: { findingId } });
      if (!res.paid) { setPreview(res.preview); return; }
      const { url } = await download({ data: { findingId } });
      window.location.assign(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open the template.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={onClick} loading={busy}>Get the template</Button>
      {preview && (
        <div role="dialog" aria-modal="true" aria-label={`${preview.name} preview`} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">Preview</p>
            <h2 className="type-card-title mt-1">{preview.name}</h2>
            <div className="relative mt-4 space-y-4">
              {preview.sections.map((s) => (
                <section key={s.heading}>
                  <h3 className="text-sm font-semibold text-foreground">{s.heading}</h3>
                  {s.body.map((p) => <p key={p} className="mt-1 text-sm leading-relaxed text-muted-foreground">{p}</p>)}
                </section>
              ))}
            </div>
            <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              Showing {preview.sections.length} of {preview.totalSections} sections. The full PDF is included in the Starter Kit.
            </p>
            <div className="mt-4 flex flex-wrap gap-2" onClickCapture={() => { trackUnlock({ data: { findingId } }).catch(() => {}); }}>
              <UpgradeButton>Unlock the Starter Kit — ₹499</UpgradeButton>
            </div>
            <Button variant="ghost" className="mt-2" onClick={() => setPreview(null)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}
