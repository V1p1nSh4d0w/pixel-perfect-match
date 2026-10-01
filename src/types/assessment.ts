export interface AssessmentQuestion {
  id: string;
  text: string;
  options: readonly string[];
}

export interface AssessmentStep {
  id: string;
  name: string;
  questions: readonly AssessmentQuestion[];
}

export type AssessmentAnswers = Record<string, string>;

export interface AssessmentState {
  answers: AssessmentAnswers;
  stepIndex: number;
  savedAt: number | null;
  submittedAt: number | null;
}
