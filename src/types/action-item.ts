export type ActionItemPriority = "Critical" | "High" | "Medium" | "Low";

export interface ActionItem {
  id: string;
  user_id: string;
  finding_id: string | null;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}
