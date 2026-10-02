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
  result: AssessmentResult | null;
}

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type RiskLevel = "Low risk" | "Moderate risk" | "High risk" | "Critical risk";
export type FindingStatus = "Open" | "In progress" | "Resolved";
export type Effort = "Low" | "Medium" | "High";

export interface Finding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  why_it_matters: string;
  recommended_action: string;
  status: FindingStatus;
  /** The assessment question and the user's answer that produced this finding. */
  evidence?: { question: string; answer: string };
  /** Estimated effort to fix, defined per control. */
  effort?: Effort;
  /** Set when the user self-reported this control as fixed. */
  reassessment?: { reassessed_at: string; previous_answer: string | null; reassessed_answer: string | null; previous_score: number | null; new_score: number | null } | null;
}

export interface AssessmentResult {
  score: number;
  riskLevel: RiskLevel;
  findings: Finding[];
  counts: Record<Severity, number>;
  /** When the assessment was completed (set when loaded from the database). */
  created_at?: string;
  /** True when any improvement in this assessment is self-reported only (score capped). */
  selfReported?: boolean;
}
