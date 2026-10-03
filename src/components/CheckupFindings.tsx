import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { RESULT_GROUPS, ResultSection, ResultsSummary, type ResultKey } from "@/components/CheckupResults";
import { scopeForPath, type SavedCheckupResult } from "@/lib/checkup-results";
import { getFindingDefinition } from "@/lib/finding-definitions";
import { getRemediationPlaybooks } from "@/lib/playbooks.functions";
import { fetchPublishedTemplates } from "@/lib/supabase";
import { TemplateButton } from "@/components/TemplateButton";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

export function CheckupFindings({ results, from }: { results: SavedCheckupResult[]; from?: string }) {
  const scopes = (["personal", "business"] as const).filter((s) => results.some((r) => r.scope === s));
  const initial = from ? scopeForPath(from) : scopes[0]!;
  const [scope, setScope] = useState<"personal" | "business">(scopes.includes(initial) ? initial : scopes[0]!);
  const shown = results.filter((r) => r.scope === scope);
  const all = shown.flatMap((r) => r.items.map((it) => ({
    ...it,
    checkup: r.checkup_name,
    path: r.checkup_path,
  })));

  const counts = { found: 0, unsure: 0, good: 0, skipped: 0 } as Record<ResultKey, number>;
  all.forEach((it) => { counts[it.status]++; });

  const fetchPlaybooks = useServerFn(getRemediationPlaybooks);
  const playbooksQuery = useQuery({
    queryKey: ["remediation-playbooks"],
    queryFn: () => fetchPlaybooks(),
  });

  const templatesQuery = useQuery({
    queryKey: ["published-templates"],
    queryFn: fetchPublishedTemplates,
  });

  return (
    <div>
      {from ? (
        <a href={`${from}?results=1`} className="mb-4 inline-block">
          <Button variant="secondary">← Back to Results</Button>
        </a>
      ) : null}

      <PageHeader
        title="Findings"
        description="From your latest Personal and Business checkups — based on what you told us, not a scan of your devices or accounts."
      />

      {scopes.length > 1 ? (
        <div role="tablist" className="mt-4 flex gap-2">
          {scopes.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={scope === s}
              onClick={() => setScope(s)}
              className={`rounded-button border px-3 py-1.5 text-sm ${
                scope === s
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
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
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nothing here.</p>
            ) : (
              <div className="mt-4 space-y-5">
                {items.map((it) => (
                  <CheckupFindingCard
                    key={`${it.path}-${it.id}`}
                    item={it}
                    playbooks={playbooksQuery.data?.playbooks ?? {}}
                    templates={templatesQuery.data ?? []}
                  />
                ))}
              </div>
            )}
          </ResultSection>
        );
      })}
    </div>
  );
}

function CheckupFindingCard({
  item,
  playbooks,
  templates,
}: {
  item: SavedCheckupResult["items"][number] & { checkup: string; path: string };
  playbooks: Record<string, { text: string; time: string; tool: string }[]>;
  templates: { id: string; linked_finding_key: string | null }[];
}) {
  const def = item.findingKey ? getFindingDefinition(item.findingKey) : undefined;
  const playbook = def?.playbook_title ? playbooks[def.playbook_title] : undefined;
  const template = def?.template_key
    ? templates.find((t) => t.linked_finding_key === def.template_key)
    : undefined;

  const [done, setDone] = useState<number[]>([]);

  const doneCount = useMemo(() => done.length, [done]);
  const isFinding = item.status === "found" || item.status === "unsure";

  if (!def || !isFinding) {
    return (
      <div className="rounded-card border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">{item.checkup} · {item.category}</p>
        <h3 className="mt-1 font-medium">{item.title}</h3>
        {item.answer ? (
          <p className="mt-2 text-xs text-muted-foreground">Your answer: {item.answer} (self-assessment)</p>
        ) : null}
        {item.status === "skipped" ? (
          <a href={`${item.path}?results=1`} className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
            Open this checkup
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <article className="rounded-card border border-border bg-card p-5">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {item.checkup} · {item.category}
        </p>
        <h3 className="text-lg font-semibold">{def.title}</h3>
      </div>

      <section className="mt-5">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Why it matters
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed">{def.why_it_matters}</p>
      </section>

      <section className="mt-5 rounded-card border border-border bg-surface p-4">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Evidence · Based on your checkup
        </h4>
        <p className="mt-2 font-medium">You answered: “{item.answer ?? "Not answered"}”</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Checkup question: “{item.title}”
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Source: Self-assessment</p>
      </section>

      <section className="mt-5">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Recommended fix
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed">{def.recommended_action}</p>
      </section>

      {playbook?.length ? (
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Remediation Playbook
            </h4>
            <span className="text-xs text-muted-foreground">
              {doneCount} of {playbook.length} steps done
            </span>
          </div>

          <div className="space-y-3">
            {playbook.map((step, index) => {
              const checked = done.includes(index);

              return (
                <label key={index} className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setDone((current) =>
                        checked
                          ? current.filter((x) => x !== index)
                          : [...current, index],
                      )
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <span className={checked ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                    <span className="font-medium">Step {index + 1}: </span>
                    {step.text}
                    <span className="block text-xs text-muted-foreground">
                      {step.time} · Use: {step.tool}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {template ? (
        <div className="mt-5">
          <TemplateButton templateId={template.id} findingId={item.findingKey ?? ""} />
        </div>
      ) : null}
    </article>
  );
}

export function CheckupFindingsEmpty() {
  return (
    <div>
      <PageHeader
        title="Findings"
        description="Findings appear here after you complete a Personal or Business checkup while signed in."
      />
      <a href="/app" className="mt-6 inline-block">
        <Button>Choose a checkup</Button>
      </a>
    </div>
  );
}
