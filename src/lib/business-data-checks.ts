import type { GuidedCheck } from "@/components/GuidedCheckFlow";
import { TEAM_SIZES } from "@/lib/business-onboarding";

/** minTeam: index into TEAM_SIZES (0 = everyone, incl. "Just me"). `solo` overrides wording for "Just me". */
export type BusinessDataCheck = GuidedCheck & { minTeam: number; solo?: Partial<Pick<GuidedCheck, "title" | "what" | "where" | "review">> };

const C = "Data & Backups";

export const BUSINESS_DATA_CHECKS: BusinessDataCheck[] = [
  {
    id: "important-data", category: C, quick: true, minTeam: 0, style: "businessKnow",
    title: "Knowing which data matters most",
    what: "Whether the business knows which data would seriously disrupt work if it were lost — for example customer records, invoices and accounts, orders, patient or student records, contracts and key documents.",
    why: "You can only protect and back up what you know is important. A short list makes every other backup decision easier.",
    where: "List the 5–10 kinds of information you couldn't work without, and where each one lives (a computer, a cloud drive, an accounting app, email, a website).",
    review: "Recommended improvement: write down your most important data and where it is stored. Keep the list itself — never upload the data into this checkup.",
    solo: { what: "Whether you know which files and information would seriously disrupt your work if lost — for example client records, invoices, accounts, contracts and key documents." },
  },
  {
    id: "coverage", findingKey: "business_data_not_backed_up", category: C, quick: true, minTeam: 0, style: "businessKnow",
    title: "Important data is backed up",
    what: "Whether each kind of important data has a backup — a separate copy you could restore from.",
    why: "Sync is not the same as a backup. Files in Google Drive, OneDrive or Dropbox are synced, so a deletion, overwrite or ransomware change can sync too. A backup (or version history you can roll back) lets you recover an earlier copy.",
    where: "For each item on your important-data list, check whether there's a separate backup, or a version history/trash that keeps earlier copies long enough. Online apps (such as accounting software) may have their own export or backup options.",
    review: "Recommended improvement: make sure every kind of important data has a real backup or recoverable version history — not just a synced copy.",
  },
  {
    id: "restore", category: C, quick: true, minTeam: 0, style: "businessKnow",
    title: "Knowing how to restore from backup",
    what: "Whether the business knows the steps to get important data back from its backups, and who would do it.",
    why: "A backup only helps if you can actually restore from it when needed. Working out the steps during an emergency is slow and stressful.",
    where: "For your most important data, check where the backup is, how to open it, and who has the access needed to restore it.",
    review: "Recommended improvement: note the restore steps for your key data and who is responsible for them.",
    solo: { what: "Whether you know the steps to get your important data back from your backups." },
  },
  {
    id: "separation", findingKey: "business_backups_not_separate", category: C, quick: true, minTeam: 0, style: "businessKnow",
    title: "Backups kept apart from the original data",
    what: "Whether backups are reasonably separated from the original — for example on a different service, account or device, or an external drive that isn't always connected.",
    why: "If the backup sits on the same computer or account as the original, one incident (theft, failure, ransomware, a compromised account) can affect both.",
    where: "Check where each backup is stored. A backup on the same laptop, or in the same synced folder, isn't well separated.",
    review: "Recommended improvement: keep at least one backup of important data in a separate place or account. Having backups helps, but it doesn't guarantee recovery — check them regularly.",
  },
  {
    id: "sharing", category: C, quick: true, minTeam: 0, style: "business",
    title: "Sensitive files shared only with people who need them",
    what: "Whether sensitive business files and folders in cloud storage are shared only with the people who need access.",
    why: "Old shares, 'anyone with the link' settings and access given to past contractors can expose sensitive files without anyone noticing.",
    where: "In Google Drive, OneDrive, Dropbox or similar, open the sharing details of sensitive folders and look for public links, outside email addresses, or people who no longer need access.",
    review: "Recommended improvement: remove sharing that's no longer needed and avoid public links for sensitive files.",
    solo: { what: "Whether your sensitive files and folders in cloud storage are shared only with the people (such as clients or your accountant) who need them." },
  },
  {
    id: "sensitive", category: C, quick: true, minTeam: 0, style: "business",
    title: "Knowing where sensitive information is and who can see it",
    what: "Whether the business knows where sensitive information is stored — for example ID documents, bank details, health or student records, passwords lists or contracts — and who can access it.",
    why: "Sensitive information spread across laptops, email attachments, chats and downloads folders is hard to protect.",
    where: "Think about where sensitive files usually end up, including email, chat apps, downloads folders and personal devices, and who can open those places.",
    review: "Recommended improvement: keep sensitive information in a few known places with limited access.",
  },
  // ---- Deep Check only ----
  {
    id: "frequency", category: C, quick: false, minTeam: 0, style: "business",
    title: "Backing up often enough",
    what: "Whether important files and systems are backed up often enough for how quickly they change.",
    why: "If the last backup is a month old, everything since then could be lost. How often is 'enough' depends on how much work you could afford to redo.",
    where: "Check when the last backup of each important item ran, and whether backups run automatically.",
    review: "Recommended improvement: set backups to run automatically, with frequency matched to how much data you could afford to lose.",
  },
  {
    id: "locations", category: C, quick: false, minTeam: 0, style: "business",
    title: "Backup copies in more than one place",
    what: "Whether there are appropriate backup copies in more than one location or storage system for your most important data.",
    why: "A single backup can fail, be deleted or become unavailable. A second copy somewhere else adds resilience.",
    where: "For your most important data, count the copies and where they live — for example the original, a cloud backup and an external drive kept elsewhere.",
    review: "Recommended improvement: for the most important data, keep more than one backup in different places. Not every file needs this — focus on what's irreplaceable.",
  },
  {
    id: "restore-test", findingKey: "business_backups_not_tested", category: C, quick: false, minTeam: 0, style: "business",
    title: "Testing a restore",
    what: "Whether the business has actually tried restoring some important data from a backup.",
    why: "Backups can be incomplete, out of date or unreadable without anyone noticing. A test restore is the only way to know it works — and shows how long recovery takes.",
    where: "Pick a few important files and restore them to a separate location from your backup, then check they open correctly.",
    review: "Recommended improvement: test a restore periodically, restoring to a separate location so you don't overwrite current files.",
    solo: { what: "Whether you've actually tried restoring some of your important files from a backup." },
  },
  {
    id: "backup-access", category: C, quick: false, minTeam: 0, style: "business",
    title: "Protecting access to backups",
    what: "Whether backup accounts and storage are protected with appropriate access controls, and MFA where supported.",
    why: "If someone can sign in to the backup account, they may be able to read or delete the backups too.",
    where: "Check the backup service's account security settings for MFA, and who has access. For external drives, consider where they're kept and whether they're encrypted. Never enter backup passwords or keys into this checkup.",
    review: "Recommended improvement: turn on MFA for backup accounts and limit who can access or delete backups.",
  },
  {
    id: "old-copies", category: C, quick: false, minTeam: 0, style: "business",
    title: "Reviewing old copies and data you no longer need",
    what: "Whether the business periodically reviews old copies of sensitive data — such as old exports, downloads and email attachments — and removes what no longer needs to be kept.",
    why: "Less unnecessary sensitive data means less to protect and less that could be exposed.",
    where: "Look at downloads folders, old exports, shared drives and email attachments for duplicate or outdated sensitive files.",
    review: "Recommended improvement: periodically review old copies. Before deleting anything, check legal, tax, accounting or industry rules on how long records must be kept.",
  },
  {
    id: "priorities", category: C, quick: false, minTeam: 0, style: "business",
    title: "Knowing what to restore first",
    what: "Whether the business knows which data and systems need to be restored first if something goes wrong.",
    why: "In a recovery you can't do everything at once. Knowing the order helps get the business working again sooner.",
    where: "Rank your important data and systems by how quickly you'd need them back — for example within hours, within a day, or within a week.",
    review: "Recommended improvement: write down your recovery order and who handles each item.",
    solo: { what: "Whether you know which data and systems you'd need to get back first if something went wrong." },
  },
];

export function dataChecksFor(teamSize: string, mode: "quick" | "deep"): GuidedCheck[] {
  const idx = Math.max(0, TEAM_SIZES.indexOf(teamSize as (typeof TEAM_SIZES)[number]));
  const solo = teamSize === "Just me";
  return BUSINESS_DATA_CHECKS
    .filter((c) => c.minTeam <= idx && (mode === "deep" || c.quick))
    .map(({ solo: s, minTeam: _m, ...c }) => (solo && s ? { ...c, ...s } : c));
}
