import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { BusinessAccessFlow } from "@/components/BusinessAccessFlow";

const TITLE = "Business Accounts & Access Check (Deep) | SecureCheck";
const DESC = "A detailed guided self-check of who can access your business accounts, what they can do, and how access is managed.";

export const Route = createFileRoute("/checkup/business/accounts/deep")({
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
      <BusinessAccessFlow mode="deep" />
    </CheckupShell>
  );
}
