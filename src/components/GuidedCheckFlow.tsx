import { useEffect, useMemo, useState } from "react";
import { useCheckupPersistence } from "@/hooks/useCheckupPersistence";
import type { CheckupItem } from "@/lib/checkup-results";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { RESULT_GROUPS, ResultSection, ResultsSummary, type ResultKey } from "@/components/CheckupResults";

export type GuidedAnswer = "good" | "found" | "unsure";

export interface GuidedCheck {
  id: string;
  category: string;
  title: string;
  what: string;
  why: string;
  /** Short hint on what specifically deserves attention (setting checks). */
  lookFor?: string;
  where: string;
  review: string;
  quick: boolean;
  /** How the answers are worded. Defaults to "setting" (inspecting a device/account setting). */
  style?: AnswerStyle;
  /** Optional internal finding_key (see finding-definitions.ts) raised by a negative answer. Never displayed. */
  findingKey?: string;
}

/** Display label for an answer in a given style (e.g. "No, we don't"). */
export function answerLabelFor(style: AnswerStyle | undefined, a: GuidedAnswer): string {
  return STYLE_OPTIONS[style ?? "setting"].find(([v]) => v === a)?.[1] ?? a;
}

export type AnswerStyle = "setting" | "practice" | "knowledge" | "scenario" | "business" | "businessKnow";

// Same three underlying answers for every style; only the wording changes.
const STYLE_OPTIONS: Record<AnswerStyle, [GuidedAnswer, string][]> = {
  setting: [["good", "Looks good"], ["found", "I found something"], ["unsure", "I'm not sure"]],
  practice: [["good", "Yes, I do this"], ["found", "I don't usually do this"], ["unsure", "I'm not sure"]],
  knowledge: [["good", "I already knew this"], ["found", "This is new to me"], ["unsure", "I'm not sure"]],
  business: [["good", "Yes, we do this"], ["found", "No, we don't"], ["unsure", "I'm not sure"]],
  businessKnow: [["good", "Yes, we know"], ["found", "No, we don't"], ["unsure", "I'm not sure"]],
  scenario: [["good", "I would avoid it"], ["found", "I might go along with it"], ["unsure", "I'm not sure"]],
};

/** Plain-language label describing what kind of result this is (never implies being hacked). */
function resultKind(c: GuidedCheck): string {
  switch (c.style ?? "setting") {
    case "practice": return c.category.toLowerCase().includes("privacy") ? "Privacy practice worth reviewing" : "Security practice to consider";
    case "knowledge": return "Awareness tip";
    case "scenario": return "Scam awareness";
    case "business":
    case "businessKnow": return "Recommended improvement";
    default: return "Setting to review";
  }
}

/** Where a "found" answer lands. Knowledge gaps and privacy practices are "Worth reviewing", not "Needs attention". */
function groupFor(c: GuidedCheck, a: GuidedAnswer | undefined): ResultKey {
  if (!a) return "skipped";
  if (a === "found" && (c.style === "knowledge" || (c.style === "practice" && c.category.toLowerCase().includes("privacy")))) return "unsure";
  return a;
}

export function GuidedCheckFlow({
  checks, flowName, intro, resultsTitle, deviceNoun, sectionLabel, whatLabel, whereLabel, backTo = "/checkup/personal", backLabel = "Back to Personal Security", onResults,
}: { onResults?: (answers: Record<string, GuidedAnswer>) => void; checks: GuidedCheck[]; flowName: string; intro: string; resultsTitle: string; deviceNoun: string; sectionLabel?: string; whatLabel?: string; whereLabel?: string; backTo?: "/checkup/personal" | "/checkup/business/start"; backLabel?: string }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GuidedAnswer>>({});
  const [done, setDone] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const total = checks.length;
  const keyOf = (c: GuidedCheck): ResultKey => groupFor(c, answers[c.id]);
  useEffect(() => { if (done) onResults?.(answers); }, [done, answers, onResults]);
  const items = useMemo<CheckupItem[]>(() => checks.map((c) => ({
  id: c.id,
  title: c.title,
  category: c.category,
  status: groupFor(c, answers[c.id]),
  ...(c.findingKey ? { findingKey: c.findingKey } : {}),
  why: c.why,
  answer: answers[c.id] ? answerLabelFor(c.style, answers[c.id]!) : undefined,
  review: c.review,
  where: c.where,
  })), [checks, answers]);
  const { path, resultId } = useCheckupPersistence({ done, answers, items, name: flowName, restore: (a) => { setAnswers(a); setDone(true); } });

  if (done) {
    const counts = { found: 0, unsure: 0, good: 0, skipped: 0 } as Record<ResultKey, number>;
    checks.forEach((c) => counts[keyOf(c)]++);
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{resultsTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">You finished your check. Here’s what we found from your answers.</p>
        <ResultsSummary counts={counts} />
        <div className="mt-4 flex flex-col items-center">
          <Link to="/app/findings" search={{ from: path, ...(resultId ? { resultId } : {}) }}><Button>View my findings →</Button></Link>
          <p className="mt-2 text-center text-xs text-muted-foreground">See what's worth fixing and get step-by-step guidance.</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Based on what you told us during this guided self-check. We didn't inspect your {deviceNoun}. None of these results mean you've been hacked — they're settings, habits and tips worth a look.
        </p>
        {RESULT_GROUPS.filter((g) => g.key !== "skipped" || counts.skipped > 0).map((g) => {
          const items = checks.filter((c) => keyOf(c) === g.key);
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
                      <p className="text-xs text-muted-foreground">{c.category}{g.key === "found" || g.key === "unsure" ? ` · ${answers[c.id] === "unsure" ? "Not sure yet" : resultKind(c)}` : ""}</p>
                      <p className="mt-1 font-medium">{c.title}</p>
                      {answers[c.id] === "unsure" ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          You weren't sure, so we haven't assumed anything. {c.why} When you have a moment, look here: {c.where}
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
          <Link to={backTo}><Button variant="ghost">{backLabel}</Button></Link>
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
      <p className="text-sm text-muted-foreground">{flowName}</p>
      {i === 0 && !reviewing ? (
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
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{whatLabel ?? "What to check"}</p>
        <p className="mt-1 text-sm">{c.what}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why it matters</p>
        <p className="mt-1 text-sm">{c.why}</p>
        {c.lookFor ? (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">What to look for</p>
            <p className="mt-1 text-sm">{c.lookFor}</p>
          </>
        ) : null}
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{whereLabel ?? "Where to look"}</p>
        <p className="mt-1 break-words text-sm">{c.where}</p>

        <div role="radiogroup" className="mt-6 grid gap-2 sm:grid-cols-3">
          {STYLE_OPTIONS[c.style ?? "setting"].map(([v, label]) => (
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
        {answer === "found" && (c.style ?? "setting") === "setting" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Next step: first check what it is and why it has this access. Something unfamiliar doesn't automatically mean your device or account is compromised.
          </p>
        ) : null}
        {answer === "unsure" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            That's fine. In short: {c.why} We won't guess — this will be listed as "Worth reviewing" so you can come back to it.
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
