import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { ACCOUNT_CHECKS } from "@/lib/online-checks";

const TITLE = "Account Security Check (Deep) | SecureCheck";
const DESC = "A guided self-check of your online accounts: MFA, passwords, recovery, sessions and connected apps.";

export const Route = createFileRoute("/checkup/personal/accounts/deep")({
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
  const checks = ACCOUNT_CHECKS;
  return (
    <CheckupShell back personal>
      <GuidedCheckFlow
        checks={checks}
        sectionLabel="Account Security"
        flowName="🔐 Account Security · Deep Check"
        intro="We'll guide you through the security settings of your online accounts. You'll check each one and tell us what you find. We never ask for passwords, codes, tokens or any other secrets — don't paste them anywhere in this checkup."
        resultsTitle="Your Account Security results"
        deviceNoun="accounts"
      />
    </CheckupShell>
  );
}
