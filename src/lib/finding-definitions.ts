import type { Effort, Severity } from "@/types/assessment";
import { WINDOWS_CHECKS } from "@/lib/windows-checks";
import { ANDROID_CHECKS } from "@/lib/android-checks";

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
    finding_key: "business_device_protection",
    category: "Devices & Software",
    title: "Security protection on business computers needs review",
    severity: "High",
    why_it_matters: "Security protection helps block harmful downloads and known malware. If it is turned off or out of date, common threats may reach a business computer more easily.",
    recommended_action: "Check each business computer has its built-in or trusted security protection turned on and up to date. Follow the security product's own guidance if it shows a warning.",
    effort: "Low",
  },
  {
    finding_key: "business_device_firewall",
    category: "Devices & Software",
    title: "A business device firewall needs review",
    severity: "Medium",
    why_it_matters: "A firewall limits network connections that can reach a computer, reducing exposure on office, public and shared networks.",
    recommended_action: "Turn on the built-in firewall for each business computer. If a program needs network access, allow that program specifically instead of disabling the firewall.",
    effort: "Low",
  },
  {
    finding_key: "business_device_encryption",
    category: "Devices & Software",
    title: "Encryption on business devices needs review",
    severity: "High",
    why_it_matters: "If a laptop or phone is lost or stolen, encryption helps prevent someone from reading the business data stored on it without the sign-in or recovery key.",
    recommended_action: "Enable device encryption on supported devices that hold important business data, and keep recovery keys in a secure place. Never share a recovery key in this checkup.",
    effort: "Medium",
  },
  {
    finding_key: "business_device_admin_rights",
    category: "Devices & Software",
    title: "Everyday administrator access needs review",
    severity: "Medium",
    why_it_matters: "Software can make changes using the rights of the person running it. Standard accounts for everyday work can limit the changes harmful software is able to make.",
    recommended_action: "Keep administrator access for people who need it, and use standard accounts for routine work where practical.",
    effort: "Low",
  },
  {
    finding_key: "business_device_remote_access",
    category: "Devices & Software",
    title: "Remote access on business devices needs review",
    severity: "High",
    why_it_matters: "Remote access can be useful, but an unused or weakly protected connection can let someone else control a business computer.",
    recommended_action: "Turn off remote access you don't use. Protect any required remote access with strong sign-in and MFA, and confirm the tools and users are authorised.",
    effort: "Low",
  },
  {
    finding_key: "business_device_unfamiliar_software",
    category: "Devices & Software",
    title: "Unfamiliar or unnecessary business software needs review",
    severity: "Medium",
    why_it_matters: "Unneeded, harmful or outdated software can create extra security weaknesses on business devices.",
    recommended_action: "Look up unfamiliar apps and their publisher before acting. Remove software that is not needed or approved after confirming what it does.",
    effort: "Low",
  },
  {
    finding_key: "business_device_updates",
    category: "Devices & Software",
    title: "Business device updates and support status need review",
    severity: "High",
    why_it_matters: "Security updates fix weaknesses. Devices that miss updates or run unsupported systems can remain exposed to publicly known issues.",
    recommended_action: "Install pending security updates and make a plan to upgrade or replace devices that no longer receive them.",
    effort: "Medium",
  },
  {
    finding_key: "business_device_secure_boot",
    category: "Devices & Software",
    title: "Hardware security settings need review",
    severity: "Medium",
    why_it_matters: "Where supported, Secure Boot helps start a computer using trusted software, while a TPM can protect encryption keys.",
    recommended_action: "Keep Secure Boot and TPM enabled where the device supports them. Check the device maker's instructions before changing firmware settings.",
    effort: "Medium",
  },
  {
    finding_key: "business_device_management",
    category: "Devices & Software",
    title: "Business device setup needs a consistent approach",
    severity: "Medium",
    why_it_matters: "A consistent setup helps the business check that protection, updates and encryption are in place and respond if a device is lost.",
    recommended_action: "Write down a basic setup for new devices. As the team grows, consider a suitable device-management service.",
    effort: "Medium",
  },
  {
    finding_key: "business_software_inventory",
    category: "Devices & Software",
    title: "Important business software needs an inventory",
    severity: "Low",
    why_it_matters: "Knowing which key software is installed makes it easier to keep it updated and identify tools that are no longer needed.",
    recommended_action: "Keep a simple list of business devices and important software, and update it when devices or apps change.",
    effort: "Low",
  },
  {
    finding_key: "business_device_remote_tools",
    category: "Devices & Software",
    title: "Business remote-support tools need an access review",
    severity: "High",
    why_it_matters: "Remote-support tools can give a person broad control of a device. Unknown tools or unnecessary accounts can expose business systems.",
    recommended_action: "Confirm each remote-support tool and its users are authorised. Remove tools that are no longer needed, checking with your IT provider first.",
    effort: "Low",
  },
  {
    finding_key: "business_device_separation",
    category: "Devices & Software",
    title: "Personal and business device use needs clearer separation",
    severity: "Medium",
    why_it_matters: "When personal activity and business data share a device, an issue such as an unsafe download or shared access can affect both.",
    recommended_action: "Separate work and personal use with distinct accounts, browser profiles or devices where practical, especially for sensitive business data.",
    effort: "Medium",
  },
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

];

const PERSONAL_WINDOWS_DEFINITIONS: FindingDefinition[] = WINDOWS_CHECKS.map((check) => ({
  finding_key: `personal_windows_${check.id}`,
  category: check.category,
  title: check.title,
  severity: "Medium",
  why_it_matters: check.why,
  recommended_action: check.review,
  effort: "Low",
}));
const PERSONAL_ANDROID_DEFINITIONS: FindingDefinition[] = ANDROID_CHECKS.map((check) => ({
  finding_key: `personal_android_${check.id}`,
  category: check.category,
  title: check.title,
  severity: "Medium",
  why_it_matters: check.why,
  recommended_action: check.review,
  effort: "Low",
}));

export const FINDING_DEFINITIONS: Readonly<Record<string, FindingDefinition>> = Object.freeze(
  Object.fromEntries([...DEFINITIONS, ...PERSONAL_WINDOWS_DEFINITIONS, ...PERSONAL_ANDROID_DEFINITIONS].map((d) => [d.finding_key, d])),
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

const BUSINESS_DEVICE_CHECK_TO_FINDING_KEY: Record<string, FindingKey> = {
  endpoint: "business_device_protection",
  firewall: "business_device_firewall",
  encryption: "business_device_encryption",
  "local-admin": "business_device_admin_rights",
  remote: "business_device_remote_access",
  "unknown-software": "business_device_unfamiliar_software",
  updates: "business_device_updates",
  "secure-boot": "business_device_secure_boot",
  management: "business_device_management",
  inventory: "business_software_inventory",
  "remote-tools": "business_device_remote_tools",
  "personal-vs-business": "business_device_separation",
};

const PERSONAL_WINDOWS_CATEGORIES = new Set([
  "Windows Security", "System protection", "Remote access", "Accounts & privileges",
  "Applications & startup", "Browser security",
]);
const PERSONAL_ANDROID_CATEGORIES = new Set([
  "Powerful access", "Network & system configuration", "App permissions", "Installed apps",
]);

export function getFindingDefinitionForCheck(
  findingKey: string | undefined,
  checkId: string,
  category?: string,
) {
  if (findingKey) {
    return getFindingDefinition(findingKey);
  }

  if (category === "Devices & Software") {
    const deviceFindingKey = BUSINESS_DEVICE_CHECK_TO_FINDING_KEY[checkId];
    if (deviceFindingKey) return getFindingDefinition(deviceFindingKey);
  }

  if (category && PERSONAL_WINDOWS_CATEGORIES.has(category) && FINDING_DEFINITIONS[`personal_windows_${checkId}`]) {
    return getFindingDefinition(`personal_windows_${checkId}`);
  }

  if (category && PERSONAL_ANDROID_CATEGORIES.has(category) && FINDING_DEFINITIONS[`personal_android_${checkId}`]) {
    return getFindingDefinition(`personal_android_${checkId}`);
  }

  const fallbackKey = LEGACY_CHECK_ID_TO_FINDING_KEY[checkId];
  return fallbackKey ? getFindingDefinition(fallbackKey) : undefined;
}
