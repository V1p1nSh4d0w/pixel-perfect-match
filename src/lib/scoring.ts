import type { AssessmentAnswers, AssessmentResult, Finding, RiskLevel, Severity } from "@/types/assessment";

interface Rule {
  id: string;
  category: string;
  best: string[];
  partial?: string[];
  /** Answers that make the question not applicable (no score impact, no finding). */
  na?: string[];
  severity: Severity;
  partialSeverity?: Severity;
  title: string;
  why: string;
  action: string;
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  Accounts: 25,
  Devices: 15,
  Software: 15,
  Backups: 20,
  Email: 10,
  Cloud: 10,
  Website: 5,
};

const RULES: Rule[] = [
  {
    id: "security_policy",
    category: "Business",
    best: ["Yes"],
    severity: "Low",
    title: "No written security policy",
    why: "Without written rules, everyone handles security their own way and important steps get missed.",
    action: "Write a one-page policy covering passwords, MFA, device locks, and who to tell when something looks wrong.",
  },
  {
    id: "mfa_accounts",
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
    category: "Accounts",
    best: ["Yes"],
    severity: "Medium",
    title: "No password manager in use",
    why: "Without one, people reuse passwords, so one leaked password can unlock many accounts.",
    action: "Roll out a business password manager such as 1Password or Bitwarden and move shared passwords into it.",
  },
  {
    id: "admin_limited",
    category: "Accounts",
    best: ["Yes"],
    severity: "High",
    title: "Admin access is not limited to those who need it",
    why: "Every extra admin account is another way for an attacker to take full control of your systems.",
    action: "List everyone with admin or owner rights and downgrade anyone who doesn't need them day to day.",
  },
  {
    id: "offboarding",
    category: "Accounts",
    best: ["Yes"],
    severity: "High",
    title: "Former staff access is not removed promptly",
    why: "Old accounts that still work can be misused by former staff or taken over by attackers unnoticed.",
    action: "Create a leaver checklist and remove access to every system on someone's last day.",
  },
  {
    id: "device_lock",
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
    category: "Devices",
    best: ["Yes"],
    severity: "Medium",
    title: "Lost devices can't be wiped remotely",
    why: "If a device is lost or stolen, the data on it stays exposed with no way to erase it.",
    action: "Turn on Find My (Apple), Find My Device (Android/Windows), or your Google/Microsoft device management.",
  },
  {
    id: "personal_devices",
    category: "Devices",
    best: ["No"],
    severity: "Medium",
    title: "Personal devices access business data",
    why: "You can't control the security of personal devices, so business data on them is harder to protect.",
    action: "Set basic rules for personal devices — screen lock, up-to-date software — or limit what they can access.",
  },
  {
    id: "auto_updates",
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
    category: "Software",
    best: ["No"],
    severity: "High",
    title: "Unsupported software may be in use",
    why: "Software the vendor no longer supports gets no security fixes, leaving permanent open doors.",
    action: "Identify any out-of-support software and plan to replace or upgrade it.",
  },
  {
    id: "backups_exist",
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
    category: "Backups",
    best: ["Yes"],
    severity: "High",
    title: "Backups are not stored separately",
    why: "Backups kept next to the original can be destroyed or encrypted in the same attack or accident.",
    action: "Keep at least one backup copy offsite or in a separate cloud account.",
  },
  {
    id: "backups_tested",
    category: "Backups",
    best: ["Yes"],
    severity: "Medium",
    title: "Backups have not been tested",
    why: "Many businesses only discover their backups don't work when they desperately need them.",
    action: "Restore a few files from backup every quarter to confirm it works.",
  },
  {
    id: "email_mfa",
    category: "Email",
    best: ["Yes"],
    severity: "Critical",
    title: "Email is not protected with MFA",
    why: "Your email resets every other password, so a hijacked inbox can lead to everything else.",
    action: "Turn on MFA for every mailbox in your email provider's admin settings.",
  },
  {
    id: "phishing_training",
    category: "Email",
    best: ["Yes"],
    severity: "Medium",
    title: "Staff are not trained to spot phishing",
    why: "Most attacks start with a convincing fake email; trained staff are your best early warning.",
    action: "Run a short phishing awareness session and share a simple 'how to spot a fake email' checklist.",
  },
  {
    id: "cloud_access_review",
    category: "Cloud",
    best: ["Yes"],
    severity: "Medium",
    title: "Cloud tool access is not reviewed",
    why: "Access tends to pile up over time, giving people more reach into your data than they need.",
    action: "Review who has access to Google Workspace, Microsoft 365, and other tools every quarter.",
  },
  {
    id: "third_party_apps",
    category: "Cloud",
    best: ["Yes"],
    severity: "Medium",
    title: "Third-party app access has not been checked",
    why: "Connected apps can quietly read your email and files, and some are risky or abandoned.",
    action: "Open your cloud admin's connected apps list and remove anything you don't recognize or use.",
  },
  {
    id: "https",
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
    category: "Website",
    best: ["Yes"],
    severity: "High",
    title: "Domain registrar account lacks MFA",
    why: "Whoever controls your domain controls your website and email; losing it can take you offline.",
    action: "Log in to your domain registrar and turn on MFA, then confirm the contact email is current.",
  },
];

export function riskLevelFor(score: number): RiskLevel {
  if (score >= 80) return "Low risk";
  if (score >= 50) return "Moderate risk";
  return "High risk";
}

export function scoreAssessment(answers: AssessmentAnswers): AssessmentResult {
  const findings: Finding[] = [];
  let earned = 0;
  let possible = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const rules = RULES.filter((r) => r.category === category && !r.na?.includes(answers[r.id] ?? ""));
    if (rules.length === 0) continue;
    possible += weight;
    const each = weight / rules.length;
    for (const r of rules) {
      const a = answers[r.id];
      if (a && r.best.includes(a)) earned += each;
      else if (a && r.partial?.includes(a)) earned += each / 2;
    }
  }

  for (const r of RULES) {
    const a = answers[r.id];
    if (a && (r.best.includes(a) || r.na?.includes(a))) continue;
    const partial = Boolean(a && r.partial?.includes(a));
    findings.push({
      id: r.id,
      severity: partial && r.partialSeverity ? r.partialSeverity : r.severity,
      category: r.category,
      title: r.title,
      why_it_matters: r.why,
      recommended_action: r.action,
      status: "Open",
    });
  }

  const order: Severity[] = ["Critical", "High", "Medium", "Low"];
  findings.sort((x, y) => order.indexOf(x.severity) - order.indexOf(y.severity));

  const score = possible ? Math.round((earned / possible) * 100) : 0;
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
