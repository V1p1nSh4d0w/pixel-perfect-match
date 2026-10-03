import { createFileRoute } from "@tanstack/react-router";
import { CheckupShell } from "@/components/CheckupShell";
import { AndroidCheckFlow } from "@/components/AndroidCheckFlow";
import { ANDROID_CHECKS, quickChecks } from "@/lib/android-checks";

const TITLE = "Android Phone Security Check (Deep) | SecureCheck";
const DESC = "A guided self-check of the security settings on your Android phone.";

export const Route = createFileRoute("/checkup/personal/deep")({
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
  void ANDROID_CHECKS; void quickChecks;
  return (
    <CheckupShell back>
      <AndroidCheckFlow mode="Deep" checks={ANDROID_CHECKS} />
    </CheckupShell>
  );
}
