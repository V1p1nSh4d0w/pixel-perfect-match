import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { BrandLogo } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_EMAIL } from "@/lib/config";
import { usePremiumEnabled } from "@/hooks/useSubscription";

const TITLE = "SecureCheck — Know what needs attention. Fix what matters.";
const DESC =
  "Simple security checkups for your personal digital life and your business — with clear findings, practical fixes, and useful templates.";

export const Route = createFileRoute("/")({
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
  component: LandingPage,
});

const STEPS = [
  ["01", "Check", "Answer practical security questions about the things that matter."],
  ["02", "Find", "See what needs attention, what's worth reviewing, and what already looks good."],
  ["03", "Fix", "Get clear steps to fix things, instead of a confusing technical report."],
  ["04", "Improve", "Track your progress and use practical templates when they help."],
] as const;

const PATHS = [
  { icon: "👤", title: "Personal Security", desc: "Review your phone, computer, online accounts, web activity, scams, and important data.", areas: ["Android Phone Security", "Computer Security", "Account Security", "Web & Privacy", "Scam & Phishing Protection", "Data Protection"], to: "/checkup/personal", cta: "Check personal security" },
  { icon: "🏢", title: "Business Security", desc: "Review business accounts, devices, email, website, data, backups, and security practices.", areas: ["Accounts & Access", "Devices & Software", "Email, Website & Online Presence", "Data & Backups"], to: "/checkup/business", cta: "Check business security" },
] as const;

const FLOW = ["Your answers", "Finding", "What to do", "Template"] as const;

const PLANS = [
  { name: "Free", price: "₹0", note: "Forever free", bullets: ["Complete security assessment", "Security score", "Findings and action plan"], to: "/signup", cta: "Start free" },
  { name: "Starter Kit", price: "₹499", note: "One-time payment", bullets: ["Everything in Free", "PDF report download", "Extended remediation playbooks"], to: "/pricing", cta: "See Starter Kit" },
] as const;

function LandingPage() {
  const { premiumEnabled } = usePremiumEnabled();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <BrandLogo className="shrink-0 text-base font-semibold tracking-tight" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#answers-to-action" className="hover:text-foreground">Findings & fixes</a>
            <Link to="/checkup" className="hover:text-foreground">Security Checkup</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/checkup" className="hidden sm:block"><Button>Start a free check</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Guided security self-checks
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Know what needs attention. Fix what matters.</h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">{DESC}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/checkup"><Button>Start a free security check</Button></Link>
              <a href="#how-it-works"><Button variant="secondary">See how it works</Button></a>
            </div>
          </div>

          <div className="rounded-card border border-border bg-card p-6 md:w-[380px] md:justify-self-end">
            <p className="text-xs text-muted-foreground">Example results · Account Security</p>
            <ul className="mt-4 space-y-2">
              {([["🔴 Needs attention", "Two-step sign-in is off on email"], ["🟡 Worth reviewing", "Old devices still signed in"], ["🟢 Looks good", "Recovery phone is up to date"]] as const).map(([label, item], i) => (
                <li
                  key={label}
                  className="animate-rise rounded-button border border-border bg-surface-raised px-3 py-2.5 text-sm"
                  style={{ animationDelay: `${300 + i * 150}ms` }}
                >
                  <span className="block text-xs text-muted-foreground">{label}</span>
                  <span className="mt-0.5 block">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Based on what you tell us — SecureCheck doesn't scan your devices or accounts.</p>
          </div>
        </div>
      </section>

      {/* Product paths */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-4 md:grid-cols-2">
          {PATHS.map((p) => (
            <div key={p.title} className="flex flex-col rounded-card border border-border bg-card p-6">
              <p className="text-xl font-semibold"><span aria-hidden="true">{p.icon}</span> {p.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-4 flex flex-1 flex-wrap content-start gap-2">
                {p.areas.map((a) => (
                  <li key={a} className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-muted-foreground">{a}</li>
                ))}
              </ul>
              <Link to={p.to} className="mt-6"><Button fullWidth>{p.cta}</Button></Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, t, d]) => (
            <div key={n}>
              <p className="text-3xl font-semibold text-muted-foreground/50">{n}</p>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* From answers to action */}
      <section id="answers-to-action" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">From answers to action</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Your answers can surface specific security findings. Each finding explains why it matters and what you can do next. Where useful, SecureCheck also provides a ready-to-use template or checklist.
        </p>
        <ol className="mt-8 flex flex-wrap items-center gap-2 text-sm">
          {FLOW.map((f, i) => (
            <li key={f} className="flex items-center gap-2">
              <span className="rounded-button border border-border bg-card px-3 py-2">{f}</span>
              {i < FLOW.length - 1 ? <span aria-hidden="true" className="text-muted-foreground">→</span> : null}
            </li>
          ))}
        </ol>
        <div className="mt-8 max-w-3xl rounded-card border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Example finding · Email</p>
          <p className="mt-2 font-medium">Business email isn't protected with two-step sign-in</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why it matters</p>
          <p className="mt-1 text-sm">Email is often used to reset other passwords, so protecting it can significantly reduce the risk of a wider account takeover.</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">What to do next</p>
          <p className="mt-1 text-sm">Turn on two-step sign-in for every important mailbox, starting with the ones used for banking and your website.</p>
        </div>
      </section>

      {/* Honesty */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-card border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Clear about what SecureCheck does</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            SecureCheck provides guided security self-assessments and practical recommendations. It does not replace professional penetration testing, vulnerability testing, or an independent technical security review.
          </p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Free to start.</h2>
        <div className={`mx-auto mt-10 grid gap-4 ${premiumEnabled ? "max-w-3xl md:grid-cols-2" : "max-w-md"}`}>
          {PLANS.filter((p) => premiumEnabled || p.name !== "Starter Kit").map((p) => (
            <div key={p.name} className={`flex flex-col rounded-card border bg-card p-5 ${p.name === "Starter Kit" ? "border-primary" : "border-border"}`}>
              <p className="font-semibold">{p.name}</p>
              <p className="mt-2 text-2xl font-semibold">{p.price}</p>
              <p className="text-xs text-muted-foreground">{p.note}</p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                {p.bullets.map((b) => <li key={b}>• {b}</li>)}
              </ul>
              <Link to={p.to} className="mt-5 text-sm text-primary hover:underline">{p.cta} →</Link>
            </div>
          ))}
        </div>
        <Link to="/pricing" className="mt-6 inline-block text-sm text-primary hover:underline">See full pricing →</Link>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See what needs attention — then fix what matters.</h2>
        <p className="mt-4 text-muted-foreground">Choose personal or business security and start with a Quick Check.</p>
        <Link to="/checkup" className="mt-8 inline-block"><Button>Start a free security check</Button></Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-5">
          <p className="font-semibold">SecureCheck</p>
          <FooterCol title="Product">
            <a href="#how-it-works">How it works</a>
            <Link to="/checkup">Security Checkup</Link>
            <Link to="/pricing">Pricing</Link>
          </FooterCol>
          <FooterCol title="Account">
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Sign up</Link>
          </FooterCol>
          <FooterCol title="Legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </FooterCol>
          <FooterCol title="Contact">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all">{SUPPORT_EMAIL}</a>
          </FooterCol>
        </div>
        <div className="mx-auto max-w-6xl space-y-2 border-t border-border px-5 py-6 text-xs text-muted-foreground">
          <p>SecureCheck provides security assessment guidance and does not guarantee protection against cyber incidents.</p>
          <p>© 2026 SecureCheck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground [&_a:hover]:text-foreground">{children}</div>
    </div>
  );
}
