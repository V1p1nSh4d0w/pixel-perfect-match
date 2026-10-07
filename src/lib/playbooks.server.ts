import { sectionForPlaybookText, type PlaybookSection } from "@/lib/playbook-content";

/** Central remediation playbooks, keyed by finding title. */
const STEP_TEXT: Record<string, string[]> = {
  "No written security policy": [
    "Find it — Gather the current security rules, responsibilities and gaps that staff need to know.",
    "Fix it — Use the policy template to assign a named owner for account/MFA, device locks, backup recovery and incident reporting. Record the approved rules and the next review date.",
    "Verify it — Ask a staff member to find the policy and explain how to report a concern. Keep the item as Worth reviewing if the policy is not approved, shared or understood.",
  ],
  "MFA is not enabled for all important accounts": [
    "Find it — Make a list of important accounts and locate each service's multi-factor or two-step sign-in control.",
    "Fix it — Enrol an authenticator app, passkey or security key for each account. Require MFA for staff where the service supports it, and store recovery codes securely.",
    "Verify it — Sign out and confirm each account asks for the second factor. Keep it as Worth reviewing if any account or staff member cannot be checked.",
  ],
  "No password manager in use": [
    "Find it — Identify where work passwords are stored and choose a password manager that supports secure team sharing.",
    "Fix it — Create role-based team vaults, protect the owner account with MFA, then import shared logins and rotate reused passwords for email and finance first.",
    "Verify it — Confirm each authorised person can access only the needed vaults and that no work passwords remain in spreadsheets or chats. Keep it as Worth reviewing if you cannot check every shared login.",
  ],
  "Admin access is not limited to those who need it": [
    "Find it — Review administrator and owner roles in each important service.",
    "Fix it — Remove elevated roles from people who do not need them. Give administrators a separate standard account for routine work where supported.",
    "Verify it — Compare the remaining admins with the people responsible for managing each service, then schedule a quarterly review. Keep it as Worth reviewing if an unfamiliar role or account remains.",
  ],
  "Former staff access is not removed promptly": [
    "Find it — Check current users, shared vaults, groups, active sessions and company devices for anyone who has left.",
    "Fix it — Disable their accounts and sessions, remove group and app access, rotate shared passwords they knew, and recover or securely wipe company devices.",
    "Verify it — Recheck the user and device lists and confirm no former staff account can sign in. Keep it as Worth reviewing if a system owner or access list is unavailable.",
  ],
  "Not all business devices are locked": [
    "Find it — Check the lock and automatic screen-lock settings on every work laptop, phone and tablet.",
    "Fix it — Set a short idle-lock timeout, require a PIN/password/biometric after sleep, and enable supported device encryption. Store its recovery key securely.",
    "Verify it — Lock each device and confirm it requires authentication to reopen. Keep it as Worth reviewing if you cannot inspect a device or confirm encryption.",
  ],
  "Lost devices can't be wiped remotely": [
    "Find it — Identify each work device and the account or management service that can locate, lock or erase it.",
    "Fix it — Link each device to the authorised work or owner account, enable its available locate/lock/erase controls, and name who can act when it is reported lost.",
    "Verify it — Confirm the device appears in the authorised management account and that its available lock or erase action is documented. Keep it as Worth reviewing if you cannot safely verify the service or response owner.",
  ],
  "Personal devices access business data": [
    "Find it — List the personal devices and work apps that can access company information.",
    "Fix it — Set minimum screen-lock and update requirements. Separate work data with a managed work profile or app protection where available, and document what the company can remove.",
    "Verify it — Check that each approved device meets the rules and that work data can be removed without erasing personal data where promised. Keep it as Worth reviewing if the separation or wipe boundary is unclear.",
  ],
  "Software is not updated automatically": [
    "Find it — Check update settings for each operating system, browser and important app in use.",
    "Fix it — In each update screen, enable automatic download and installation, allow required restarts, and remove update pauses that are no longer needed. Use each browser/app's own updater where separate.",
    "Verify it — Check the update screen or device report for successful recent updates and no pending security restart. Keep it as Worth reviewing if a device is offline, unmanaged or still behind.",
  ],
  "Unsupported software may be in use": [
    "Find it — Record the operating system and version of each device and the versions of important apps.",
    "Fix it — Check the vendor's support lifecycle. Upgrade or replace unsupported software, prioritising devices that hold sensitive data; restrict network access until replacement if practical.",
    "Verify it — Confirm the installed version is still supported or that the replacement plan has an owner and date. Keep it as Worth reviewing while unsupported software remains.",
  ],
  "Important data is not reliably backed up": [
    "Find it — List the business files and services that must be recoverable, and identify their current backup location and schedule.",
    "Fix it — Select the listed files and systems in the backup service, set a daily schedule, and enable failure alerts. Send a copy to a separate location protected from everyday accounts.",
    "Verify it — Check the backup service's latest successful run and confirm a sample file can be restored. Keep it as Worth reviewing if a backup is missing, stale or untested.",
  ],
  "Backups are not stored separately": [
    "Find it — Locate each backup and check whether it shares the original device, account or deletion permissions.",
    "Fix it — Change the backup destination to an offsite location or separate cloud account. Use a distinct login with MFA, and enable versioning or deletion protection when supported.",
    "Verify it — Confirm the separate copy exists and an everyday account cannot delete every copy. Keep it as Worth reviewing if separation or access controls cannot be confirmed.",
  ],
  "Backups have not been tested": [
    "Find it — Identify the backup service, the most important files, and the restore location that will not overwrite current data.",
    "Fix it — Restore a sample file and folder to a safe location. Open them to check their contents, note any errors, and assign an owner for repeat tests.",
    "Verify it — Confirm the restored files open and match what is needed, then record the test date and next test date. Keep it as Worth reviewing if the restore failed or was incomplete.",
  ],
  "Email is not protected with MFA": [
    "Find it — Check the sign-in security settings and user list for every business mailbox.",
    "Fix it — Enrol MFA for each mailbox and enforce it for staff through the organisation's identity controls. Disable legacy sign-in methods only after confirming no required mail client depends on them.",
    "Verify it — Confirm users are enrolled and a sign-in requires MFA. Review sign-in records for exceptions; keep it as Worth reviewing if any mailbox or legacy client is unverified.",
  ],
  "Staff are not trained to spot phishing": [
    "Find it — Check whether staff know how to report suspicious messages and independently verify payment or bank-detail changes.",
    "Fix it — Run a short practical session on unexpected links, attachments, urgent payment requests and reporting. Require a known phone number or separate trusted channel to verify payment changes.",
    "Verify it — Ask staff to describe how they would report a suspicious message and verify a payment change. Keep it as Worth reviewing if the reporting route or training coverage is unclear.",
  ],
  "Cloud tool access is not reviewed": [
    "Find it — List the cloud services that hold business data and review each service's users, groups and shared links.",
    "Fix it — Remove accounts and public links that are no longer needed, and limit access to the people who need it. Preserve an owner account for each service.",
    "Verify it — Recheck user and sharing lists, then set a quarterly review date. Keep it as Worth reviewing if a service owner cannot confirm who should retain access.",
  ],
  "Third-party app access has not been checked": [
    "Find it — Open the connected-app or enterprise-app list for each important business account and review the permissions granted.",
    "Fix it — Revoke access for apps that are unused, unrecognised or request more data than they need. Restrict new app consent where the service allows it.",
    "Verify it — Confirm the unnecessary connection is no longer listed and review the remaining permissions with the service owner. Keep it as Worth reviewing if an app's owner or purpose is unknown.",
  ],
  "Website may not use HTTPS": [
    "Find it — Open the public website in a browser and check whether its address begins with https:// and loads without a certificate warning.",
    "Fix it — Ask the hosting provider to issue or renew a TLS certificate, then redirect HTTP requests to HTTPS. Do not enter information while a certificate warning is shown.",
    "Verify it — Test the HTTPS address and an HTTP address in a browser; both should load securely without certificate warnings. Keep it as Worth reviewing if the warning persists or redirects are inconsistent.",
  ],
  "Domain registrar account lacks MFA": [
    "Find it — Locate the domain registrar account, its security settings and the person who controls its recovery email.",
    "Fix it — Enrol MFA, enable the registrar's domain or transfer lock, confirm the recovery email is controlled by the business, and turn on renewal reminders or auto-renew.",
    "Verify it — Sign in again to confirm MFA is required and check that the domain lock and renewal status are active. Keep it as Worth reviewing if ownership, recovery or renewal cannot be confirmed.",
  ],
};

/** Per-step [time estimate, location or resource], same order as STEP_TEXT. */
const STEP_META: Record<string, [string, string][]> = {
  "No written security policy": [["~15 min", "Current procedures and staff responsibilities"], ["~45 min", "Security policy template or shared document"], ["~15 min", "Staff confirmation and review calendar"], ["~10 min semi-annually", "Policy owner and review calendar"]],
  "MFA is not enabled for all important accounts": [["~15 min", "Account inventory and each service's MFA status"], ["~10 min per account", "WHERE TO FIND IT — Each service: Account/Profile → Security or Sign-in → MFA/2-step verification (labels vary)"], ["~5 min per account", "Fresh sign-in and recovery-code check"], ["~10 min", "New-account enrollment checklist"], ["~10 min monthly", "Account inventory and MFA enrollment review"]],
  "No password manager in use": [["~20 min", "Password manager comparison and current password locations"], ["~30 min", "Password manager team vault and account security settings"], ["~15 min", "Team vault access review and password storage check"], ["~10 min", "New shared logins and team membership changes"]],
  "Admin access is not limited to those who need it": [["~15 min", "WHERE TO FIND IT — Google Admin: Directory → Users; Microsoft Entra: Identity → Users → All users; then review assigned roles"], ["~15 min", "Each service's user and role controls"], ["~15 min quarterly", "Admin list and calendar reminder"], ["~10 min", "Quarterly role review reminder"]],
  "Former staff access is not removed promptly": [["~30 min", "WHERE TO FIND IT — Each service's Users/Members, groups, sessions and managed-device lists"], ["~20 min per person", "Admin console, identity provider and password manager"], ["~15 min", "Rechecked users, active sessions and device list"], ["~10 min", "Offboarding checklist and system-owner confirmations"]],
  "Not all business devices are locked": [["~5 min per device", "WHERE TO FIND IT — Windows: Settings → Accounts → Sign-in options; macOS: System Settings → Lock Screen; iPhone/iPad: Settings → Face ID/Touch ID & Passcode; Android: Settings → Security/Screen lock (names vary)"], ["~10 min per device", "WHERE TO FIND IT — Windows: Settings → Privacy & security → Device encryption (if available); macOS: System Settings → Privacy & Security → FileVault"], ["~5 min per device", "Lock-screen and encryption status on the device"], ["~15 min quarterly", "Device inventory and lock-screen review"]],
  "Lost devices can't be wiped remotely": [["~10 min per device", "WHERE TO FIND IT — Apple Find My; Google Find My Device; Microsoft Intune or the current device-management console"], ["~1–2 hr", "Device-management console and written response procedure"], ["~10 min", "Authorised device list and documented lock/erase procedure"], ["~10 min", "Device issue/return checklist"]],
  "Personal devices access business data": [["~20 min", "Approved app list and staff device inventory"], ["~30 min", "WHERE TO FIND IT — Android: Settings → Security & privacy → Work profile (if configured); Microsoft Intune or Google admin console: app protection/device management"], ["~15 min", "Device compliance and work-data removal policy"], ["~10 min", "Staff onboarding and approved-device list"]],
  "Software is not updated automatically": [["~10 min per device", "WHERE TO FIND IT — Windows: Settings → Windows Update; macOS: System Settings → General → Software Update; Chrome: ⋮ → Help → About Google Chrome; Edge: … → Help and feedback → About Microsoft Edge; Firefox: ☰ → Help → About Firefox; Safari: macOS Software Update"], ["~5 min per device", "WHERE TO FIND IT — Operating system update controls and each browser/app's update settings"], ["~15 min monthly", "Update screen or device-management report"], ["~10 min", "Monthly update status report or reminder"]],
  "Unsupported software may be in use": [["~30 min", "Device and software inventory"], ["~20 min", "Each software vendor's lifecycle/support page"], ["~15 min", "Installed version and upgrade plan"], ["~10 min", "Upgrade owner and target date"]],
  "Important data is not reliably backed up": [["~20 min", "Critical-data inventory and backup dashboard"], ["~30 min", "Backup service settings and a separate storage location"], ["~15 min", "Latest backup report and safe restore test"], ["~10 min", "Backup alert settings and schedule"]],
  "Backups are not stored separately": [["~30 min", "WHERE TO FIND IT — Backup service destination, storage account and access-control settings"], ["~30 min", "Separate account, offsite drive or cloud storage"], ["~15 min", "Backup permissions and version history"]],
  "Backups have not been tested": [["~10 min", "Backup dashboard and a safe restore destination"], ["~20 min", "WHERE TO FIND IT — Backup service → Restore/Recover (label varies by provider)"], ["~10 min", "Restore log and next-test reminder"], ["~10 min quarterly", "Calendar reminder and restore log"]],
  "Email is not protected with MFA": [["~10 min per user", "Google Workspace or Microsoft 365 user and sign-in security settings"], ["~15 min", "WHERE TO FIND IT — Google Admin: Security → Authentication → 2-Step Verification; Microsoft Entra: Protection → Authentication methods or Security defaults"], ["~10 min", "Fresh mailbox sign-in and sign-in report"], ["~10 min", "New-mailbox enrollment process"]],
  "Staff are not trained to spot phishing": [["~10 min", "Staff reporting route and payment-change process"], ["~20 min", "Team session, safe examples and reporting instructions"], ["~10 min", "Staff walkthrough and training record"], ["~30 min twice a year", "Training calendar and reporting instructions"]],
  "Cloud tool access is not reviewed": [["~20 min", "Cloud-service inventory and each service's user list"], ["~10 min per service", "WHERE TO FIND IT — Each service: Admin/Settings → Users, Members, Groups or Sharing"], ["~15 min quarterly", "Updated access lists and review calendar"], ["~10 min", "Quarterly access-review reminder"]],
  "Third-party app access has not been checked": [["~10 min", "WHERE TO FIND IT — Google Admin: Security → Access and data control → API controls; Microsoft Entra: Identity → Applications → Enterprise applications"], ["~15 min", "Connected-app permissions and consent controls"], ["~15 min", "Remaining app list and service-owner review"], ["~10 min quarterly", "Connected-app review reminder"]],
  "Website may not use HTTPS": [["~2 min", "Browser address bar and certificate status"], ["~15 min", "WHERE TO FIND IT — Website hosting dashboard → SSL/TLS or Certificates; labels vary by host"], ["~5 min", "Browser checks for HTTPS and HTTP addresses"], ["~5 min", "Certificate renewal reminder"]],
  "Domain registrar account lacks MFA": [["~10 min", "WHERE TO FIND IT — Registrar account → Security/Sign-in settings and account recovery details"], ["~10 min", "Registrar account security and domain management settings"], ["~5 min", "New sign-in and domain lock/renewal status"], ["~5 min", "Renewal date and account recovery reminder"]],
};

export interface PlaybookStep { text: string; time: string; tool: string; section?: PlaybookSection }

export const PLAYBOOKS: Record<string, PlaybookStep[]> = Object.fromEntries(
  Object.entries(STEP_TEXT).map(([title, steps]) => [
    title,
    steps.map((text, i) => ({
      text,
      time: STEP_META[title]?.[i]?.[0] ?? "~15 min",
      tool: STEP_META[title]?.[i]?.[1] ?? "",
      ...(sectionForPlaybookText(text) ? { section: sectionForPlaybookText(text)! } : {}),
    })),
  ]),
);
