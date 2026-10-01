// Server-only template content. Preview text is derived from this; the full PDFs
// live in the private "templates" storage bucket and are only reachable via
// short-lived signed URLs issued after a server-side Starter Kit check.

export interface TemplateDef {
  name: string;
  file: string;
  sections: { heading: string; body: string[] }[];
}

export const TEMPLATES: Record<string, TemplateDef> = {
  policy: {
    name: "Security Policy Template",
    file: "security-policy-template.pdf",
    sections: [
      { heading: "1. Purpose", body: ["This policy sets the minimum security rules everyone at [Business Name] follows to protect customer data, money, and systems.", "It applies to all staff, contractors, and anyone using business accounts or devices."] },
      { heading: "2. Passwords", body: ["Use a password manager. Every account gets a unique password of at least 14 characters.", "Never share passwords by email, chat, or paper. Change a password immediately if you think it was exposed."] },
      { heading: "3. Multi-factor authentication", body: ["MFA is required on email, banking, accounting, cloud storage, and any admin account.", "Prefer an authenticator app or security key over SMS codes."] },
      { heading: "4. Devices", body: ["Every laptop and phone used for work must lock with a PIN, password, or biometrics after 5 minutes.", "Install updates within 7 days. Lost or stolen devices must be reported within 1 hour."] },
      { heading: "5. Email and links", body: ["Treat unexpected payment requests, invoices, and login links as suspicious until verified by phone.", "Never change bank details based on an email alone."] },
      { heading: "6. Data and backups", body: ["Important business data is backed up automatically every day, with one copy stored separately.", "Restores are tested every quarter by [Owner]."] },
      { heading: "7. Access", body: ["People get access only to what they need. Access is removed on the last working day when someone leaves."] },
      { heading: "8. Reporting incidents", body: ["If something looks wrong, tell [Contact Name] at [Phone] immediately. Reporting quickly is never punished.", "Do not try to fix a suspected breach alone or delete evidence."] },
      { heading: "9. Review and sign-off", body: ["This policy is reviewed every 12 months.", "Employee name: ______________  Signature: ______________  Date: ________"] },
    ],
  },
  mfa: {
    name: "MFA Rollout Guide",
    file: "mfa-rollout-guide.pdf",
    sections: [
      { heading: "1. Why MFA first", body: ["Most small-business account takeovers start with a stolen or reused password. MFA blocks the large majority of these attacks.", "This guide rolls MFA out in one week with minimal disruption."] },
      { heading: "2. List your critical accounts", body: ["Email (Google Workspace / Microsoft 365), banking, accounting, payroll, domain registrar, website admin, cloud storage, social media.", "Write down who owns each account and which admin can enforce MFA."] },
      { heading: "3. Choose the method", body: ["Best: hardware security keys or passkeys. Good: authenticator apps (Google Authenticator, Microsoft Authenticator, Authy). Last resort: SMS."] },
      { heading: "4. Day 1-2: Admins and owners", body: ["Enable MFA on all admin and owner accounts first. Save backup codes in your password manager or a locked safe."] },
      { heading: "5. Day 3-4: Email for everyone", body: ["Announce the change, share a 5-minute setup guide, and set an enforcement date in the email admin console."] },
      { heading: "6. Day 5: Finance and banking", body: ["Turn on MFA for banking, payment, and accounting tools. Require approval for any new payee."] },
      { heading: "7. Day 6-7: Everything else", body: ["Cover the remaining accounts on your list. Mark each one done."] },
      { heading: "8. Handling lost phones", body: ["Define who can reset MFA, how identity is verified (video call or in person), and never reset based on email alone."] },
      { heading: "9. Checklist", body: ["[ ] Admin accounts  [ ] Email enforced  [ ] Banking  [ ] Accounting  [ ] Registrar  [ ] Website  [ ] Cloud storage  [ ] Backup codes stored"] },
    ],
  },
  backup: {
    name: "Backup & Restore Checklist",
    file: "backup-restore-checklist.pdf",
    sections: [
      { heading: "1. What to back up", body: ["Customer records, invoices and accounting data, email, shared files, website files and database, key contracts.", "List where each one lives today."] },
      { heading: "2. The 3-2-1 rule", body: ["Keep 3 copies of important data, on 2 different types of storage, with 1 copy offsite or in a separate cloud account."] },
      { heading: "3. Set up automation", body: ["[ ] Daily automatic backup enabled  [ ] Backup account uses a different password and MFA  [ ] Alerts on failed backups go to [Owner]"] },
      { heading: "4. Protect against ransomware", body: ["At least one copy should be immutable or disconnected so malware cannot encrypt or delete it.", "Keep 30 days of versions."] },
      { heading: "5. Quarterly restore test", body: ["Pick 3 random files and one full folder. Restore them to a test location and open them.", "Record date, what was restored, time taken, and any problems."] },
      { heading: "6. Disaster scenario", body: ["Once a year, time how long it takes to get a laptop working from scratch with business data restored."] },
      { heading: "7. Roles", body: ["Backup owner: __________  Deputy: __________  Provider support contact: __________"] },
      { heading: "8. Restore log", body: ["Date | Data restored | Result | Time taken | Notes", "______ | ______ | ______ | ______ | ______"] },
    ],
  },
};

/** Maps finding titles (from scoring) to template keys. Other findings get no template. */
export const FINDING_TEMPLATE: Record<string, keyof typeof TEMPLATES> = {
  "No written security policy": "policy",
  "MFA is not enabled for all important accounts": "mfa",
  "Important data is not reliably backed up": "backup",
  "Backups have not been tested": "backup",
};

/** Roughly the first 20% of the template, by section count. */
export function templatePreview(def: TemplateDef) {
  const count = Math.max(1, Math.round(def.sections.length * 0.2));
  return { name: def.name, sections: def.sections.slice(0, count), totalSections: def.sections.length };
}
