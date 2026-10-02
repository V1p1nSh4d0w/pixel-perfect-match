import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";

/** Demand signal only — records premium_requested. No payment or entitlement logic. */
export function PremiumRequestButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setBusy(true);
    try {
      await trackEvent("premium_requested", null, { email_consent: consent });
      setSent(true);
    } catch {
      toast.error("Could not send your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function close() { setOpen(false); setSent(false); setConsent(false); }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "text-xs text-muted-foreground hover:text-primary hover:underline"}>
        Request premium access
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Request premium access" className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={close}>
          <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <>
                <p className="text-sm text-foreground">Thanks. We'll let you know when new features are available.</p>
                <Button variant="secondary" className="mt-4" onClick={close}>Close</Button>
              </>
            ) : (
              <>
                <h2 className="type-card-title">Interested in advanced features? Let us know.</h2>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-sm text-muted-foreground">
                  You can email me about new features
                  <Switch checked={consent} onCheckedChange={setConsent} />
                </label>
                <div className="mt-5 flex gap-2">
                  <Button onClick={send} loading={busy}>Send</Button>
                  <Button variant="ghost" onClick={close}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
