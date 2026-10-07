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
  const groups = RESULT_GROUPS.filter((g) => g.key !== "skipped");
  return (
    <div role="group" aria-label="Results summary" className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-4">
      {groups.map((g) => (
        <div key={g.key} className="min-w-0">
          <span className="block text-[10px] leading-tight text-muted-foreground sm:text-sm">{g.label}</span>
          <span className="mt-0.5 block text-lg font-semibold sm:mt-1 sm:text-2xl">{counts[g.key]}</span>
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
