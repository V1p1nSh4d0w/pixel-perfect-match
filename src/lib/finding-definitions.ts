import type { Effort, Severity } from "@/types/assessment";

/**
 * Central finding-definition layer.
 *
 * `finding_key` is the stable INTERNAL identifier — never display it to users
 * and never use the display title as a permanent id (titles may be reworded).
 *
 * Severity and effort reuse the existing SecureCheck conventions
 * (`Severity`, `Effort` from @/types/assessment). No numeric score here.
 *
 * Optional references point at the existing systems without changing them:
 * - `playbook_title`: key into the existing PLAYBOOKS map (playbooks.server.ts).
 * - `template_key`: matches `templates.linked_finding_key` in the database.
 */
export interface FindingDefinition {
  finding_key: string;
  category: string;
  title: string;
  severity: Severity;
  why_it_matters: string;
  recommended_action: string;
  effort: Effort;
  playbook_title?: string;
  template_key?: string;
}

const DEFINITIONS: FindingDefinition[] = [
  {
    finding_key: "business_mfa_not_enabled",
    category: "Accounts & Access",
    title: "MFA is not enabled for important business accounts",
    severity: "Critical",
    why_it_matters:
      "Without MFA, a stolen or guessed password can be enough to sign in. MFA can significantly reduce the risk of account takeover, even if a password is compromised.",
    recommended_action:
      "Turn on MFA for email, banking, admin, cloud storage and other important business accounts, starting with the most critical ones.",
    effort: "Medium",
    playbook_title: "MFA is not enabled for all important accounts",
    template_key: "mfa_not_enabled",
  },
  {
    finding_key: "business_shared_accounts",
    category: "Accounts & Access",
    title: "Important business accounts use shared access",
    severity: "High",
    why_it_matters:
      "When several people share one login, it is harder to see who did what, to remove one person's access, or to protect the account with MFA.",
    recommended_action:
      "Where practical, give each person their own account, or store unavoidable shared logins in a password manager with MFA.",
    effort: "Medium",
  },
  {
    finding_key: "business_former_staff_access",
    category: "Accounts & Access",
    title: "Former staff access may still be active",
    severity: "High",
    why_it_matters:
      "Accounts, shared passwords or devices left with people who have left can give continued access to business systems and data.",
    recommended_action:
      "Review important accounts for former staff and contractors, remove or disable their access, and change any shared passwords they knew.",
    effort: "Low",
    playbook_title: "Former staff access is not removed promptly",
  },
  {
    finding_key: "business_data_not_backed_up",
    category: "Data & Backups",
    title: "Important business data is not reliably backed up",
    severity: "Critical",
    why_it_matters:
      "Device loss, accidental deletion or malware can make important files unavailable. Without a reliable backup, they may not be recoverable.",
    recommended_action:
      "Identify the business's important data and set up regular, automatic backups for it.",
    effort: "Medium",
    playbook_title: "Important data is not reliably backed up",
  },
  {
    finding_key: "business_backups_not_separate",
    category: "Data & Backups",
    title: "Backups are not stored separately",
    severity: "High",
    why_it_matters:
      "A backup kept on the same device or easily reachable from it can be lost, deleted or encrypted along with the original data.",
    recommended_action:
      "Keep at least one copy of important backups separate from the main device or account, protected with its own login and MFA.",
    effort: "Medium",
    playbook_title: "Backups are not stored separately",
  },
  {
    finding_key: "business_backups_not_tested",
    category: "Data & Backups",
    title: "Backups have not been tested",
    severity: "Medium",
    why_it_matters:
      "Having backups doesn't guarantee recovery. An untested backup may be incomplete or fail to restore when it is needed.",
    recommended_action:
      "Try restoring a few important files from backup, note what worked, and repeat the test regularly.",
    effort: "Medium",
    playbook_title: "Backups have not been tested",
    template_key: "backups_not_tested",
  },
  {
    finding_key: "personal_mfa_not_enabled",
    category: "Account Security",
    title: "MFA is not enabled on an important account",
    severity: "High",
    why_it_matters:
      "Without MFA, someone who learns your password may be able to sign in. MFA can significantly reduce the risk of account takeover, even if your password is compromised.",
    recommended_action:
      "Turn on MFA (two-step verification) for your important accounts, such as email, banking and cloud storage, preferring an authenticator app or passkey where available.",
    effort: "Low",
  },
];
  {
    finding_key: "business_admin_access_review",
    category: "Accounts & Access",
    title: "Administrator access needs review",
    severity: "High",
    why_it_matters:
      "Administrator accounts can change important settings and access sensitive business information. Too many admins or an unexpected admin account can increase the impact of an account compromise.",
    recommended_action:
      "Review administrator accounts on important business services and keep admin access limited to people who actually need it.",
    effort: "Low",
  },
  {
    finding_key: "business_recovery_methods",
    category: "Accounts & Access",
    title: "Business account recovery methods need review",
    severity: "Medium",
    why_it_matters:
      "Out-of-date recovery email addresses or phone numbers can make account recovery difficult, while recovery details controlled by someone else may create additional risk.",
    recommended_action:
      "Review recovery email addresses, phone numbers and backup options on important business accounts and remove outdated details.",
    effort: "Low",
  },
  {
    finding_key: "business_third_party_access",
    category: "Accounts & Access",
    title: "Connected business apps and services need review",
    severity: "Medium",
    why_it_matters:
      "Connected apps and services may have permission to access business information. Unused or unnecessary connections can retain access longer than needed.",
    recommended_action:
      "Review connected apps and third-party services on important business accounts and remove access that is no longer needed.",
    effort: "Low",
  },

export const FINDING_DEFINITIONS: Readonly<Record<string, FindingDefinition>> = Object.freeze(
  Object.fromEntries(DEFINITIONS.map((d) => [d.finding_key, d])),
);

export type FindingKey = keyof typeof FINDING_DEFINITIONS;

export function getFindingDefinition(key: string): FindingDefinition | undefined {
  return FINDING_DEFINITIONS[key];
}

export function listFindingDefinitions(category?: string): FindingDefinition[] {
  return category ? DEFINITIONS.filter((d) => d.category === category) : [...DEFINITIONS];
}

/** A finding raised from a guided self-check answer (self-reported, never technically detected). */
export interface CheckupFinding extends FindingDefinition {
  evidence: { question: string; answer: string; source: "Self-assessment" };
}

/**
 * Maps checkup answers to finding definitions. Only a negative ("found") answer
 * raises a finding; "good", "unsure" and skipped answers never do.
 * One finding per finding_key, so revisiting/reviewing never duplicates.
 */
export function findingsFromCheckup(
  checks: { id: string; title: string; findingKey?: string }[],
  answers: Record<string, string | undefined>,
  answerLabel: (checkId: string, answer: string) => string,
): CheckupFinding[] {
  const out = new Map<string, CheckupFinding>();
  for (const c of checks) {
    const a = answers[c.id];
    if (!c.findingKey || a !== "found" || out.has(c.findingKey)) continue;
    const def = FINDING_DEFINITIONS[c.findingKey];
    if (!def) continue;
    out.set(c.findingKey, { ...def, evidence: { question: c.title, answer: answerLabel(c.id, a), source: "Self-assessment" } });
  }
  return [...out.values()];
}
const LEGACY_CHECK_ID_TO_FINDING_KEY: Record<string, FindingKey> = {
  mfa: "business_mfa_not_enabled",
  shared: "business_shared_accounts",
  former: "business_former_staff_access",
  coverage: "business_data_not_backed_up",
  separation: "business_backups_not_separate",
  "restore-test": "business_backups_not_tested",
};

export function getFindingDefinitionForCheck(
  findingKey: string | undefined,
  checkId: string,
) {
  if (findingKey) {
    return getFindingDefinition(findingKey);
  }

  const fallbackKey = LEGACY_CHECK_ID_TO_FINDING_KEY[checkId];
  return fallbackKey ? getFindingDefinition(fallbackKey) : undefined;
}
