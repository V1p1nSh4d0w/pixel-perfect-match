import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { DATA_CHECKS } from "@/lib/data-checks";

const TITLE = "Data Protection Check (Deep) | SecureCheck";
const DESC = "A guided self-check of your backups, recovery options, file sharing and device encryption.";

export const Route = createFileRoute("/checkup/personal/data/deep")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const checks = DATA_CHECKS;
  return (
    <CheckupShell back>
      <GuidedCheckFlow
        checks={checks}
        sectionLabel="Data Protection"
        flowName="💾 Data Protection · Deep Check"
        intro="We'll guide you through protecting your important data against loss, theft, accidental deletion and unwanted sharing. You review your own devices and accounts and tell us what you find. Never upload documents here, and never enter passwords, recovery codes or encryption keys."
        resultsTitle="Your Data Protection results"
        deviceNoun="devices or files"
        whereLabel="What to review"
      />
    </CheckupShell>
  );
}
