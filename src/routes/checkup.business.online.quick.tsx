import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { BusinessOnlineFlow } from "@/components/BusinessOnlineFlow";

const TITLE = "Business Email, Website & Online Presence Check (Quick) | SecureCheck";
const DESC = "A guided self-check of the security of your business email, domain, website and social-media accounts.";

export const Route = createFileRoute("/checkup/business/online/quick")({
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
      <BusinessOnlineFlow mode="quick" />
    </CheckupShell>
  );
}
