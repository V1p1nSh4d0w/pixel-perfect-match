import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { ASSESSMENT_STEPS, REVIEW_INDEX, STEP_NAMES } from "@/lib/assessment-questions";
import { assessmentStore, useAssessment } from "@/lib/assessment-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { saveAssessment } from "@/lib/supabase";
import { scoreAssessment } from "@/lib/scoring";
import { LATEST_RESULT_KEY } from "@/lib/use-latest-result";

export const Route = createFileRoute("/_authenticated/app/assessment/")({
  head: () => ({ meta: [
    { title: "Assessment — SecureCheck" },
    { name: "description", content: "Complete your SecureCheck security self-assessment." },
    { property: "og:title", content: "Assessment — SecureCheck" },
    { property: "og:description", content: "Complete your SecureCheck security self-assessment." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const { answers, stepIndex } = useAssessment();
  const isReview = stepIndex === REVIEW_INDEX;
  const progress = ((stepIndex + 1) / STEP_NAMES.length) * 100;

  function go(i: number) {
    assessmentStore.setStep(i);
    window.scrollTo({ top: 0 });
  }

  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  async function submit() {
    setSubmitting(true);
    try {
      const answers = assessmentStore.getAnswers();
      await saveAssessment(answers, scoreAssessment(answers));
      await queryClient.invalidateQueries({ queryKey: LATEST_RESULT_KEY });
      await queryClient.invalidateQueries({ queryKey: ["score-history"] });
      await queryClient.invalidateQueries({ queryKey: ["action-items"] });
      assessmentStore.reset();
      navigate({ to: "/app/assessment/complete" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Assessment" description="Answer in plain terms. Pick “Not sure” whenever you don’t know." />

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-semibold text-foreground">
            Step {stepIndex + 1} of {STEP_NAMES.length}
            <span className="ml-2 font-normal text-muted-foreground">· {STEP_NAMES[stepIndex]}</span>
          </p>
          <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ol className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {STEP_NAMES.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === stepIndex ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 transition-colors hover:text-foreground",
                  i === stepIndex ? "font-semibold text-primary" : i < stepIndex ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {i < stepIndex ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-success" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 6.5 4.8 9 10 3.5" />
                  </svg>
                ) : (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      i === stepIndex ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                )}
                {i + 1}. {name}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {isReview ? (
        <ReviewStep answers={answers} onJump={go} />
      ) : (
        <Card className="space-y-8">
          <h2 className="type-section">{ASSESSMENT_STEPS[stepIndex]!.name}</h2>
          {ASSESSMENT_STEPS[stepIndex]!.questions.map((q) => (
            <fieldset key={q.id} className="space-y-3">
              <legend className="mb-3 text-sm font-medium text-foreground">{q.text}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const checked = answers[q.id] === opt;
                  return (
                    <label
                      key={opt}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-button border px-3 py-2.5 text-sm transition-colors",
                        checked ? "border-primary bg-surface-raised text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={checked}
                        onChange={() => assessmentStore.setAnswer(q.id, opt)}
                        className="accent-primary"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </Card>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={stepIndex === 0} onClick={() => go(stepIndex - 1)}>
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              assessmentStore.save();
              toast.success("Progress saved");
            }}
          >
            Save progress
          </Button>
          {isReview ? (
            <Button onClick={submit} loading={submitting}>Submit assessment</Button>
          ) : (
            <Button onClick={() => go(stepIndex + 1)}>Next →</Button>
          )}
        </div>
      </div>
    </>
  );
}

function ReviewStep({ answers, onJump }: { answers: Record<string, string>; onJump: (i: number) => void }) {
  return (
    <div className="space-y-4">
      {ASSESSMENT_STEPS.map((step, i) => (
        <Card key={step.id}>
          <h2 className="mb-4 type-card-title">{step.name}</h2>
          <ul className="space-y-1">
            {step.questions.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="flex w-full flex-col gap-1 rounded-button px-2 py-2 text-left transition-colors hover:bg-surface-raised sm:flex-row sm:justify-between sm:gap-6"
                >
                  <span className="text-sm text-muted-foreground">{q.text}</span>
                  <span className={cn("shrink-0 text-sm font-medium", answers[q.id] ? "text-foreground" : "text-muted-foreground")}>
                    {answers[q.id] ?? "Not answered"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
