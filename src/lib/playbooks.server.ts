/** Extended step-by-step remediation playbooks (Starter Kit), keyed by finding title. */
const STEP_TEXT: Record<string, string[]> = {
  "No written security policy": [
    "Write a one-page policy covering passwords, MFA, device locks, backups and who to tell about a problem.",
    "Name one person who owns security decisions and reviews the policy every 6 months.",
    "Share it with every staff member and contractor and ask them to confirm they've read it.",
    "Store it somewhere everyone can find it, such as your shared drive.",
  ],
  "MFA is not enabled for all important accounts": [
    "List your critical accounts: email, banking, payroll, accounting, cloud storage, domain registrar.",
    "Turn on MFA in each account's security settings, preferring an authenticator app over SMS.",
    "Save the backup codes in your password manager or a locked safe.",
    "Where the service allows it, make MFA mandatory for all users in the admin console.",
    "Check monthly that new accounts also have MFA turned on.",
  ],
  "No password manager in use": [
    "Pick a business password manager (e.g. 1Password, Bitwarden) with team sharing.",
    "Create a strong master password and turn on MFA for the password manager itself.",
    "Move shared logins into shared vaults instead of spreadsheets or chats.",
    "Replace reused or weak passwords, starting with email and banking.",
  ],
  "Admin access is not limited to those who need it": [
    "Export the list of admin/owner users from each key system.",
    "Remove admin rights from anyone who doesn't need them day to day.",
    "Give admins a separate everyday account without admin rights.",
    "Review the admin list every quarter.",
  ],
  "Former staff access is not removed promptly": [
    "Create an offboarding checklist listing every system a person may have access to.",
    "On someone's last day, disable their accounts and change any shared passwords they knew.",
    "Collect company devices and wipe or reassign them.",
    "Review all active accounts now and remove anyone who has left.",
  ],
  "Not all business devices are locked": [
    "Require a PIN, password or biometric lock on every laptop, phone and tablet.",
    "Set screens to auto-lock after 5 minutes or less.",
    "Turn on disk encryption (BitLocker on Windows, FileVault on Mac; on by default on modern phones).",
    "Spot-check devices once a quarter.",
  ],
  "Lost devices can't be wiped remotely": [
    "Turn on Find My (Apple) or Find My Device (Google/Microsoft) on every device.",
    "For a team, enrol devices in a device management tool such as Microsoft Intune or Google Endpoint Management.",
    "Write down who to call and what to do when a device is lost.",
    "Test a remote lock on a spare device so you know it works.",
  ],
  "Personal devices access business data": [
    "Decide which business apps may be used on personal devices.",
    "Require a screen lock and up-to-date software on those devices.",
    "Use app-level controls (e.g. Microsoft or Google work profiles) so business data can be wiped separately.",
    "Have staff agree to the rules in writing.",
  ],
  "Software is not updated automatically": [
    "Turn on automatic updates for the operating system on every device.",
    "Turn on auto-update in browsers and key apps.",
    "Schedule restarts weekly so updates actually install.",
    "Check monthly that no device is more than one update behind.",
  ],
  "Unsupported software may be in use": [
    "List the operating systems and key apps in use and their versions.",
    "Check each against the vendor's support end date.",
    "Plan upgrades or replacements for anything out of support, highest-risk first.",
    "Until replaced, keep unsupported machines off the internet where possible.",
  ],
  "Important data is not reliably backed up": [
    "List the data you can't lose: accounting, customer records, contracts, email.",
    "Set up automatic daily backups (cloud backup service or a backup drive).",
    "Follow the 3-2-1 rule: 3 copies, 2 types of storage, 1 offsite.",
    "Get an alert when a backup fails.",
  ],
  "Backups are not stored separately": [
    "Keep at least one backup copy offsite or in a separate cloud account.",
    "Make sure the backup can't be deleted by the same login used daily.",
    "Turn on versioning or immutable backups if your service offers it.",
  ],
  "Backups have not been tested": [
    "Pick one important file and one full folder and restore them from backup.",
    "Time how long it takes and note any problems.",
    "Repeat a test restore every quarter.",
    "Write down the restore steps so someone else could do it.",
  ],
  "Email is not protected with MFA": [
    "Turn on MFA for every mailbox in Google Workspace or Microsoft 365.",
    "Enforce it in the admin console so new users can't skip it.",
    "Block legacy sign-in methods that bypass MFA (e.g. old IMAP/POP).",
    "Review sign-in alerts for unusual locations.",
  ],
  "Staff are not trained to spot phishing": [
    "Run a short (20-minute) session on spotting fake emails, links and invoice requests.",
    "Set a rule: payment or bank-detail changes are always confirmed by phone.",
    "Make reporting a suspicious email easy and blame-free.",
    "Repeat training twice a year, ideally with a practice phishing test.",
  ],
  "Cloud tool access is not reviewed": [
    "List the cloud tools you pay for or use (storage, CRM, accounting, chat).",
    "In each, export the user list and remove people who no longer need access.",
    "Check sharing settings and remove public links to sensitive files.",
    "Repeat the review every quarter.",
  ],
  "Third-party app access has not been checked": [
    "Open the connected-apps page in Google or Microsoft admin settings.",
    "Remove apps nobody recognises or uses.",
    "Restrict users from granting new apps access to company data without approval.",
    "Review connected apps every quarter.",
  ],
  "Website may not use HTTPS": [
    "Visit your site and check for the padlock in the browser address bar.",
    "If missing, turn on a free SSL certificate in your hosting dashboard (most hosts offer Let's Encrypt).",
    "Redirect all http:// traffic to https://.",
    "Set a reminder to confirm the certificate renews automatically.",
  ],
  "Domain registrar account lacks MFA": [
    "Log in to your domain registrar and turn on MFA.",
    "Turn on registrar lock (transfer lock) for your domain.",
    "Make sure the account email is one you control long-term, not a former employee's.",
    "Turn on auto-renew so the domain can't lapse.",
  ],
};

/** Per-step [time estimate, tool or setting], same order as STEP_TEXT. */
const STEP_META: Record<string, [string, string][]> = {
  "No written security policy": [["~45 min", "SecureCheck Security Policy Template or a shared doc"], ["~10 min", "Calendar reminder"], ["~15 min", "Email or team chat read-confirmation"], ["~5 min", "Google Drive / SharePoint shared folder"]],
  "MFA is not enabled for all important accounts": [["~15 min", "Spreadsheet or password manager list"], ["~10 min per account", "Account security settings + Google/Microsoft Authenticator"], ["~5 min", "Password manager secure note"], ["~15 min", "Google Admin / Microsoft Entra admin center"], ["~10 min monthly", "Admin console user list"]],
  "No password manager in use": [["~20 min", "1Password Business or Bitwarden Teams"], ["~10 min", "Password manager account settings"], ["~30 min", "Shared vaults / collections"], ["~1 hr", "Password health report (Watchtower / Vault Health)"]],
  "Admin access is not limited to those who need it": [["~15 min", "Admin console user roles page"], ["~15 min", "Google Admin roles / Microsoft Entra roles"], ["~20 min", "Separate standard user account"], ["~15 min quarterly", "Calendar reminder + admin role report"]],
  "Former staff access is not removed promptly": [["~30 min", "Offboarding checklist document"], ["~20 min per leaver", "Admin console suspend user + password manager"], ["~15 min", "Device management console or factory reset"], ["~30 min", "Admin console active users list"]],
  "Not all business devices are locked": [["~5 min per device", "Device settings → Lock screen / Touch ID / Face ID"], ["~2 min per device", "Display / screen lock settings"], ["~10 min per device", "BitLocker (Windows) / FileVault (Mac)"], ["~15 min quarterly", "Quick device walk-through"]],
  "Lost devices can't be wiped remotely": [["~5 min per device", "Find My (Apple) / Find My Device (Google, Microsoft)"], ["~1–2 hr", "Microsoft Intune / Google endpoint management"], ["~15 min", "Lost-device procedure document"], ["~10 min", "Find My / Intune remote lock"]],
  "Personal devices access business data": [["~20 min", "List of approved business apps"], ["~10 min per device", "Phone settings: screen lock + software update"], ["~30 min", "Android Work Profile / Microsoft Intune app protection / Google endpoint management"], ["~15 min", "Signed personal-device (BYOD) rules"]],
  "Software is not updated automatically": [["~5 min per device", "Windows Update / macOS Software Update"], ["~5 min per device", "Browser & app store auto-update settings"], ["~5 min", "Scheduled restart / active hours"], ["~15 min monthly", "Settings → About / device management report"]],
  "Unsupported software may be in use": [["~30 min", "Spreadsheet inventory"], ["~20 min", "Vendor lifecycle / end-of-support pages"], ["~30 min", "Upgrade plan document"], ["~15 min", "Network / Wi-Fi settings"]],
  "Important data is not reliably backed up": [["~20 min", "List of critical data"], ["~30 min", "Cloud backup service or external backup drive"], ["~30 min", "Second storage type + offsite/cloud copy"], ["~10 min", "Backup service email alerts"]],
  "Backups are not stored separately": [["~30 min", "Separate cloud account or offsite drive"], ["~15 min", "Separate backup login with MFA"], ["~10 min", "Versioning / immutable backup setting"]],
  "Backups have not been tested": [["~20 min", "Backup service restore function"], ["~5 min", "Restore log"], ["~10 min", "Quarterly calendar reminder"], ["~20 min", "Restore steps document"]],
  "Email is not protected with MFA": [["~10 min per user", "Google Workspace / Microsoft 365 security settings"], ["~10 min", "Google Admin 2-Step Verification / Microsoft Entra Security defaults"], ["~10 min", "Admin console: disable IMAP/POP / legacy auth"], ["~10 min weekly", "Admin console sign-in alerts"]],
  "Staff are not trained to spot phishing": [["~20 min", "Team meeting or short video session"], ["~5 min", "Written payment-verification rule"], ["~10 min", "'Report phishing' button or shared inbox"], ["~30 min twice a year", "Google / Microsoft phishing simulation or free trainer"]],
  "Cloud tool access is not reviewed": [["~20 min", "Spreadsheet of cloud tools"], ["~10 min per tool", "Each tool's users / members page"], ["~15 min", "Drive / SharePoint sharing report"], ["~30 min quarterly", "Calendar reminder"]],
  "Third-party app access has not been checked": [["~10 min", "Google Admin → Security → API controls / Microsoft Entra Enterprise apps"], ["~15 min", "Same connected-apps page"], ["~10 min", "App access control / user consent settings"], ["~15 min quarterly", "Calendar reminder"]],
  "Website may not use HTTPS": [["~2 min", "Web browser address bar"], ["~15 min", "Hosting dashboard SSL / Let's Encrypt"], ["~10 min", "Hosting redirect setting or .htaccess"], ["~5 min", "Calendar reminder + certificate expiry date"]],
  "Domain registrar account lacks MFA": [["~10 min", "Registrar account security settings"], ["~5 min", "Registrar domain lock setting"], ["~5 min", "Registrar account contact email"], ["~5 min", "Registrar auto-renew setting"]],
};

export interface PlaybookStep { text: string; time: string; tool: string }

export const PLAYBOOKS: Record<string, PlaybookStep[]> = Object.fromEntries(
  Object.entries(STEP_TEXT).map(([title, steps]) => [
    title,
    steps.map((text, i) => ({ text, time: STEP_META[title]?.[i]?.[0] ?? "~15 min", tool: STEP_META[title]?.[i]?.[1] ?? "" })),
  ]),
);
