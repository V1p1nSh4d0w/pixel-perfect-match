import { useSyncExternalStore } from "react";
import type { AssessmentState } from "@/types/assessment";

// Local-only state for now; will be wired to the database later.
let state: AssessmentState = { answers: {}, stepIndex: 0, savedAt: null, submittedAt: null };
const listeners = new Set<() => void>();

function set(patch: Partial<AssessmentState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const assessmentStore = {
  setAnswer(questionId: string, value: string) {
    set({ answers: { ...state.answers, [questionId]: value } });
  },
  setStep(stepIndex: number) {
    set({ stepIndex });
  },
  save() {
    set({ savedAt: Date.now() });
  },
  submit() {
    set({ submittedAt: Date.now(), savedAt: Date.now() });
  },
  reset() {
    set({ answers: {}, stepIndex: 0, savedAt: null, submittedAt: null });
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAssessment(): AssessmentState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
