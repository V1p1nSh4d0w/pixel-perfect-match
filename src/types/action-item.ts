export type ActionItemPriority = "Critical" | "High" | "Medium" | "Low";

export interface ActionItem {
  id: string;
  user_id: string;
  finding_id: string | null;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
  /** Category of the finding this item came from, via the finding_id link. */
  finding: { category: string; recommended_action: string; title: string; severity: string; status: string; assessment_id: string } | null;
}
