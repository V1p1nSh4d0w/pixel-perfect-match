import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { BusinessAccessFlow } from "@/components/BusinessAccessFlow";

const TITLE = "Business Accounts & Access Check (Quick) | SecureCheck";
const DESC = "A guided self-check of MFA, admin access, former staff access and connected apps on your business accounts.";

export const Route = createFileRoute("/checkup/business/accounts/quick")({
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
  return (
    <CheckupShell back business>
      <BusinessAccessFlow mode="quick" />
    </CheckupShell>
  );
}
