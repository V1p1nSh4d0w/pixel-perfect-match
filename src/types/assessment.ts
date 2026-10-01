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
export type RiskLevel = "Low risk" | "Moderate risk" | "High risk";
export type FindingStatus = "Open" | "Resolved";

export interface Finding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  why_it_matters: string;
  recommended_action: string;
  status: FindingStatus;
}

export interface AssessmentResult {
  score: number;
  riskLevel: RiskLevel;
  findings: Finding[];
  counts: Record<Severity, number>;
}
