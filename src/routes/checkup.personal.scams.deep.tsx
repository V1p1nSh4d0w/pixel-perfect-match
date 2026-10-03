import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { SCAM_CHECKS } from "@/lib/scam-checks";

const TITLE = "Scam & Phishing Check (Deep) | SecureCheck";
const DESC = "A guided self-check that teaches you to spot scam and phishing warning signs and verify links, messages and requests safely.";

export const Route = createFileRoute("/checkup/personal/scams/deep")({
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
  const checks = SCAM_CHECKS;
  return (
    <CheckupShell back personal>
      <GuidedCheckFlow
        checks={checks}
        sectionLabel="Scam & Phishing"
        flowName="🚨 Scam & Phishing Protection · Deep Check"
        intro="We'll walk you through common warning signs of scams and phishing. This website can't tell whether a specific message, link, website or QR code is malicious — it teaches you what to look for and how to verify safely. Think about messages, emails and websites you've seen recently. We never ask for passwords, codes, tokens or files."
        resultsTitle="Your Scam & Phishing results"
        deviceNoun="habits"
        whatLabel="What to look for"
        whereLabel="How to verify it safely"
      />
    </CheckupShell>
  );
}
