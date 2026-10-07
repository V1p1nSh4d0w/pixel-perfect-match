import type { CheckupItem } from "@/lib/checkup-results";

export type PlaybookSection = "WHERE TO FIND IT" | "WHAT TO CHANGE" | "VERIFY" | "KEEP IT CURRENT";

export interface CheckupPlaybookStep {
  section: PlaybookSection;
  text: string;
  time: string;
  tool: string;
}

type CheckupItemContent = Pick<CheckupItem, "id" | "title" | "category" | "where" | "review">;

interface RemediationContent {
  where?: string;
  action?: string;
  verify?: string;
  recommendation?: string;
}

/** Finding-specific guidance for checks where a generic location or verification would be misleading. */
const REMEDIATION_CONTENT: Record<string, RemediationContent> = {
  "Suspicious links": {
    where: "In the message, email, text or webpage containing the link. On a computer, hover over it without clicking; on a phone, press and hold to preview its destination.",
    action: "Do not open an unexpected link. Compare its real domain with an address you already trust. If unsure, open the organisation's official website or app directly.",
    verify: "For future unexpected links, check the destination before opening it and use the official website or app whenever the address is uncertain.",
    recommendation: "Check unexpected links before opening them, and use the official site or app when unsure.",
  },
  "Fake CAPTCHA instructions": {
    where: "On the webpage showing the CAPTCHA or instructions. There is no device setting to change for this situation.",
    action: "Do not paste commands, open Run or Terminal, or install anything the page requests. Close the tab. If you already followed the instructions, disconnect from the site and ask a trusted support person to check the device.",
    verify: "Confirm you did not run a command or install a file from the page. If you did, keep this as Worth reviewing until the device has been checked.",
    recommendation: "Never run commands or install files requested by an unexpected CAPTCHA page.",
  },
  "Browser extensions": {
    where: "Chrome: ⋮ → Extensions → Manage extensions (or chrome://extensions). Edge: … → Extensions → Manage extensions. Firefox: ☰ → Add-ons and themes → Extensions. Safari: Safari → Settings → Extensions.",
    action: "Search for extensions you do not recognise before removing them. Remove extensions you cannot identify or no longer need; keep only ones you chose and trust.",
    verify: "Reopen the extensions list and confirm the unwanted add-ons are gone. Check that the browser still works as expected.",
    recommendation: "Keep only browser extensions you recognise, trust and still use.",
  },
  "Extensions with broad permissions": {
    where: "Open each browser's extensions page, choose Details for an extension, then review Site access or Permissions. Chrome: chrome://extensions. Edge: edge://extensions. Firefox: about:addons.",
    action: "Limit site access to specific sites or On click when available. Remove an extension if broad access is unnecessary or you cannot confirm why it needs it.",
    verify: "Return to each extension's Details page and confirm its site access matches the sites it needs. Keep it as Worth reviewing if the reason for broad access is unclear.",
    recommendation: "Limit extensions to the sites they need, and remove ones with unexplained broad access.",
  },
  "Website notification permissions": {
    where: "Chrome: ⋮ → Settings → Privacy and security → Site settings → Notifications. Edge: … → Settings → Cookies and site permissions → Notifications. Firefox: ☰ → Settings → Privacy & Security → Permissions → Notifications. Safari on Mac: Safari → Settings → Websites → Notifications.",
    action: "Under Allowed, remove websites you do not recognise or no longer want to hear from. Leave notification access on only for sites you trust and use.",
    verify: "Reopen the Allowed list and confirm the unwanted websites are no longer listed. Keep it as Worth reviewing if you cannot identify a site's owner.",
    recommendation: "Remove notification permission for websites you do not recognise or need.",
  },
  "Security protection (antivirus) on business computers": {
    where: "Windows: Start → Windows Security → Virus & threat protection. Mac: Apple menu → System Settings → General → Software Update to check macOS updates; review any separate security app directly.",
    action: "Confirm protection is turned on and its last update is current on each business computer. Follow the security product's own warning or recovery guidance; do not install a second product just to clear a warning.",
    verify: "Reopen the security app on each computer and check that protection is active with no unresolved warning. Keep it as Worth reviewing if a device or its security status cannot be checked.",
    recommendation: "Keep trusted security protection active and up to date on each business computer.",
  },
  "A business device firewall needs review": {
    where: "Windows: Start → Windows Security → Firewall & network protection. Mac: Apple menu → System Settings → Network → Firewall.",
    action: "Turn on the built-in firewall for each business computer. If a work app needs a connection, allow that app specifically instead of turning the firewall off.",
    verify: "Reopen the firewall page and confirm it is on for the active network. Keep it as Worth reviewing if the setting is managed by your organisation or IT provider.",
    recommendation: "Turn on the built-in firewall for each business computer.",
  },
  "Encryption on business devices needs review": {
    where: "Windows: Settings → Privacy & security → Device encryption, or Windows Security → Device encryption/BitLocker. Mac: Apple menu → System Settings → Privacy & Security → FileVault.",
    action: "Enable encryption on supported devices that hold business data. Store the recovery key in an approved secure location; never share it in this checkup.",
    verify: "Return to the encryption page and confirm encryption is on. Confirm the recovery key is stored securely without copying it into this checkup. Keep it as Worth reviewing if encryption is unavailable or the key cannot be accounted for.",
    recommendation: "Encrypt supported devices that store business data and protect their recovery keys.",
  },
  "Remote access": {
    where: "Windows: Settings → System → Remote Desktop, and Settings → Apps → Installed apps for remote-support tools. Mac: System Settings → General → Sharing; review Screen Sharing, Remote Login and Remote Management.",
    action: "Turn off remote access you do not use. For access you need, keep only approved tools and users, require strong sign-in and MFA, and confirm with your IT provider before removing managed software.",
    verify: "Reopen the remote-access settings and confirm unused options are off and required tools have named, authorised users. Keep it as Worth reviewing if you cannot identify a tool or its owner.",
    recommendation: "Disable unused remote access and protect any required access with strong sign-in.",
  },
  "Remote access on business devices needs review": {
    where: "Windows: Settings → System → Remote Desktop, and Settings → Apps → Installed apps for remote-support tools. Mac: System Settings → General → Sharing; review Screen Sharing, Remote Login and Remote Management.",
    action: "Turn off remote access you do not use. For access you need, keep only approved tools and users, require strong sign-in and MFA, and confirm with your IT provider before removing managed software.",
    verify: "Reopen the remote-access settings and confirm unused options are off and required tools have named, authorised users. Keep it as Worth reviewing if you cannot identify a tool or its owner.",
    recommendation: "Disable unused remote access and protect any required access with strong sign-in.",
  },
  "Unfamiliar or unnecessary software": {
    where: "Windows: Settings → Apps → Installed apps; sort by install date if available. Mac: Finder → Applications. Also check the installed-app list in any device-management console you use.",
    action: "Look up the app name and publisher before acting; some unfamiliar names belong to the device maker. Remove only software you have confirmed is unneeded or unapproved, and ask your IT provider before removing managed tools.",
    verify: "Recheck the installed-app list and confirm the unwanted program is gone. Keep it as Worth reviewing if you cannot identify the app or confirm its owner.",
    recommendation: "Identify unfamiliar software first, then remove only apps confirmed to be unnecessary or unapproved.",
  },
  "Unfamiliar or unnecessary business software needs review": {
    where: "Windows: Settings → Apps → Installed apps; sort by install date if available. Mac: Finder → Applications. Also check any device-management console you use.",
    action: "Look up the app name and publisher before acting; some unfamiliar names belong to the device maker. Remove only software you have confirmed is unneeded or unapproved, and ask your IT provider before removing managed tools.",
    verify: "Recheck the installed-app list and confirm the unwanted program is gone. Keep it as Worth reviewing if you cannot identify the app or confirm its owner.",
    recommendation: "Identify unfamiliar software first, then remove only apps confirmed to be unnecessary or unapproved.",
  },
  "Everyday administrator access needs review": {
    where: "Windows: Settings → Accounts → Other users; check which accounts are Administrators. Mac: System Settings → Users & Groups; inspect account types.",
    action: "Use standard accounts for routine work where practical. Remove administrator rights only from accounts that do not need them, and keep a separate administrator account available for maintenance.",
    verify: "Reopen the account list and confirm administrator access is limited to the people who maintain the device. Keep it as Worth reviewing if you cannot confirm who owns an account.",
    recommendation: "Reserve administrator access for people who need to manage the device.",
  },
  "MFA is not enabled on an important account": {
    action: "Enable two-step verification using an authenticator app, passkey or security key when offered. Save recovery codes in a private, secure place and never share them here.",
    verify: "Sign out and back in to confirm the account asks for the second factor. Keep it as Worth reviewing if you cannot test the sign-in or account recovery.",
    recommendation: "Add a second sign-in factor to important accounts, starting with email and banking.",
  },
  "MFA is not enabled for important business accounts": {
    action: "Enable multi-factor sign-in for important accounts, starting with email and administrator accounts. Prefer an authenticator app, passkey or security key, store recovery codes safely, and require it for staff where supported.",
    verify: "Test a fresh sign-in to confirm the second factor is required and confirm each important user is enrolled. Keep it as Worth reviewing if an account cannot be checked.",
    recommendation: "Require multi-factor sign-in on important business accounts, starting with email and admin access.",
  },
  "Administrator access needs review": {
    action: "Remove administrator rights from people who do not need them. Use a separate standard account for routine work where supported, and confirm an unfamiliar account with the service owner before removing it.",
    verify: "Reopen the user and role list and confirm only the people responsible for managing the service remain administrators. Keep it as Worth reviewing if an account or role is unexplained.",
    recommendation: "Keep administrator access only for people who need it to manage the service.",
  },
  "Business account recovery methods need review": {
    action: "Replace outdated or unrecognised recovery emails and phone numbers with details controlled by the business. Store backup codes securely and do not paste them into the checkup.",
    verify: "Reopen the recovery page and confirm every listed email and number is current and controlled by the business. Keep it as Worth reviewing if ownership is unclear.",
    recommendation: "Keep account recovery details current and under business control.",
  },
  "Connected business apps and services need review": {
    action: "Remove access for apps that are unused or no longer needed. For an unfamiliar connection, first confirm its owner and purpose with the service administrator.",
    verify: "Reopen the connected-app list and confirm removed apps are gone and remaining access has a known owner and purpose. Keep it as Worth reviewing if a connection is unexplained.",
    recommendation: "Remove unused app connections and confirm the purpose of unfamiliar ones.",
  },
};

function cleanInstruction(value: string) {
  return value.replace(/^(Recommended improvement:|Access should be reviewed:|Potential warning sign\.|Verify before continuing\.|Unexpected request\.)\s*/i, "").trim();
}

export function getCheckupPlaybookContent(item: CheckupItemContent, findingTitle?: string) {
  const curated = (findingTitle && REMEDIATION_CONTENT[findingTitle]) || REMEDIATION_CONTENT[item.title];
  const where = curated?.where ?? item.where?.trim();
  const action = curated?.action ?? (item.review ? cleanInstruction(item.review) : undefined);
  const steps: CheckupPlaybookStep[] = [];

  if (where) {
    steps.push({ section: "WHERE TO FIND IT", text: where, time: "~3 min", tool: item.category });
  }
  if (action) {
    steps.push({ section: "WHAT TO CHANGE", text: action, time: "Varies", tool: "Recommended action" });
  }
  if (curated?.verify) {
    steps.push({ section: "VERIFY", text: curated.verify, time: "~2 min", tool: "Check the setting or result" });
  }

  const recommendation = curated?.recommendation;
  return { steps, recommendation };
}

export function sectionForPlaybookText(text: string): PlaybookSection | undefined {
  const prefix = text.match(/^(Find it|Fix it|Verify it|Maintain it|Review it)\s*[—-]/i)?.[1]?.toLowerCase();
  if (prefix === "find it") return "WHERE TO FIND IT";
  if (prefix === "fix it") return "WHAT TO CHANGE";
  if (prefix === "verify it") return "VERIFY";
  if (prefix === "maintain it" || prefix === "review it") return "KEEP IT CURRENT";
  return undefined;
}

export function textWithoutPlaybookPrefix(text: string) {
  return text.replace(/^(?:Find it|Fix it|Verify it|Maintain it|Review it)\s*[—-]\s*/i, "");
}
