import { useMemo, useState } from "react";
import { useCheckupPersistence } from "@/hooks/useCheckupPersistence";
import type { CheckupItem } from "@/lib/checkup-results";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { RESULT_GROUPS, ResultSection, ResultsSummary, type ResultKey } from "@/components/CheckupResults";
import type { AndroidAnswer, AndroidCheck } from "@/lib/android-checks";

const OPTIONS: [AndroidAnswer, string][] = [
  ["good", "Looks good"],
  ["found", "I found something"],
  ["unsure", "I'm not sure"],
];

export function AndroidCheckFlow({ checks, mode }: { checks: AndroidCheck[]; mode: "Quick" | "Deep" }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AndroidAnswer>>({});
  const [done, setDone] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const total = checks.length;
  const keyOf = (id: string): ResultKey => answers[id] ?? "skipped";
  const items = useMemo<CheckupItem[]>(() => checks.map((c) => ({
    id: c.id, title: c.title, category: c.category, status: answers[c.id] ?? "skipped",
    answer: OPTIONS.find(([v]) => v === answers[c.id])?.[1], review: c.review, where: c.where,
  })), [checks, answers]);
  const { path } = useCheckupPersistence({ done, answers, items, name: `Android Phone Security · ${mode} Check`, restore: (a) => { setAnswers(a); setDone(true); } });

  if (done) {
    const counts = { found: 0, unsure: 0, good: 0, skipped: 0 } as Record<ResultKey, number>;
    checks.forEach((c) => counts[keyOf(c.id)]++);
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your Android check results</h1>
        <ResultsSummary counts={counts} />
        <div className="mt-4"><Link to="/app/findings" search={{ from: path }}><Button>View Findings</Button></Link></div>
        <p className="mt-4 text-sm text-muted-foreground">
          Based on what you told us during this guided self-check. We didn't inspect your phone.
        </p>
        {RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0).map((g) => {
          const items = checks.filter((c) => keyOf(c.id) === g.key);
          return (
            <ResultSection key={g.key} anchor={g.anchor} title={`${g.label} (${items.length})`}>
              {g.key === "skipped" ? (
                <p className="mt-2 text-sm text-muted-foreground">You skipped these, so we haven't assumed anything. You can go back and answer them any time.</p>
              ) : null}
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
                          You weren't sure, so we haven't assumed anything. When you have a moment, look here: {c.where}
                        </p>
                      ) : null}
                      {g.key === "found" || g.key === "unsure" ? <p className="mt-2 text-sm">{c.review}</p> : null}
                      {g.key === "skipped" ? (
                        <button className="mt-2 text-sm font-medium text-primary hover:underline" onClick={() => { setDone(false); setReviewing(true); setI(checks.indexOf(c)); }}>
                          Answer this check
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </ResultSection>
          );
        })}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => { setDone(false); setReviewing(true); setI(0); }}>Review my answers</Button>
          <Link to="/checkup/personal"><Button variant="ghost">Back to Personal Security</Button></Link>
        </div>
      </div>
    );
  }

  const c = checks[i]!;
  const answer = answers[c.id];
  const next = () => (i + 1 < total ? setI(i + 1) : setDone(true));
  return (
    <div>
      {reviewing ? (
        <button className="mb-4 text-sm font-medium text-primary hover:underline" onClick={() => setDone(true)}>← Back to Results</button>
      ) : null}
      <p className="text-sm text-muted-foreground">Android Phone Security · {mode} Check</p>
      {i === 0 && !reviewing ? (
        <p className="mt-3 max-w-2xl rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
          We'll guide you through a few settings on your Android phone. We can't directly inspect your phone from this website, so you'll check each setting and tell us what you find.
        </p>
      ) : null}
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="font-medium">Check {i + 1} of {total}</span>
        <span className="text-muted-foreground">{c.category}</span>
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
        {c.lookFor ? (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">What to look for</p>
            <p className="mt-1 text-sm">{c.lookFor}</p>
          </>
        ) : null}
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Where to look</p>
        <p className="mt-1 text-sm">{c.where}</p>
        <p className="mt-2 text-xs text-muted-foreground">Menu names vary slightly between phone brands.</p>

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
        {answer === "found" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Next step: first check what it is and why it has this access. Something unfamiliar doesn't automatically mean your device or account is compromised.
          </p>
        ) : null}
        {answer === "unsure" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            That's fine. We won't guess — this will be listed as "Worth reviewing" so you can come back to it.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <div className="flex flex-wrap items-center gap-3">
          {!answer ? <Button variant="ghost" onClick={next}>Skip for now</Button> : null}
          <Button disabled={!answer} onClick={next}>{i + 1 < total ? "Next" : "See results"}</Button>
        </div>
      </div>
      {reviewing ? (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => setDone(true)}>Done Reviewing</Button>
        </div>
      ) : null}
    </div>
  );
}
