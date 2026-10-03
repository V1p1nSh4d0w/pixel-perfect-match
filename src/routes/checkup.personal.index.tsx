import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { CheckupShell } from "@/components/CheckupShell";

const TITLE = "Personal Security Checkup | SecureCheck";
const DESC = "Review the security of your phone, computer, online accounts, and everyday browsing.";

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

function PersonalCheckup() {
  return (
    <CheckupShell back>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Personal Security Checkup</h1>
      <p className="mt-3 text-muted-foreground">{DESC}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-lg font-semibold">Quick Check</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">A short check of the most important security settings and habits.</p>
          <p className="mt-4 text-xs text-muted-foreground">About 5 minutes</p>
          <Link to="/checkup/personal/quick" className="mt-4"><Button fullWidth>Start Quick Check</Button></Link>
        </div>
        <div className="flex flex-col rounded-card border border-border bg-card p-6">
          <p className="text-lg font-semibold">Deep Check</p>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">A more detailed review covering additional security and privacy settings.</p>
          <p className="mt-4 text-xs text-muted-foreground">About 15–20 minutes</p>
          <Link to="/checkup/personal/deep" className="mt-4"><Button fullWidth variant="secondary">Start Deep Check</Button></Link>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-border bg-card p-6">
        <p className="text-lg font-semibold">Computer Security Checkup (Windows)</p>
        <p className="mt-2 text-sm text-muted-foreground">
          A guided self-check of Windows Security, system protection, remote access, accounts, apps and your browser.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link to="/checkup/personal/computer/quick"><Button fullWidth>Start Quick Check</Button></Link>
          <Link to="/checkup/personal/computer/deep"><Button fullWidth variant="secondary">Start Deep Check</Button></Link>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-border bg-card p-6">
        <p className="text-lg font-semibold">Online Account, Web & Privacy Checkup</p>
        <p className="mt-2 text-sm text-muted-foreground">
          A guided self-check of your online accounts, browser, privacy settings, website safety and fake warnings. We never ask for passwords or codes.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link to="/checkup/personal/online/quick"><Button fullWidth>Start Quick Check</Button></Link>
          <Link to="/checkup/personal/online/deep"><Button fullWidth variant="secondary">Start Deep Check</Button></Link>
        </div>
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
