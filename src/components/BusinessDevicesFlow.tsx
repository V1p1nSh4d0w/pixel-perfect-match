import { useEffect, useState } from "react";
import { GuidedCheckFlow } from "@/components/GuidedCheckFlow";
import { loadOnboarding } from "@/lib/business-onboarding";
import { deviceChecksFor } from "@/lib/business-device-checks";

export function BusinessDevicesFlow({ mode }: { mode: "quick" | "deep" }) {
  const [teamSize, setTeamSize] = useState<string | null>(null);
  useEffect(() => setTeamSize(loadOnboarding().teamSize), []);
  if (teamSize === null) return null;
  const label = mode === "quick" ? "Quick Check" : "Deep Check";
  const devices = teamSize === "Just me" ? "your computer and devices" : "your business computers and devices";
  return (
    <GuidedCheckFlow
      checks={deviceChecksFor(teamSize, mode)}
      sectionLabel="Devices & Software"
      flowName={`💻 Devices & Software · ${label}`}
      intro={`We'll guide you through how ${devices} are protected.${teamSize ? ` Questions are tailored to a team size of "${teamSize}".` : ""} You check each setting on the device and tell us what you find — this website can't see your devices. Never upload screenshots or files, or enter passwords, recovery keys or other secrets here.`}
      resultsTitle="Your Devices & Software results"
      deviceNoun="devices"
      whatLabel="What to check"
      whereLabel="How to review it"
      backTo="/checkup/business/start"
      backLabel="Back to Business Security"
    />
  );
}
