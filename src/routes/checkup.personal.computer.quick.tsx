import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { WINDOWS_CHECKS, windowsQuickChecks } from "@/lib/windows-checks";

const TITLE = "Windows Computer Security Check (Quick) | SecureCheck";
const DESC = "A guided self-check of the security settings on your Windows PC.";

export const Route = createFileRoute("/checkup/personal/computer/quick")({
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
  void WINDOWS_CHECKS; void windowsQuickChecks;
  return (
    <CheckupShell back personal>
      <GuidedCheckFlow
        checks={windowsQuickChecks()}
        flowName="💻 Computer Security · Quick Check"
        intro="We'll guide you through a few security settings on your Windows PC. You will check each setting and tell us what you find."
        resultsTitle="Your Computer Security Checkup results"
        deviceNoun="computer"
      />
    </CheckupShell>
  );
}
