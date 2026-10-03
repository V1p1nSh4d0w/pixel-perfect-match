import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { ONLINE_CHECKS, onlineQuickChecks } from "@/lib/online-checks";

const TITLE = "Online Account, Web & Privacy Check (Quick) | SecureCheck";
const DESC = "A guided self-check of your online accounts, browser, privacy settings and website safety habits.";

export const Route = createFileRoute("/checkup/personal/online/quick")({
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
  void ONLINE_CHECKS; void onlineQuickChecks;
  return (
    <CheckupShell back>
      <GuidedCheckFlow
        checks={onlineQuickChecks()}
        flowName="Online Account, Web & Privacy Check · Quick Check"
        intro="We'll guide you through your online accounts, browser and privacy settings. You'll check each one and tell us what you find. We never ask for passwords, codes, tokens or any other secrets — don't paste them anywhere in this checkup."
        resultsTitle="Your Online Account, Web & Privacy results"
        deviceNoun="accounts, browser or device"
      />
    </CheckupShell>
  );
}
