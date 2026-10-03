import { useEffect, useState } from "react";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { loadOnboarding } from "@/lib/business-onboarding";
import { onlineChecksFor } from "@/lib/business-online-checks";

export function BusinessOnlineFlow({ mode }: { mode: "quick" | "deep" }) {
  const [teamSize, setTeamSize] = useState<string | null>(null);
  useEffect(() => setTeamSize(loadOnboarding().teamSize), []);
  if (teamSize === null) return null;
  const label = mode === "quick" ? "Quick Check" : "Deep Check";
  return (
    <GuidedCheckFlow
      checks={onlineChecksFor(teamSize, mode)}
      sectionLabel="Email, Website & Online"
      flowName={`📧 Email, Website & Online Presence · ${label}`}
      intro={`We'll guide you through the security of your business email, domain, website and social accounts.${teamSize ? ` Questions are tailored to a team size of "${teamSize}".` : ""} You review each setting in your own accounts and tell us what you find — this website doesn't scan or verify your domain, DNS, email or website. Never enter passwords, codes, keys or email headers here.`}
      resultsTitle="Your Email, Website & Online Presence results"
      deviceNoun="accounts, domain or website"
      whatLabel="What to check"
      whereLabel="How to review it"
      backTo="/checkup/business/start"
      backLabel="Back to Business Security"
    />
  );
}
