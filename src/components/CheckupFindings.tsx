import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { RESULT_GROUPS, ResultSection, ResultsSummary, type ResultKey } from "@/components/CheckupResults";
import { scopeForPath, type SavedCheckupResult } from "@/lib/checkup-results";
import { getFindingDefinitionForCheck, type FindingDefinition } from "@/lib/finding-definitions";
import { getRemediationPlaybooks } from "@/lib/playbooks.functions";
import { fetchPublishedTemplates } from "@/lib/supabase";
import { TemplateButton } from "@/components/TemplateButton";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

type FindingView = FindingDefinition & { source: "definition" | "checkup" };

const STATUS_LABELS: Record<ResultKey, string> = {
  found: "Needs attention",
  unsure: "Worth reviewing",
  good: "Looks good",
  skipped: "Not checked",
};

function progressKey(path: string, checkId: string) {
  return `securecheck-playbook:${path}:${checkId}`;
}

function loadProgress(path: string, checkId: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(progressKey(path, checkId));
    return raw ? JSON.parse(raw) as number[] : [];
  } catch {
    return [];
  }
}


function fallbackDefinition(item: SavedCheckupResult["items"][number]): FindingView {
  return {
    finding_key: item.findingKey ?? `check:${item.id}`,
    category: item.category,
    title: item.title,
    severity: "Medium",
    why_it_matters: item.why ?? "This is a self-assessment result worth reviewing based on what you told us.",
    recommended_action: item.review ?? "Review this check and decide whether any improvement is needed.",
    effort: "Low",
    source: "checkup",
  };
}

export function CheckupFindings({ results, from }: { results: SavedCheckupResult[]; from?: string }) {
  const scopes = (["personal", "business"] as const).filter((s) => results.some((r) => r.scope === s));
  const initial = from ? scopeForPath(from) : scopes[0]!;
  const [scope, setScope] = useState<"personal" | "business">(scopes.includes(initial) ? initial : scopes[0]!);
  const runs = results.filter((r) => r.scope === scope)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id.localeCompare(a.id))
    .slice(0, 4);
  const latest = runs[0];
  const history = runs.slice(1);
  const latestItems = (latest?.items ?? []).map((it) => ({ ...it, checkup: latest!.checkup_name, path: latest!.checkup_path }));

  const counts = { found: 0, unsure: 0, good: 0, skipped: 0 } as Record<ResultKey, number>;
  latestItems.forEach((it) => { counts[it.status]++; });

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
        description="Your checkup findings in one place. These are based on what you told us, not a technical scan of your devices or accounts."
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

      {latest ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-card border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">Latest</span>
            <span className="font-medium">{latest.checkup_name}</span>
            <span className="text-sm text-muted-foreground">· {formatRunDate(latest.created_at)}</span>
          </div>
          <ResultsSummary counts={counts} />
          <RunSections
            run={latest}
            items={latestItems}
            playbooks={playbooksQuery.data?.playbooks ?? {}}
            templates={templatesQuery.data ?? []}
            latest
          />
          {history.length > 0 ? (
            <details className="mt-10 rounded-card border border-border bg-card p-4">
              <summary className="cursor-pointer list-inside font-semibold">History <span className="font-normal text-muted-foreground">({history.length} previous checkups)</span></summary>
              <div className="mt-5 space-y-8">
                {history.map((run) => (
                  <section key={run.id} className="border-t border-border pt-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{run.checkup_name}</h2>
                      <span className="text-sm text-muted-foreground">· {formatRunDate(run.created_at)}</span>
                    </div>
                    <RunSections
                      run={run}
                      items={run.items.map((it) => ({ ...it, checkup: run.checkup_name, path: run.checkup_path }))}
                      playbooks={playbooksQuery.data?.playbooks ?? {}}
                      templates={templatesQuery.data ?? []}
                    />
                  </section>
                ))}
              </div>
            </details>
          ) : null}
        </>
      ) : <p className="mt-5 text-sm text-muted-foreground">No saved checkups for this area yet.</p>}
    </div>
  );
}

function formatRunDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function RunSections({
  run, items, playbooks, templates, latest = false,
}: {
  run: SavedCheckupResult;
  items: (SavedCheckupResult["items"][number] & { checkup: string; path: string })[];
  playbooks: Record<string, { text: string; time: string; tool: string }[]>;
  templates: { id: string; linked_finding_key: string | null }[];
  latest?: boolean;
}) {
  const counts = { found: 0, unsure: 0, good: 0, skipped: 0 } as Record<ResultKey, number>;
  items.forEach((it) => { counts[it.status]++; });
  return <>
    {RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0).map((g) => {
      const groupItems = items.filter((it) => it.status === g.key);
      return (
        <ResultSection key={`${run.id}-${g.key}`} anchor={latest ? g.anchor : `${run.id}-${g.anchor}`} title={`${g.label} (${groupItems.length})`}>
          {groupItems.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nothing here.</p>
          ) : (
            <div className="mt-4 space-y-5">
              {groupItems.map((it) => (
                <CheckupFindingCard
                  key={`${it.path}-${run.id}-${it.id}`}
                  item={it}
                  playbooks={playbooks}
                  templates={templates}
                />
              ))}
            </div>
          )}
        </ResultSection>
      );
    })}
  </>;
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
  const centralDef = getFindingDefinitionForCheck(item.findingKey, item.id, item.category);
  const def = centralDef
    ? { ...centralDef, source: "definition" as const }
    : fallbackDefinition(item);

  const status = item.status;
  const isFinding = status === "found" || status === "unsure";
  const curatedPlaybook = def.playbook_title ? playbooks[def.playbook_title] : undefined;
  const playbook = isFinding
    ? curatedPlaybook?.length
      ? curatedPlaybook
      : [
          {
            text: status === "unsure"
              ? `Check whether this setting or practice needs attention. ${item.where ? `Start here: ${item.where}` : "Use the checkup question as your guide."}`
              : `Open the relevant setting or account and confirm what needs attention. ${item.where ? `Start here: ${item.where}` : "Use the checkup question as your guide."}`,
            time: "~5 min",
            tool: item.where ?? item.category,
          },
          {
            text: def.recommended_action,
            time: "Varies",
            tool: "Recommended fix above",
          },
          {
            text: "Return to this check and confirm the change is in place. If you still can't verify it, keep this result as Worth reviewing.",
            time: "~2 min",
            tool: "This checkup",
          },
        ]
    : undefined;
  const template = def.template_key
    ? templates.find((t) => t.linked_finding_key === def.template_key)
    : undefined;

  const [done, setDone] = useState<number[]>(() => loadProgress(item.path, item.id));

  useEffect(() => {
    try {
      window.localStorage.setItem(progressKey(item.path, item.id), JSON.stringify(done));
    } catch {
      // Local persistence is best-effort.
    }
  }, [done, item.path, item.id]);

  const doneCount = useMemo(() => done.length, [done]);
  return (
    <article className="rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{item.checkup} · {item.category}</p>
          <h3 className="mt-1 text-lg font-semibold">{def.title}</h3>
        </div>
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium">
          {STATUS_LABELS[status]}
        </span>
      </div>

      <section className="mt-5">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Why it matters
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed">{def.why_it_matters}</p>
      </section>

      <section className="mt-5 rounded-card border border-border bg-surface p-4">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Evidence · Self-assessment
        </h4>
        <p className="mt-2 font-medium">You answered: “{item.answer ?? "Not answered"}”</p>
        <p className="mt-1 text-xs text-muted-foreground">Checkup question: “{item.title}”</p>
        <p className="mt-1 text-xs text-muted-foreground">We did not technically inspect your device, account or service.</p>
      </section>

      {isFinding ? (
        <section className="mt-5">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Recommended fix
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed">{def.recommended_action}</p>
        </section>
      ) : null}

      {playbook?.length ? (
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Remediation Playbook
            </h4>
            <span className="text-xs text-muted-foreground">{doneCount} of {playbook.length} steps done</span>
          </div>
          <div className="space-y-3">
            {playbook.map((step, index) => {
              const checked = done.includes(index);
              return (
                <label key={index} className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setDone((current) =>
                      checked ? current.filter((x) => x !== index) : [...current, index],
                    )}
                    className="mt-1 h-4 w-4"
                  />
                  <span className={checked ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                    <span className="font-medium">Step {index + 1}: </span>{step.text}
                    <span className="block text-xs text-muted-foreground">{step.time} · Use: {step.tool}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {template ? (
        <div className="mt-5">
          <TemplateButton templateId={template.id} findingId={item.findingKey ?? def.finding_key} />
        </div>
      ) : null}

      {status === "skipped" ? (
        <a href={`${item.path}?results=1`} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
          Open this checkup to answer this item
        </a>
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
