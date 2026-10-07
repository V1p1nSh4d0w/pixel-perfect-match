import type { ReactNode } from "react";

export type ResultKey = "found" | "unsure" | "good" | "skipped";

export const RESULT_GROUPS: { key: ResultKey; label: string; anchor: string }[] = [
  { key: "found", label: "🔴 Needs attention", anchor: "needs-attention" },
  { key: "unsure", label: "🟡 Worth reviewing", anchor: "worth-reviewing" },
  { key: "good", label: "🟢 Looks good", anchor: "looks-good" },
  { key: "skipped", label: "⚪ Not checked", anchor: "not-checked" },
];

/** Compact, read-only counts shown at the top of a checkup results page. */
export function ResultsSummary({ counts }: { counts: Record<ResultKey, number> }) {
  const groups = RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0);
  return (
    <div aria-label="Results summary" className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4">
      {groups.map((g) => (
        <div
          key={g.key}
          className="rounded-card border border-border bg-card px-2.5 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm"
        >
          <span className="block leading-snug text-muted-foreground">{g.label}</span>
          <span className="mt-0.5 block text-xl font-semibold sm:mt-1 sm:text-2xl">{counts[g.key]}</span>
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
