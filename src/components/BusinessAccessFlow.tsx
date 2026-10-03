import { useEffect, useState } from "react";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { loadOnboarding } from "@/lib/business-onboarding";
import { accessChecksFor } from "@/lib/business-access-checks";

export function BusinessAccessFlow({ mode }: { mode: "quick" | "deep" }) {
  const [teamSize, setTeamSize] = useState<string | null>(null);
  useEffect(() => setTeamSize(loadOnboarding().teamSize), []);
  if (teamSize === null) return null;
  const label = mode === "quick" ? "Quick Check" : "Deep Check";
  return (
    <GuidedCheckFlow
      checks={accessChecksFor(teamSize, mode)}
      sectionLabel="Accounts & Access"
      flowName={`🔐 Accounts & Access · ${label}`}
      intro={`We'll guide you through who can sign in to your business accounts and what they can do.${teamSize ? ` Questions are tailored to a team size of "${teamSize}".` : ""} You review each setting in your own services and tell us what you find — this website can't see your accounts. Never enter passwords, codes, keys or tokens here.`}
      resultsTitle="Your Accounts & Access results"
      deviceNoun="business accounts"
      whatLabel="What to check"
      whereLabel="How to review it"
      backTo="/checkup/business/start"
      backLabel="Back to Business Security"
    />
  );
}
