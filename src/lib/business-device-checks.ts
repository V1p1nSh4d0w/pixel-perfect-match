import type { GuidedCheck } from "@/components/GuidedCheckFlow";
import { TEAM_SIZES } from "@/lib/business-onboarding";

/** minTeam: index into TEAM_SIZES (0 = everyone, incl. "Just me"). `solo` overrides wording for "Just me". */
export type BusinessDeviceCheck = GuidedCheck & { minTeam: number; solo?: Partial<Pick<GuidedCheck, "title" | "what" | "where">> };

const C = "Devices & Software";

export const BUSINESS_DEVICE_CHECKS: BusinessDeviceCheck[] = [
  {
    id: "endpoint", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Security protection (antivirus) on business computers",
    what: "Whether built-in or trusted security protection — such as Microsoft Defender on Windows or XProtect on Mac — is turned on and up to date on the computers used for business.",
    why: "Security protection can block many common threats, such as harmful downloads and known malware, before they cause problems.",
    lookFor: "Protection that is turned off, shows warnings, or hasn't updated recently — or computers where nobody is sure what protection is used.",
    where: "Windows: Start → Windows Security → Virus & threat protection. Mac: protection is built in; check that macOS updates are installed. If you use another security product, open it and check its status.",
    review: "Recommended improvement: make sure each business computer has protection turned on and updating. A warning doesn't automatically mean the computer is infected — follow the product's own guidance.",
    solo: { title: "Security protection (antivirus) on your computer", what: "Whether built-in or trusted security protection — such as Microsoft Defender on Windows or XProtect on Mac — is turned on and up to date on the computer you use for business." },
  },
  {
    id: "firewall", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Device firewall",
    what: "Whether the built-in firewall is turned on for business computers.",
    why: "A firewall controls which network connections can reach the computer, which can reduce exposure, especially on public or shared Wi-Fi.",
    lookFor: "The firewall turned off for any network type (especially public networks), or a message saying it's managed by an app you don't recognise.",
    where: "Windows: Windows Security → Firewall & network protection. Mac: System Settings → Network → Firewall.",
    review: "Recommended improvement: keep the firewall on. If an app needs an exception, allow that specific app rather than turning the firewall off.",
  },
  {
    id: "encryption", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Device encryption",
    what: "Whether devices holding important business data use disk or device encryption, where it's available.",
    why: "If a laptop or phone is lost or stolen, encryption helps keep the data on it unreadable without the sign-in or recovery key.",
    lookFor: "Laptops or devices with business data where encryption is off. Availability depends on the device and edition, so 'not available' isn't the same as 'off'.",
    where: "Windows: Settings → Privacy & security → Device encryption (or BitLocker on Pro editions). Mac: System Settings → Privacy & Security → FileVault. Phones are usually encrypted when a screen lock is set.",
    review: "Recommended improvement: turn on encryption for devices with important business data, and store the recovery key somewhere safe. Never enter the recovery key into this checkup.",
  },
  {
    id: "local-admin", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Everyday use without unnecessary administrator rights",
    what: "Whether people use business computers day to day with a standard account, rather than an administrator account, where that's practical.",
    why: "Software runs with the rights of the account using it. Using a standard account day to day can limit what harmful software can change.",
    lookFor: "Everyone using admin accounts by default, or admin rights given to people who don't install software or change settings.",
    where: "Windows: Settings → Accounts → Other users (or Family & other users) shows each account's type. Mac: System Settings → Users & Groups.",
    review: "Recommended improvement: keep administrator rights for the people who need them and use a standard account for everyday work where practical.",
    solo: { title: "Using your computer without unnecessary administrator rights", what: "Whether you use a standard account for everyday work and only use administrator rights when you need to install software or change settings, where that's practical." },
  },
  {
    id: "remote", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Remote access",
    what: "Whether Remote Desktop, remote-support tools (such as AnyDesk or TeamViewer) or similar remote access are turned on only when needed and protected with strong sign-in.",
    why: "Remote access can be legitimate and useful, but if it's left open or poorly protected, it can give someone else control of the computer.",
    lookFor: "Remote access turned on that nobody uses, remote tools you don't recognise, or remote access protected only by a simple password.",
    where: "Windows: Settings → System → Remote Desktop. Also check installed apps for remote-support tools. Mac: System Settings → General → Sharing (Screen Sharing, Remote Login, Remote Management).",
    review: "Access should be reviewed: turn off remote access you don't use, and protect what you keep with strong sign-in and MFA. Remote access being on is not automatically a sign of misuse.",
  },
  {
    id: "unknown-software", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Unfamiliar or unnecessary software",
    what: "Whether business devices have applications installed that you don't recognise, no longer need, or didn't approve.",
    why: "Every program can be a way in if it's harmful or out of date. Removing what you don't need reduces risk.",
    lookFor: "Apps you don't recognise, old tools nobody uses, browser add-ons or 'cleaner' apps that arrived with other downloads.",
    where: "Windows: Settings → Apps → Installed apps. Mac: the Applications folder. Sort by install date to spot recent additions.",
    review: "Recommended improvement: look up anything unfamiliar before removing it — some software comes from the device maker. Remove what isn't needed.",
  },
  // ---- Deep Check only ----
  {
    id: "updates", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Security updates and supported operating systems",
    what: "Whether business devices run an operating system version that still receives security updates, and whether updates are being installed.",
    why: "Updates fix security weaknesses. Systems that no longer get updates stay exposed to problems that are already publicly known.",
    lookFor: "Devices on old versions (for example Windows 10 after its end of support, or older macOS versions), pending updates, or updates paused for a long time.",
    where: "Windows: Settings → Windows Update. Mac: System Settings → General → Software Update. Phones: Settings → Software update / System update.",
    review: "Recommended improvement: install pending updates and plan to replace or upgrade devices that no longer receive security updates.",
  },
  {
    id: "secure-boot", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Secure Boot and hardware security (where supported)",
    what: "Whether security features built into the hardware, such as Secure Boot and TPM (a security chip), are in use on computers that support them.",
    why: "These features help make sure the computer starts with trusted software and protect encryption keys.",
    lookFor: "Secure Boot shown as 'Off' on a computer that supports it. Older hardware may not support these features — that's a hardware limit, not a mistake.",
    where: "Windows: search for 'System Information' and look at 'Secure Boot State'; Windows Security → Device security shows the security processor (TPM). Macs with Apple chips have this built in.",
    review: "Recommended improvement: where supported, keep Secure Boot and TPM on. Changing firmware settings can affect startup, so get help if unsure — don't change them blindly.",
  },
  {
    id: "management", category: C, quick: false, minTeam: 1, style: "business",
    title: "Business devices set up consistently",
    what: "Whether business-owned devices are managed centrally (for example with Microsoft Intune, Google endpoint management or similar) or otherwise set up the same way, where that suits your business.",
    why: "Consistent setup makes it easier to keep protection, updates and encryption on across every device, and to lock or wipe a lost one.",
    where: "Think about how a new business computer is set up today and whether someone can check the status of all devices in one place.",
    review: "Recommended improvement: use a simple standard setup for each device; as the team grows, consider a device-management tool.",
  },
  {
    id: "inventory", category: C, quick: false, minTeam: 1, style: "business",
    title: "Knowing what important software is installed",
    what: "Whether you have a reasonable way to know what important software is installed on business devices — even a simple list.",
    why: "You can only keep software updated and remove risky tools if you know what's there.",
    where: "Check whether there's a list (spreadsheet or device-management report) of the business devices and the main software on each.",
    review: "Recommended improvement: keep a simple list of business devices and key software, and update it when things change.",
  },
  {
    id: "remote-tools", category: C, quick: false, minTeam: 1, style: "setting",
    title: "Remote-management and support tools are authorised",
    what: "Whether the remote-management or support tools on business devices are known, approved, and only usable by the right people — such as your IT provider.",
    why: "These tools can control devices fully, so unknown tools or too many people with access increase risk.",
    lookFor: "Remote tools nobody can explain, tools left over from a previous IT provider, or support accounts shared by many people.",
    where: "Check installed apps on each device and the user list in your remote-support tool's admin console.",
    review: "Access should be reviewed: remove tools you don't use and limit who can connect. Ask your IT provider before removing a tool they rely on.",
  },
  {
    id: "personal-vs-business", category: C, quick: false, minTeam: 0, style: "business",
    title: "Separating personal and business use of devices",
    what: "Whether business and personal use of devices is separated in a way that suits your business — for example separate user accounts, browser profiles, or separate devices for sensitive work.",
    why: "Mixing personal downloads, family use or games with business data increases the chance that a problem on one side affects the other.",
    where: "Think about which devices hold business data and who else uses them. Separate accounts or profiles are often enough for small businesses.",
    review: "Recommended improvement: keep business data in a separate account, profile or device where practical.",
    solo: { what: "Whether you separate business and personal use on your devices in a way that suits you — for example a separate user account or browser profile for business, or a separate device for sensitive work." },
  },
];

export function deviceChecksFor(teamSize: string, mode: "quick" | "deep"): GuidedCheck[] {
  const idx = Math.max(0, TEAM_SIZES.indexOf(teamSize as (typeof TEAM_SIZES)[number]));
  const solo = teamSize === "Just me";
  return BUSINESS_DEVICE_CHECKS
    .filter((c) => c.minTeam <= idx && (mode === "deep" || c.quick))
    .map(({ solo: s, minTeam: _m, ...c }) => (solo && s ? { ...c, ...s } : c));
}
