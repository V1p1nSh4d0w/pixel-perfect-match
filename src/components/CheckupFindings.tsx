import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { RESULT_GROUPS, ResultSection, ResultsSummary, type ResultKey } from "@/components/CheckupResults";
import { scopeForPath, type SavedCheckupResult } from "@/lib/checkup-results";

/** Findings from the new Personal/Business checkups (never mixed with the old Assessment). */
export function CheckupFindings({ results, from }: { results: SavedCheckupResult[]; from?: string | undefined }) {
  const scopes = (["personal", "business"] as const).filter((s) => results.some((r) => r.scope === s));
  const initial = from ? scopeForPath(from) : scopes[0]!;
  const [scope, setScope] = useState<"personal" | "business">(scopes.includes(initial) ? initial : scopes[0]!);
  const shown = results.filter((r) => r.scope === scope);
  const all = shown.flatMap((r) => r.items.map((it) => ({ ...it, checkup: r.checkup_name, path: r.checkup_path })));
  const counts = { found: 0, unsure: 0, good: 0, skipped: 0 } as Record<ResultKey, number>;
  all.forEach((it) => { counts[it.status]++; });

  return (
    <div>
      {from ? (
        <a href={`${from}?results=1`} className="mb-4 inline-block"><Button variant="secondary">← Back to Results</Button></a>
      ) : null}
      <PageHeader title="Findings" description="From your latest Personal and Business checkups — based on what you told us, not a scan of your devices or accounts." />
      {scopes.length > 1 ? (
        <div role="tablist" className="mt-4 flex gap-2">
          {scopes.map((s) => (
            <button key={s} role="tab" aria-selected={scope === s} onClick={() => setScope(s)}
              className={`rounded-button border px-3 py-1.5 text-sm ${scope === s ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {s === "personal" ? "Personal Security" : "Business Security"}
            </button>
          ))}
        </div>
      ) : null}
      <ResultsSummary counts={counts} />
      {RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0).map((g) => {
        const items = all.filter((it) => it.status === g.key);
        return (
          <ResultSection key={g.key} anchor={g.anchor} title={`${g.label} (${items.length})`}>
            {items.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nothing here.</p> : (
              <ul className="mt-3 space-y-3">
                {items.map((it) => (
                  <li key={`${it.path}-${it.id}`} className="rounded-card border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{it.checkup} · {it.category}</p>
                    <p className="mt-1 font-medium">{it.title}</p>
                    {it.answer ? <p className="mt-1 text-xs text-muted-foreground">Your answer: {it.answer} (self-assessment)</p> : null}
                    {(g.key === "found" || g.key === "unsure") && it.review ? <p className="mt-2 text-sm">{it.review}</p> : null}
                    {g.key === "skipped" ? <a href={`${it.path}?results=1`} className="mt-2 inline-block text-sm font-medium text-primary hover:underline">Open this checkup</a> : null}
                  </li>
                ))}
              </ul>
            )}
          </ResultSection>
        );
      })}
    </div>
  );
}
