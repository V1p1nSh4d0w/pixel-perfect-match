import type { ReactNode } from "react";

export type ResultKey = "found" | "unsure" | "good" | "skipped";

export const RESULT_GROUPS: { key: ResultKey; label: string; anchor: string }[] = [
  { key: "found", label: "🔴 Needs attention", anchor: "needs-attention" },
  { key: "unsure", label: "🟡 Worth reviewing", anchor: "worth-reviewing" },
  { key: "good", label: "🟢 Looks good", anchor: "looks-good" },
  { key: "skipped", label: "⚪ Not checked", anchor: "not-checked" },
];

/** Clickable counts shown at the very top of a checkup results page. */
export function ResultsSummary({ counts }: { counts: Record<ResultKey, number> }) {
  const groups = RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0);
  return (
    <nav aria-label="Results summary" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {groups.map((g) => (
        <a
          key={g.key}
          href={`#${g.anchor}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(g.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="rounded-card border border-border bg-card px-3 py-3 text-sm transition-colors hover:border-primary"
        >
          <span className="block text-muted-foreground">{g.label}</span>
          <span className="mt-1 block text-2xl font-semibold">{counts[g.key]}</span>
        </a>
      ))}
    </nav>
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
