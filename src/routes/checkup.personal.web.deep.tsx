import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { WEB_PRIVACY_CHECKS } from "@/lib/online-checks";

const TITLE = "Web & Privacy Check (Deep) | SecureCheck";
const DESC = "A guided self-check of your browser security, privacy, tracking and website safety habits.";

export const Route = createFileRoute("/checkup/personal/web/deep")({
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
  const checks = WEB_PRIVACY_CHECKS;
  return (
    <CheckupShell back personal>
      <GuidedCheckFlow
        checks={checks}
        sectionLabel="Web & Privacy"
        flowName="🌐 Web & Privacy · Deep Check"
        intro="We'll guide you through your browser, privacy settings and website safety habits. You'll check each one and tell us what you find. We never ask for passwords, codes, tokens or any other secrets — don't paste them anywhere in this checkup."
        resultsTitle="Your Web & Privacy results"
        deviceNoun="browser or device"
      />
    </CheckupShell>
  );
}
