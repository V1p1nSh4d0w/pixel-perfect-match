import type { AssessmentAnswers, AssessmentResult, Finding, RiskLevel, Severity } from "@/types/assessment";

/**
 * SecureCheck scoring engine (deterministic self-assessment scoring).
 *
 * This is a SELF-ASSESSMENT based on the owner's answers — not a technical scan.
 * Findings describe reported gaps, never detected vulnerabilities.
 *
 * How the score is calculated:
 * 1. Every scored question maps to exactly one security control (see CONTROLS).
 *    "business_size" is context only and does not score.
 * 2. Each control has a fixed weight (points). Weights per category roughly follow:
 *    Accounts 25, Devices 15, Software 15, Backups 20, Email 10, Cloud 10, Website 5, Business 5.
 * 3. A control earns:
 *      - full weight for a "best" answer,
 *      - half weight for a "partial" answer,
 *      - zero for any other answer ("No", "Not sure", unanswered).
 *    Controls whose answer is "not applicable" (e.g. "No website") are removed
 *    from both earned and possible points.
 * 4. score = round(earned / possible * 100), clamped to 0–100.
 * 5. Risk level is derived only from the score (see riskLevelFor).
 *
 * Pure function of the answers: same answers => same score, and changing one
 * answer only affects that answer's control.
 */
export interface Control {
  /** Question id this control is evaluated from. */
  id: string;
  /** Human-readable control name. */
  name: string;
  category: string;
  /** Points this control contributes to the total possible score. */
  weight: number;
  best: string[];
  partial?: string[];
  /** Answers that make the question not applicable (no score impact, no finding). */
  na?: string[];
  /** Risk (finding severity) when the control is missing. */
  severity: Severity;
  /** Risk when only partially in place. */
  partialSeverity?: Severity;
  title: string;
  /** Explanation of why the control matters. */
  why: string;
  /** Remediation recommendation. */
  action: string;
}

type Rule = Control;

const RULES: Rule[] = [
  {
    id: "security_policy",
    name: "Written security policy",
    weight: 5,
    category: "Business",
    best: ["Yes"],
    severity: "Low",
    title: "No written security policy",
    why: "Without written rules, everyone handles security their own way and important steps get missed.",
    action: "Write a one-page policy covering passwords, MFA, device locks, and who to tell when something looks wrong.",
  },
  {
    id: "mfa_accounts",
    name: "MFA on important accounts",
    weight: 10,
    category: "Accounts",
    best: ["Yes, all important accounts"],
    partial: ["Yes, some"],
    severity: "Critical",
    partialSeverity: "High",
    title: "MFA is not enabled for all important accounts",
    why: "A stolen password is enough to break into an account without MFA. This is the most common way small businesses get hacked.",
    action: "Turn on MFA for email, banking, accounting, and admin accounts first, using an authenticator app rather than SMS where possible.",
  },
  {
    id: "password_manager",
    name: "Password manager",
    weight: 5,
    category: "Accounts",
    best: ["Yes"],
    severity: "Medium",
    title: "No password manager in use",
    why: "Without one, people reuse passwords, so one leaked password can unlock many accounts.",
    action: "Roll out a business password manager such as 1Password or Bitwarden and move shared passwords into it.",
  },
  {
    id: "admin_limited",
    name: "Least-privilege admin access",
    weight: 5,
    category: "Accounts",
    best: ["Yes"],
    severity: "High",
    title: "Admin access is not limited to those who need it",
    why: "Every extra admin account is another way for an attacker to take full control of your systems.",
    action: "List everyone with admin or owner rights and downgrade anyone who doesn't need them day to day.",
  },
  {
    id: "offboarding",
    name: "Leaver access removal",
    weight: 5,
    category: "Accounts",
    best: ["Yes"],
    severity: "High",
    title: "Former staff access is not removed promptly",
    why: "Old accounts that still work can be misused by former staff or taken over by attackers unnoticed.",
    action: "Create a leaver checklist and remove access to every system on someone's last day.",
  },
  {
    id: "device_lock",
    name: "Device screen lock",
    weight: 6,
    category: "Devices",
    best: ["All devices"],
    partial: ["Some"],
    severity: "High",
    partialSeverity: "Medium",
    title: "Not all business devices are locked",
    why: "Anyone who picks up an unlocked laptop or phone gets instant access to your business data.",
    action: "Require a PIN, password, or biometric lock and auto-lock after a few minutes on every business device.",
  },
  {
    id: "remote_wipe",
    name: "Remote device wipe",
    weight: 5,
    category: "Devices",
    best: ["Yes"],
    severity: "Medium",
    title: "Lost devices can't be wiped remotely",
    why: "If a device is lost or stolen, the data on it stays exposed with no way to erase it.",
    action: "Turn on Find My (Apple), Find My Device (Android/Windows), or your Google/Microsoft device management.",
  },
  {
    id: "personal_devices",
    name: "Personal device policy",
    weight: 4,
    category: "Devices",
    best: ["No"],
    severity: "Medium",
    title: "Personal devices access business data",
    why: "You can't control the security of personal devices, so business data on them is harder to protect.",
    action: "Set basic rules for personal devices — screen lock, up-to-date software — or limit what they can access.",
  },
  {
    id: "auto_updates",
    name: "Automatic software updates",
    weight: 9,
    category: "Software",
    best: ["Yes"],
    partial: ["Sometimes"],
    severity: "High",
    partialSeverity: "Medium",
    title: "Software is not updated automatically",
    why: "Attackers routinely exploit known flaws that updates have already fixed.",
    action: "Turn on automatic updates for the operating system, browsers, and key apps on every device.",
  },
  {
    id: "unsupported_software",
    name: "Supported software only",
    weight: 6,
    category: "Software",
    best: ["No"],
    severity: "High",
    title: "Unsupported software may be in use",
    why: "Software the vendor no longer supports gets no security fixes, leaving permanent open doors.",
    action: "Identify any out-of-support software and plan to replace or upgrade it.",
  },
  {
    id: "backups_exist",
    name: "Automated backups",
    weight: 10,
    category: "Backups",
    best: ["Yes, automated"],
    partial: ["Yes, manual"],
    severity: "Critical",
    partialSeverity: "Medium",
    title: "Important data is not reliably backed up",
    why: "Without regular backups, ransomware, a failed drive, or a mistake can wipe out your business data for good.",
    action: "Set up automated daily backups of your important files and systems.",
  },
  {
    id: "backups_separate",
    name: "Separate backup storage",
    weight: 5,
    category: "Backups",
    best: ["Yes"],
    severity: "High",
    title: "Backups are not stored separately",
    why: "Backups kept next to the original can be destroyed or encrypted in the same attack or accident.",
    action: "Keep at least one backup copy offsite or in a separate cloud account.",
  },
  {
    id: "backups_tested",
    name: "Backup restore testing",
    weight: 5,
    category: "Backups",
    best: ["Yes"],
    severity: "Medium",
    title: "Backups have not been tested",
    why: "Many businesses only discover their backups don't work when they desperately need them.",
    action: "Restore a few files from backup every quarter to confirm it works.",
  },
  {
    id: "email_mfa",
    name: "Email MFA",
    weight: 7,
    category: "Email",
    best: ["Yes"],
    severity: "Critical",
    title: "Email is not protected with MFA",
    why: "Your email resets every other password, so a hijacked inbox can lead to everything else.",
    action: "Turn on MFA for every mailbox in your email provider's admin settings.",
  },
  {
    id: "phishing_training",
    name: "Phishing awareness training",
    weight: 3,
    category: "Email",
    best: ["Yes"],
    severity: "Medium",
    title: "Staff are not trained to spot phishing",
    why: "Most attacks start with a convincing fake email; trained staff are your best early warning.",
    action: "Run a short phishing awareness session and share a simple 'how to spot a fake email' checklist.",
  },
  {
    id: "cloud_access_review",
    name: "Cloud access review",
    weight: 5,
    category: "Cloud",
    best: ["Yes"],
    severity: "Medium",
    title: "Cloud tool access is not reviewed",
    why: "Access tends to pile up over time, giving people more reach into your data than they need.",
    action: "Review who has access to Google Workspace, Microsoft 365, and other tools every quarter.",
  },
  {
    id: "third_party_apps",
    name: "Third-party app review",
    weight: 5,
    category: "Cloud",
    best: ["Yes"],
    severity: "Medium",
    title: "Third-party app access has not been checked",
    why: "Connected apps can quietly read your email and files, and some are risky or abandoned.",
    action: "Open your cloud admin's connected apps list and remove anything you don't recognize or use.",
  },
  {
    id: "https",
    name: "Website HTTPS",
    weight: 3,
    category: "Website",
    best: ["Yes"],
    na: ["No website"],
    severity: "High",
    title: "Website may not use HTTPS",
    why: "Without HTTPS, visitors see a 'Not secure' warning and data they send can be intercepted.",
    action: "Enable a free HTTPS certificate through your web host or a service like Let's Encrypt.",
  },
  {
    id: "registrar_mfa",
    name: "Domain registrar MFA",
    weight: 2,
    category: "Website",
    best: ["Yes"],
    severity: "High",
    title: "Domain registrar account lacks MFA",
    why: "Whoever controls your domain controls your website and email; losing it can take you offline.",
    action: "Log in to your domain registrar and turn on MFA, then confirm the contact email is current.",
  },
];

/** 80–100 Low, 60–79 Moderate, 40–59 High, 0–39 Critical. */
export function riskLevelFor(score: number): RiskLevel {
  if (score >= 80) return "Low risk";
  if (score >= 60) return "Moderate risk";
  if (score >= 40) return "High risk";
  return "Critical risk";
}

export const CONTROLS: readonly Control[] = RULES;

export function scoreAssessment(answers: AssessmentAnswers): AssessmentResult {
  const findings: Finding[] = [];
  let earned = 0;
  let possible = 0;

  for (const c of RULES) {
    const a = answers[c.id];
    // Not applicable: excluded from scoring and findings.
    if (a && c.na?.includes(a)) continue;
    possible += c.weight;
    if (a && c.best.includes(a)) {
      earned += c.weight; // control in place
      continue;
    }
    const partial = Boolean(a && c.partial?.includes(a));
    if (partial) earned += c.weight / 2; // partially in place
    // Any non-best answer produces a self-reported gap finding.
    findings.push({
      id: c.id,
      severity: partial && c.partialSeverity ? c.partialSeverity : c.severity,
      category: c.category,
      title: c.title,
      why_it_matters: c.why,
      recommended_action: c.action,
      status: "Open",
    });
  }

  const order: Severity[] = ["Critical", "High", "Medium", "Low"];
  // Stable sort by severity, then by control order => deterministic output.
  findings.sort((x, y) => order.indexOf(x.severity) - order.indexOf(y.severity));

  const score = possible ? Math.min(100, Math.max(0, Math.round((earned / possible) * 100))) : 0;
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
  findings.forEach((f) => counts[f.severity]++);

  return { score, riskLevel: riskLevelFor(score), findings, counts };
}

/** Short 3–6 word imperative task titles for the action plan, keyed by finding title. */
const SHORT_ACTIONS: Record<string, string> = {
  "No written security policy": "Write a one-page security policy",
  "MFA is not enabled for all important accounts": "Enable MFA on key accounts",
  "No password manager in use": "Set up a business password manager",
  "Admin access is not limited to those who need it": "Limit admin access",
  "Former staff access is not removed promptly": "Create a leaver access checklist",
  "Not all business devices are locked": "Lock every business device",
  "Lost devices can't be wiped remotely": "Enable remote device wipe",
  "Personal devices access business data": "Set personal device rules",
  "Software is not updated automatically": "Turn on automatic updates",
  "Unsupported software may be in use": "Replace unsupported software",
  "Important data is not reliably backed up": "Set up automated daily backups",
  "Backups are not stored separately": "Store a backup offsite",
  "Backups have not been tested": "Test restoring from backup",
  "Email is not protected with MFA": "Enable MFA on all mailboxes",
  "Staff are not trained to spot phishing": "Run phishing awareness training",
  "Cloud tool access is not reviewed": "Review cloud tool access quarterly",
  "Third-party app access has not been checked": "Remove unused connected apps",
  "Website may not use HTTPS": "Enable HTTPS on your website",
  "Domain registrar account lacks MFA": "Enable MFA on domain registrar",
};

export function shortActionFor(finding: { title: string; recommended_action: string }): string {
  return SHORT_ACTIONS[finding.title] ?? finding.recommended_action;
}
