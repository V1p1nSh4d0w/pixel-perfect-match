import type { GuidedCheck } from "@/components/GuidedCheckFlow";
import { TEAM_SIZES } from "@/lib/business-onboarding";

/** minTeam: index into TEAM_SIZES (0 = everyone, incl. "Just me"). `solo` overrides wording for "Just me". */
export type BusinessOnlineCheck = GuidedCheck & { minTeam: number; solo?: Partial<Pick<GuidedCheck, "title" | "what" | "where" | "review">> };

const C = "Email, Website & Online Presence";

export const BUSINESS_ONLINE_CHECKS: BusinessOnlineCheck[] = [
  {
    id: "email-mfa", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Two-step sign-in (MFA) on business email",
    what: "Whether the main business email accounts (for example Google Workspace, Microsoft 365 or Zoho) ask for a second step when signing in.",
    why: "Business email is often used to reset passwords for other services, so protecting it with MFA can significantly reduce the risk of a wider account takeover.",
    lookFor: "Main mailboxes without MFA, or MFA turned on for some people but not others. Shared inboxes such as info@ or accounts@ are easy to miss.",
    where: "In your email account, open Security settings and look for \"2-Step Verification\" or \"Multi-factor authentication\". Admin consoles usually show which users have it on.",
    review: "Recommended improvement: turn on MFA for every important business mailbox, starting with the ones used for banking, domain and website accounts.",
    solo: { what: "Whether your main business email account (for example Google Workspace, Microsoft 365, Zoho or Gmail) asks for a second step when you sign in." },
  },
  {
    id: "email-recovery", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Business email recovery details",
    what: "Whether the recovery email addresses and phone numbers for important business mailboxes are current and controlled by the right people.",
    why: "If recovery details are out of date you could be locked out; if someone else controls them, they could reset the password.",
    lookFor: "Old phone numbers, personal addresses of former staff or contractors, or recovery details you don't recognise.",
    where: "In each important mailbox, open Security (or Account recovery) settings and review the recovery email and phone number.",
    review: "Recommended improvement: update recovery details so they point to numbers and addresses the business controls.",
    solo: { what: "Whether the recovery email address and phone number for your business email are current and belong to you." },
  },
  {
    id: "domain-mfa", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Security of the account that controls your domain",
    what: "Whether MFA is turned on for the registrar account that controls your business domain name (the company where you bought it, such as GoDaddy, Namecheap, Hostinger or Cloudflare).",
    why: "Whoever controls the domain can change where your website and email go, so this account deserves strong protection.",
    lookFor: "MFA turned off, or uncertainty about which registrar account the domain is in.",
    where: "Sign in to your domain registrar and open Account → Security or Login settings. If you're not sure which registrar you use, search your email for the domain renewal invoice.",
    review: "Recommended improvement: turn on MFA for the registrar account and make sure its sign-in email is one the business controls.",
  },
  {
    id: "hosting", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Website, hosting and CMS admin accounts",
    what: "Whether admin accounts for your website, hosting and content management system (CMS — for example WordPress, Shopify, Wix) are protected with MFA and limited to the right people.",
    why: "An admin on your website or hosting can change content, add pages or access customer data, so these logins matter.",
    lookFor: "Admin accounts without MFA, more admins than you expect, or admins you don't recognise.",
    where: "In your website's admin area, open Users (or Staff/Team) and check each account's role. In hosting, check the account's Security settings for MFA.",
    review: "Access should be reviewed: turn on MFA for admin accounts and remove admin rights that aren't needed.",
    solo: { what: "Whether your website, hosting and content management system (CMS — for example WordPress, Shopify, Wix) admin logins are protected with MFA and only used by you or people you trust." },
  },
  {
    id: "social", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Business social-media accounts",
    what: "Whether important business social accounts (for example Instagram, Facebook Page, LinkedIn, YouTube, X, WhatsApp Business) are protected with MFA and controlled by the right people.",
    why: "Social accounts are how many customers contact a business. If one is taken over, it can be used to scam customers or damage your reputation.",
    lookFor: "Accounts without MFA, accounts linked to a personal or former employee's login, or page admins you don't recognise.",
    where: "In each platform, open Settings → Security for MFA, and the page or business settings for the list of people with access (for example Meta Business Suite → Settings → People).",
    review: "Recommended improvement: turn on MFA and make sure at least one person the business trusts is an owner or admin.",
  },
  {
    id: "unknown-access", category: C, quick: true, minTeam: 1, style: "setting",
    title: "Former staff, contractors or unknown parties with access",
    what: "Whether former employees, contractors, agencies or other outsiders may still have access to your important online business accounts.",
    why: "Access that's no longer needed is easy to forget and can be misused or taken over without anyone noticing.",
    lookFor: "People who no longer work with you, agencies or freelancers whose project has ended, or users you can't identify.",
    where: "Review the user, admin and page-access lists in your email, domain, website and social accounts.",
    review: "Access should be reviewed: remove access that's no longer needed. An unfamiliar user deserves a closer look but isn't automatically a sign of misuse.",
  },
  {
    id: "unknown-access-solo", category: C, quick: true, minTeam: 0, style: "setting",
    title: "Outside people who still have access",
    what: "Whether web designers, agencies, freelancers or anyone else you've worked with may still have access to your email, domain, website or social accounts.",
    why: "Access given for a past project is easy to forget and can be misused or taken over without you noticing.",
    lookFor: "People whose work for you has ended, or users you can't identify.",
    where: "Review the user, admin and page-access lists in your email, domain, website and social accounts.",
    review: "Access should be reviewed: remove access that's no longer needed.",
  },
  // ---- Deep Check only ----
  {
    id: "domain-ownership", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Knowing who controls the domain and how to recover it",
    what: "Whether the business knows which registrar account holds its domain, whose email is on it, and how that account can be recovered.",
    why: "Domains are sometimes registered by a web designer or a former employee. If nobody in the business can access the account, renewing or fixing problems becomes hard.",
    lookFor: "A domain registered under someone else's account or personal email, or recovery details nobody can access.",
    where: "Sign in to the registrar and check the account owner, contact email and recovery options, as well as the domain's renewal date.",
    review: "Recommended improvement: make sure the domain is in an account the business controls, with up-to-date contact and recovery details.",
    solo: { what: "Whether you know which registrar account holds your domain, that it's under your own email, and how you'd recover that account." },
  },
  {
    id: "dns", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Who can change DNS settings",
    what: "Whether access to your domain's DNS management is limited to the right people. DNS is like the address book for your domain — it controls where your website and email are directed.",
    why: "Someone who can change DNS can send visitors or email to the wrong place, so access should be limited.",
    lookFor: "More people or providers with DNS access than you expect. DNS is often managed at the registrar, hosting or a service like Cloudflare.",
    where: "Find where your DNS is managed (often shown as 'nameservers' at your registrar), then check who has access to that account. Only review access — don't change DNS records unless you know what they do.",
    review: "Access should be reviewed: limit DNS access to the people or provider who manage it, and protect that account with MFA.",
  },
  {
    id: "email-auth", category: C, quick: false, minTeam: 0, style: "setting",
    title: "Email authentication (SPF, DKIM and DMARC)",
    what: "Whether your domain has SPF, DKIM and DMARC set up. These are DNS settings that help receiving mail servers check that email claiming to be from your domain really came from you.",
    why: "They can make it harder for others to send fake email pretending to be your business, and can help your real email reach inboxes.",
    lookFor: "Not knowing whether they're set up, or your email provider's admin console showing them as missing. Missing settings don't mean your business has been compromised.",
    where: "Your email provider's admin console often shows the status (for example Google Admin → Apps → Gmail → Authenticate email, or Microsoft 365 Defender → Email authentication). Your IT provider or email host can also confirm. This checkup doesn't check them for you — and you don't need to paste email headers here.",
    review: "Recommended improvement: ask your email provider or IT person to confirm SPF, DKIM and DMARC are set up. Follow your provider's guidance rather than changing DNS records blindly.",
  },
  {
    id: "individual-admins", category: C, quick: false, minTeam: 1, style: "business",
    title: "Individual website admin accounts",
    what: "Whether people who manage your website or CMS each have their own admin login, where practical, rather than sharing one.",
    why: "Individual logins make it easy to remove one person's access and to see who made a change.",
    where: "Look at your website's Users list and think about whether several people sign in with the same login.",
    review: "Recommended improvement: create individual accounts with the right role for each person who manages the website.",
  },
  {
    id: "integrations", category: C, quick: false, minTeam: 0, style: "business",
    title: "Knowing your integrations and keeping only what's needed",
    what: "Whether you know which plugins, apps and services are connected to your website, email, domain or social accounts — and whether they're still needed.",
    why: "Each connected service can read or change some data. Unused ones keep that access until removed.",
    where: "Check your website's plugins or apps list, your email's connected apps, and your social accounts' linked apps or business integrations.",
    review: "Recommended improvement: remove integrations you no longer use, and keep the ones you need updated.",
  },
  {
    id: "lockout-plan", category: C, quick: false, minTeam: 0, style: "business",
    title: "A plan if you're locked out of a key account",
    what: "Whether the business knows who would recover the main email, domain, website or social account if it were locked out, and how.",
    why: "Knowing the recovery steps and who's responsible in advance can save a lot of time and stress during an incident.",
    where: "For each key account, note who owns it, where its recovery options are, and the provider's official support or recovery page. Store this somewhere safe — never in this checkup.",
    review: "Recommended improvement: write down a short recovery plan for each key account and who is responsible for it.",
    solo: { what: "Whether you know how you'd recover your main email, domain, website or social account if you were locked out.", review: "Recommended improvement: write down how you'd recover each key account and keep it somewhere safe." },
  },
];

export function onlineChecksFor(teamSize: string, mode: "quick" | "deep"): GuidedCheck[] {
  const idx = Math.max(0, TEAM_SIZES.indexOf(teamSize as (typeof TEAM_SIZES)[number]));
  const solo = teamSize === "Just me";
  return BUSINESS_ONLINE_CHECKS
    .filter((c) => (c.id === "unknown-access-solo" ? solo : c.minTeam <= idx) && (mode === "deep" || c.quick))
    .map(({ solo: s, minTeam: _m, ...c }) => (solo && s ? { ...c, ...s } : c));
}
