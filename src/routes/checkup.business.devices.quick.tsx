import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { BusinessDevicesFlow } from "@/components/BusinessDevicesFlow";

const TITLE = "Business Devices & Software Check (Quick) | SecureCheck";
const DESC = "A guided self-check of security protection, firewall, encryption, admin rights, remote access and software on your business devices.";

export const Route = createFileRoute("/checkup/business/devices/quick")({
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
      <BusinessDevicesFlow mode="quick" />
    </CheckupShell>
  );
}
