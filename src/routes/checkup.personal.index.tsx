import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { CheckupShell } from "@/components/CheckupShell";

const TITLE = "Personal Security | SecureCheck";
const DESC = "Review the security of your phone, computer, online accounts, web activity, and everyday digital habits.";

export const Route = createFileRoute("/checkup/personal/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PersonalCheckup,
});

const CATEGORIES = [
  ["📱", "Device Security"],
  ["🌐", "Web & Browsing"],
  ["🔐", "Account Security"],
  ["🕵️", "Privacy & Tracking"],
  ["🚨", "Scam & Phishing Protection"],
  ["💾", "Data Protection"],
] as const;

const CARDS = [
  { icon: "📱", title: "Android Phone Security", desc: "Review powerful permissions, special access, installed apps, and important Android security settings.", quick: "/checkup/personal/quick", deep: "/checkup/personal/deep" },
  { icon: "💻", title: "Computer Security", desc: "Review Windows security, system protection, remote access, accounts, apps, and browser security.", quick: "/checkup/personal/computer/quick", deep: "/checkup/personal/computer/deep" },
  { icon: "🔐", title: "Account Security", desc: "Review MFA, passwords, recovery methods, sessions, devices, and connected apps.", quick: "/checkup/personal/accounts/quick", deep: "/checkup/personal/accounts/deep" },
  { icon: "🌐", title: "Web & Privacy", desc: "Review browser security, privacy, tracking, website safety, pop-ups, and redirects.", quick: "/checkup/personal/web/quick", deep: "/checkup/personal/web/deep" },
  { icon: "🚨", title: "Scam & Phishing Protection", desc: "Learn to recognize warning signs in links, messages, payment requests, QR codes, and fake warnings.", quick: "/checkup/personal/scams/quick", deep: "/checkup/personal/scams/deep" },
  { icon: "💾", title: "Data Protection", desc: "Review backups, file sharing, recovery options, sensitive data, and device protection.", quick: "/checkup/personal/data/quick", deep: "/checkup/personal/data/deep" },
] as const;

function PersonalCheckup() {
  return (
    <CheckupShell back>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Personal Security</h1>
      <p className="mt-3 text-muted-foreground">{DESC}</p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Choose a security area</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Each security area below has its own <span className="font-medium text-foreground">Quick Check</span> (about 5 minutes, the most important settings and habits) and{" "}
        <span className="font-medium text-foreground">Deep Check</span> (about 15–20 minutes, additional security and privacy settings).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {CARDS.map((c) => (
          <div key={c.title} className="flex flex-col rounded-card border border-border bg-card p-6">
            <p className="text-lg font-semibold"><span aria-hidden="true">{c.icon}</span> {c.title}</p>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link to={c.quick}><Button fullWidth>Quick Check</Button></Link>
              <Link to={c.deep}><Button fullWidth variant="secondary">Deep Check</Button></Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-xl font-semibold tracking-tight">What the checkup covers</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(([icon, label]) => (
          <li key={label} className="flex items-center gap-3 rounded-card border border-border bg-card px-4 py-3 text-sm">
            <span aria-hidden="true" className="text-lg">{icon}</span>
            {label}
          </li>
        ))}
      </ul>
    </CheckupShell>
  );
}
