import type { GuidedCheck } from "@/components/GuidedCheckFlow";
import { TEAM_SIZES } from "@/lib/business-onboarding";

/** minTeam: index into TEAM_SIZES — the smallest team size this check applies to (0 = everyone, incl. "Just me"). */
export type BusinessCheck = GuidedCheck & { minTeam: number };

const C = "Accounts & Access";

export const BUSINESS_ACCESS_CHECKS: BusinessCheck[] = [
  {
    id: "mfa", findingKey: "business_mfa_not_enabled", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Two-step sign-in (MFA) on important business accounts",
    what: "Whether your most important business accounts ask for a second step (an app code, prompt or security key) when signing in — for example email, banking, accounting, website/domain and social media accounts.",
    why: "MFA can significantly reduce the risk of someone taking over an account, even if a password is leaked or guessed.",
    lookFor: "Important accounts where MFA is off, or where it's only on for some people. Email and banking deserve attention first.",
    where: "In each service, open Settings → Security (or Sign-in & security) and look for \"2-step verification\" or \"Multi-factor authentication\". Many business admin consoles also show which users have it turned on.",
    review: "Recommended improvement: turn on MFA for the most important accounts first, and prefer an authenticator app or security key over SMS codes where available.",
  },
  {
    id: "shared", findingKey: "business_shared_accounts", category: C, quick: true, minTeam: 1, style: "business",
    title: "Avoiding shared accounts and shared passwords",
    what: "Whether people on your team sign in with their own login rather than sharing one username and password.",
    why: "When a login is shared, it's hard to tell who did what, and removing one person's access means changing the password for everyone.",
    where: "Think about accounts the team uses together — such as email inboxes, social media, payment or supplier portals — and whether each person has their own login. Many services let you add team members instead of sharing one login.",
    review: "Recommended improvement: where a service supports it, give each person their own login. If an account truly must be shared, store it in a password manager's shared vault rather than in chats or notes.",
  },
  {
    id: "admin", findingKey: "business_admin_access_review", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Who has administrator access",
    what: "Which people (or accounts) have administrator rights on your key business services — people who can add users, change settings or see everything.",
    why: "Administrator accounts can change almost anything, so if one is misused or taken over, the impact is much larger.",
    lookFor: "More admins than you expect, people who no longer need admin rights, or admin accounts you don't recognise.",
    where: "In each service's admin area, look for a section such as \"Users\", \"Roles\", \"Team\" or \"Permissions\" and check who is listed as Admin or Owner.",
    review: "Access should be reviewed: keep admin rights to the few people who actually need them, and remove admin rights from accounts that don't. An unfamiliar admin account deserves a closer look, but isn't automatically a sign of a break-in.",
  },
  {
    id: "former", findingKey: "business_former_staff_access", category: C, quick: true, minTeam: 1, style: "business",
    title: "Removing access for people who have left",
    what: "Whether former staff, freelancers or contractors still have working logins to your business accounts.",
    why: "Accounts belonging to people who have left are easy to forget, and can be misused or taken over without anyone noticing.",
    where: "In each important service, open the list of users or team members and compare it with the people who currently work with you. Also check shared passwords they may have known.",
    review: "Access should be reviewed: remove or disable accounts for people who have left, and change any shared passwords they knew.",
  },
  {
    id: "recovery", findingKey: "business_recovery_methods", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Account recovery methods",
    what: "The backup email address and phone number used to recover your important business accounts if you lose access.",
    why: "Out-of-date recovery details can lock you out of your own account — and recovery details controlled by someone else could let them reset your password.",
    lookFor: "Old phone numbers, personal or former employees' email addresses, or recovery details you don't recognise.",
    where: "In each important account, open Settings → Security (or Account recovery) and review the recovery email, phone number and any saved backup options.",
    review: "Recommended improvement: update recovery details so they point to email addresses and numbers the business still controls.",
  },
  {
    id: "third-party", findingKey: "business_third_party_access", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Third-party apps and services with access to your accounts",
    what: "Outside apps and services — such as invoicing, scheduling, marketing or website tools — that have been allowed to connect to your important business accounts.",
    why: "Each connected service can read or change some of your data. Apps you no longer use still keep that access until it's removed.",
    lookFor: "Apps you don't recognise, apps you no longer use, or apps with much broader access than they seem to need.",
    where: "In your email or business account, look for \"Connected apps\", \"Third-party access\", \"Apps with access to your account\" or \"Integrations\" under Security or Settings.",
    review: "Access should be reviewed: remove apps you no longer use. If something is unfamiliar, first find out what it is and who added it before assuming the worst.",
  },
  // ---- Deep Check only ----
  {
    id: "individual", category: C, quick: false, minTeam: 1, style: "business",
    title: "Each person has their own account",
    what: "Whether everyone who uses your business systems has their own individual account, rather than using someone else's.",
    why: "Individual accounts let you give or remove access per person and see who made a change.",
    where: "Compare the people who work with you against the user list in your main business services (email, files, accounting, payments).",
    review: "Recommended improvement: create an individual account for each person who needs access.",
  },
  {
    id: "least", category: C, quick: false, minTeam: 1, style: "setting",
    title: "People have only the access they need",
    what: "Whether each person's access matches the work they actually do.",
    why: "Each person should have only the access they need to do their work. Extra access increases the impact if their account is misused or taken over.",
    lookFor: "People who can see or change much more than their role requires, such as access to finances, all customer data, or admin settings.",
    where: "In each service's Users, Roles or Permissions area, check what each person can access. Shared folders and drives are worth a look too.",
    review: "Access should be reviewed: reduce access to what each person needs, and avoid giving administrator access unless it is actually necessary.",
  },
  {
    id: "separate-admin", category: C, quick: false, minTeam: 0, style: "business",
    title: "Using a separate account for admin tasks, where it makes sense",
    what: "Whether people who manage important settings use a separate admin login for admin work, rather than their everyday account.",
    why: "Everyday accounts are used for email and browsing, so they're more exposed to phishing. Keeping admin rights on a separate account can limit the damage if the everyday account is compromised.",
    where: "Check whether your main business services (for example your email or cloud admin console) have admin rights on the same account people use every day. For very small businesses this isn't always practical — strong MFA on the admin account matters most.",
    review: "Recommended improvement: where it's practical, use a separate admin account protected with MFA for admin tasks.",
  },
  {
    id: "pw-manager", category: C, quick: false, minTeam: 0, style: "business",
    title: "Using a password manager",
    what: "Whether you (and your team) use a password manager to create and store unique passwords for business accounts.",
    why: "A password manager makes it practical to use a different strong password for every account, so one leaked password doesn't unlock others.",
    where: "Think about where business passwords are kept today — memory, notebooks, spreadsheets, chat messages or a password manager. Never enter passwords into this checkup.",
    review: "Recommended improvement: adopt a password manager for business accounts, and move shared logins out of spreadsheets and chats.",
  },
  {
    id: "sessions", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Active sessions and signed-in devices",
    what: "The list of devices and locations currently signed in to your important business accounts.",
    why: "Old or unknown sessions can keep an account accessible on devices you no longer control, such as a lost phone or an old laptop.",
    lookFor: "Devices you don't recognise, old devices, or sign-ins from places that don't match where your team works. Travel or VPNs can explain unusual locations.",
    where: "In each important account, look for \"Devices\", \"Where you're signed in\", \"Active sessions\" or \"Recent activity\" under Security.",
    review: "Access should be reviewed: sign out devices you don't use or recognise, then change that account's password and check MFA if anything looks unfamiliar.",
  },
  {
    id: "oauth", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Apps connected through \"Sign in with Google/Microsoft\"",
    what: "Apps that were given permission (sometimes called OAuth access) to your business Google, Microsoft or similar account — often when someone clicked \"Sign in with…\" or \"Allow\".",
    why: "These permissions can let an app read email, files or contacts without needing your password, and they stay in place until removed.",
    lookFor: "Apps nobody remembers adding, apps that can read or send all email or access all files, and apps no longer in use.",
    where: "Google: Account → Security → \"Your connections to third-party apps & services\". Microsoft: My Account → \"App permissions\", or the admin center's Enterprise applications. Other platforms usually list these under Security or Integrations.",
    review: "Access should be reviewed: remove connections you don't need, and check unfamiliar ones with the person who may have added them.",
  },
  {
    id: "api-keys", category: C, quick: false, minTeam: 0, style: "setting",
    title: "API keys and app passwords (if you use them)",
    what: "Special keys or app passwords created so other software can connect to your business services — for example a website plugin, payment gateway or email client. Skip this if you don't use any.",
    why: "These keys often work without MFA, so a key that's old, forgotten or shared too widely can give ongoing access.",
    lookFor: "Keys or app passwords nobody is using, ones created by people who have left, or keys that have been pasted into emails or chats.",
    where: "Look in each service's Developer, API, Integrations or Security settings for a list of keys or app passwords. Only review the list — never paste a key or secret into this checkup.",
    review: "Access should be reviewed: delete keys and app passwords that are no longer needed, and replace any that may have been shared too widely.",
  },
  {
    id: "onboarding", category: C, quick: false, minTeam: 1, style: "business",
    title: "Giving new people the right access when they join",
    what: "Whether you have a simple, consistent way to set up accounts for new team members — giving them what they need, not everything.",
    why: "When access is set up in a hurry, people often get more than they need, or shared passwords get passed around.",
    where: "Think about the last person who joined: how were their accounts created, and who decided what they could access?",
    review: "Recommended improvement: keep a short checklist of the accounts and access each role needs, and set up individual accounts with MFA from day one.",
  },
  {
    id: "offboarding", category: C, quick: false, minTeam: 1, style: "business",
    title: "Removing access when people leave",
    what: "Whether you have a consistent routine for removing access when someone leaves — including freelancers and contractors.",
    why: "Without a routine, it's easy to miss an account, especially for services that only one or two people use.",
    where: "Think about the last person who left: was there a list of their accounts, and were shared passwords they knew changed?",
    review: "Recommended improvement: keep a leaver checklist covering their accounts, shared passwords, devices and connected apps.",
  },
  {
    id: "review", category: C, quick: false, minTeam: 2, style: "business",
    title: "Reviewing access regularly",
    what: "Whether someone periodically (for example every few months) reviews who has access to your important business services.",
    why: "Access tends to build up over time as roles change. A regular review catches accounts and permissions that are no longer needed.",
    where: "Check whether there's a calendar reminder or owner for reviewing users and admin rights in your main services.",
    review: "Recommended improvement: set a regular reminder to review users, admin rights and connected apps in your most important services.",
  },
];

export function accessChecksFor(teamSize: string, mode: "quick" | "deep"): BusinessCheck[] {
  const idx = Math.max(0, TEAM_SIZES.indexOf(teamSize as (typeof TEAM_SIZES)[number]));
  return BUSINESS_ACCESS_CHECKS.filter((c) => c.minTeam <= idx && (mode === "deep" || c.quick));
}
