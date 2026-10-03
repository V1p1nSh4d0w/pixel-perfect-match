import { useCallback, useEffect, useMemo, useState } from "react";
import { GuidedCheckFlow, answerLabelFor, type GuidedAnswer } from "@/components/GuidedCheckFlow";
import { loadOnboarding } from "@/lib/business-onboarding";
import { dataChecksFor } from "@/lib/business-data-checks";
import { findingsFromCheckup } from "@/lib/finding-definitions";

/** Findings from the latest Data & Backups checkup in this tab (replaced each time, never duplicated). */
export const DATA_FINDINGS_KEY = "securecheck-business-data-findings";

export function BusinessDataFlow({ mode }: { mode: "quick" | "deep" }) {
  const [teamSize, setTeamSize] = useState<string | null>(null);
  useEffect(() => setTeamSize(loadOnboarding().teamSize), []);
  const checks = useMemo(() => (teamSize === null ? [] : dataChecksFor(teamSize, mode)), [teamSize, mode]);
  const onResults = useCallback((answers: Record<string, GuidedAnswer>) => {
    const findings = findingsFromCheckup(checks, answers, (id, a) =>
      answerLabelFor(checks.find((c) => c.id === id)?.style, a as GuidedAnswer));
    try { sessionStorage.setItem(DATA_FINDINGS_KEY, JSON.stringify(findings)); } catch { /* storage unavailable */ }
  }, [checks]);
  if (teamSize === null) return null;
  const label = mode === "quick" ? "Quick Check" : "Deep Check";
  return (
    <GuidedCheckFlow
      checks={checks}
      onResults={onResults}
      sectionLabel="Data & Backups"
      flowName={`💾 Data & Backups · ${label}`}
      intro={`We'll guide you through how your important business data is protected and whether you could get it back if something went wrong.${teamSize ? ` Questions are tailored to a team size of "${teamSize}".` : ""} You review your own files and backups and tell us what you find — this website can't see them. Never upload documents or enter passwords, recovery codes or encryption keys here.`}
      resultsTitle="Your Data & Backups results"
      deviceNoun="files or backups"
      whatLabel="What to check"
      whereLabel="How to review it"
      backTo="/checkup/business/start"
      backLabel="Back to Business Security"
    />
  );
}
