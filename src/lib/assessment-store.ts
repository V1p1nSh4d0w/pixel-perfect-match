import { useSyncExternalStore } from "react";
import { scoreAssessment } from "@/lib/scoring";
import type { AssessmentState } from "@/types/assessment";

// Local-only state for now; will be wired to the database later.
let state: AssessmentState = { answers: {}, stepIndex: 0, savedAt: null, submittedAt: null, result: null };
const listeners = new Set<() => void>();

function set(patch: Partial<AssessmentState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const assessmentStore = {
  setAnswer(questionId: string, value: string) {
    set({ answers: { ...state.answers, [questionId]: value } });
  },
  getAnswers() {
    return state.answers;
  },
  setStep(stepIndex: number) {
    set({ stepIndex });
  },
  save() {
    set({ savedAt: Date.now() });
  },
  submit() {
    set({ submittedAt: Date.now(), savedAt: Date.now(), result: scoreAssessment(state.answers) });
  },
  reset() {
    set({ answers: {}, stepIndex: 0, savedAt: null, submittedAt: null, result: null });
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAssessment(): AssessmentState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
