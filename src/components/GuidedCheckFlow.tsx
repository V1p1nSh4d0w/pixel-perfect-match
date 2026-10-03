import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";

export type GuidedAnswer = "good" | "found" | "unsure";

export interface GuidedCheck {
  id: string;
  category: string;
  title: string;
  what: string;
  why: string;
  where: string;
  review: string;
  quick: boolean;
}

const OPTIONS: [GuidedAnswer, string][] = [
  ["good", "Looks good"],
  ["found", "I found something"],
  ["unsure", "I'm not sure"],
];

const GROUPS = [
  { key: "found" as const, label: "🔴 Needs attention" },
  { key: "unsure" as const, label: "🟡 Worth reviewing" },
  { key: "good" as const, label: "🟢 Looks good" },
];

export function GuidedCheckFlow({
  checks, flowName, intro, resultsTitle, deviceNoun, sectionLabel,
}: { checks: GuidedCheck[]; flowName: string; intro: string; resultsTitle: string; deviceNoun: string; sectionLabel?: string }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GuidedAnswer>>({});
  const [done, setDone] = useState(false);
  const total = checks.length;

  if (done) {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{resultsTitle}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Based on what you told us during this guided self-check. We didn't inspect your {deviceNoun}.
        </p>
        {GROUPS.map((g) => {
          const items = checks.filter((c) => answers[c.id] === g.key);
          return (
            <section key={g.key} className="mt-8">
              <h2 className="text-lg font-semibold">{g.label} ({items.length})</h2>
              {items.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Nothing here.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {items.map((c) => (
                    <li key={c.id} className="rounded-card border border-border bg-card p-4">
                      <p className="text-xs text-muted-foreground">{c.category}</p>
                      <p className="mt-1 font-medium">{c.title}</p>
                      {g.key === "unsure" ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          You weren't sure, so we haven't assumed anything. {c.why} When you have a moment, look here: {c.where}
                        </p>
                      ) : null}
                      {g.key !== "good" ? <p className="mt-2 text-sm">{c.review}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => { setDone(false); setI(0); }}>Review my answers</Button>
          <Link to="/checkup/personal"><Button variant="ghost">Back to Personal Checkup</Button></Link>
        </div>
      </div>
    );
  }

  const c = checks[i]!;
  const answer = answers[c.id];
  return (
    <div>
      <p className="text-sm text-muted-foreground">{flowName}</p>
      {i === 0 ? (
        <p className="mt-3 max-w-2xl rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">{intro}</p>
      ) : null}
      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{sectionLabel ? `${sectionLabel} — ` : ""}Check {i + 1} of {total}</span>
        <span className="text-right text-muted-foreground">{c.category}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${((i + 1) / total) * 100}%` }} />
      </div>

      <div className="mt-6 rounded-card border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">{c.title}</h1>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">What to check</p>
        <p className="mt-1 text-sm">{c.what}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why it matters</p>
        <p className="mt-1 text-sm">{c.why}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Where to look</p>
        <p className="mt-1 break-words text-sm">{c.where}</p>

        <div role="radiogroup" className="mt-6 grid gap-2 sm:grid-cols-3">
          {OPTIONS.map(([v, label]) => (
            <button
              key={v}
              role="radio"
              aria-checked={answer === v}
              onClick={() => setAnswers((a) => ({ ...a, [c.id]: v }))}
              className={`rounded-button border px-3 py-2.5 text-sm transition-colors ${
                answer === v ? "border-primary bg-primary/10 text-foreground" : "border-border bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {answer === "unsure" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            That's fine. In short: {c.why} We won't guess — this will be listed as "Worth reviewing" so you can come back to it.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <Button variant="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <Button disabled={!answer} onClick={() => (i + 1 < total ? setI(i + 1) : setDone(true))}>
          {i + 1 < total ? "Next" : "See results"}
        </Button>
      </div>
    </div>
  );
}
