import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { BusinessDataFlow } from "@/components/BusinessDataFlow";

const TITLE = "Business Data & Backups Check (Deep) | SecureCheck";
const DESC = "A guided self-check of how your business protects important data and whether it can be recovered from backups.";

export const Route = createFileRoute("/checkup/business/data/deep")({
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
      <BusinessDataFlow mode="deep" />
    </CheckupShell>
  );
}
