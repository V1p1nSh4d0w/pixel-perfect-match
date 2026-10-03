import { useCallback, useEffect, useMemo, useState } from "react";
import { GuidedCheckFlow, answerLabelFor, type GuidedAnswer } from "@/components/GuidedCheckFlow";
import { loadOnboarding } from "@/lib/business-onboarding";
import { accessChecksFor } from "@/lib/business-access-checks";
import { findingsFromCheckup } from "@/lib/finding-definitions";

/** Findings from the latest Accounts & Access checkup in this tab (replaced each time, never duplicated). */
export const ACCESS_FINDINGS_KEY = "securecheck-business-access-findings";

export function BusinessAccessFlow({ mode }: { mode: "quick" | "deep" }) {
  const [teamSize, setTeamSize] = useState<string | null>(null);
  useEffect(() => setTeamSize(loadOnboarding().teamSize), []);
  const checks = useMemo(() => (teamSize === null ? [] : accessChecksFor(teamSize, mode)), [teamSize, mode]);
  const onResults = useCallback((answers: Record<string, GuidedAnswer>) => {
    const findings = findingsFromCheckup(checks, answers, (id, a) =>
      answerLabelFor(checks.find((c) => c.id === id)?.style, a as GuidedAnswer));
    try { sessionStorage.setItem(ACCESS_FINDINGS_KEY, JSON.stringify(findings)); } catch { /* storage unavailable */ }
  }, [checks]);
  if (teamSize === null) return null;
  const label = mode === "quick" ? "Quick Check" : "Deep Check";
  return (
    <GuidedCheckFlow
      checks={checks}
      onResults={onResults}
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
