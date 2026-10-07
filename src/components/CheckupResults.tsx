import type { ReactNode } from "react";

export type ResultKey = "found" | "unsure" | "good" | "skipped";

export const RESULT_GROUPS: { key: ResultKey; label: string; anchor: string }[] = [
  { key: "found", label: "🔴 Needs attention", anchor: "needs-attention" },
  { key: "unsure", label: "🟡 Worth reviewing", anchor: "worth-reviewing" },
  { key: "good", label: "🟢 Looks good", anchor: "looks-good" },
  { key: "skipped", label: "⚪ Not checked", anchor: "not-checked" },
];

const RESULT_TONES: Record<ResultKey, string> = {
  found: "text-danger",
  unsure: "text-warning",
  good: "text-success",
  skipped: "text-muted-foreground",
};

/** Compact, non-interactive counts shown at the top of a checkup results page. */
export function ResultsSummary({ counts }: { counts: Record<ResultKey, number> }) {
  const groups = RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0);
  return (
    <div role="group" aria-label="Results summary" className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-card border border-border/70 bg-card px-3 py-2.5 sm:gap-x-7 sm:px-4">
      {groups.map((g) => (
        <div key={g.key} className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-muted-foreground">{g.label}</span>
          <span className={`font-semibold tabular-nums ${RESULT_TONES[g.key]}`}>{counts[g.key]}</span>
        </div>
      ))}
    </div>
  );
}

export function ResultSection({ anchor, title, children }: { anchor: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={anchor} className="mt-8 scroll-mt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
