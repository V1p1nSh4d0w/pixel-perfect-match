import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { BrandLogo } from "@/components/BrandLogo";
import { RiskLabel, ScoreRing, SeverityBadge } from "@/components/Results";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_EMAIL } from "@/lib/config";
import { usePremiumEnabled } from "@/hooks/useSubscription";

const TITLE = "SecureCheck — Know your security. Fix what matters.";
const DESC =
  "A 60-second security assessment for small businesses in India: get a security score, a list of what's wrong, and a clear plan to fix it.";

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
  ["01", "Assess", "Answer 10 plain-English questions about your business."],
  ["02", "Analyze", "SecureCheck scores your answers against security best practices."],
  ["03", "Prioritize", "Findings are ranked by severity so you know what matters."],
  ["04", "Improve", "Follow a concrete action plan, not vague advice."],
] as const;

const CHECKS = [
  ["Password security", "Are business passwords strong, unique, and managed?"],
  ["Multi-factor authentication", "Is MFA enabled on email, banking, and admin accounts?"],
  ["Access control", "Do only the right people have admin or owner access?"],
  ["Software updates", "Is software kept current and supported?"],
  ["Device security", "Are laptops and phones locked and encrypted?"],
  ["Backups", "Is business data backed up and tested for recovery?"],
  ["Email security", "Is email protected and are staff trained on phishing?"],
  ["Cloud & SaaS", "Is access to cloud tools reviewed and limited?"],
  ["Website & domain", "Is the site HTTPS and the domain registrar locked down?"],
  ["Incident readiness", "Do you have a plan if a device is lost or an account is breached?"],
] as const;

const PLANS = [
  { name: "Free", price: "₹0", note: "Forever free", bullets: ["Complete security assessment", "Security score", "Findings and action plan"], to: "/signup", cta: "Start free" },
  { name: "Starter Kit", price: "₹499", note: "One-time payment", bullets: ["Everything in Free", "PDF report download", "Extended remediation playbooks"], to: "/pricing", cta: "See Starter Kit" },
] as const;

function useCountUp(target: number, ms: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Tick({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 text-success" aria-label="Yes"><path d="M5 12l5 5L20 7" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 text-danger" aria-label="No"><path d="M6 6l12 12M18 6L6 18" /></svg>
  );
}

function LandingPage() {
  const { premiumEnabled } = usePremiumEnabled();
  const navigate = useNavigate();
  const score = useCountUp(72, 1200);

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
            <a href="#security-checks" className="hover:text-foreground">Security checks</a>
            <Link to="/checkup" className="hover:text-foreground">Security Checkup</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/signup" className="hidden sm:block"><Button>Start free check</Button></Link>
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
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> For small businesses in India
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Know your security. Fix what matters.</h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              A 60-second assessment that gives your business a security score, a list of what's wrong, and a clear plan to fix it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup"><Button>Start free check</Button></Link>
              <Link to="/pricing"><Button variant="secondary">See pricing</Button></Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card. 10 questions. Results in under a minute.</p>
          </div>

          <div className="rounded-card border border-border bg-card p-6 md:justify-self-end md:w-[380px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Sample self-assessment
            </div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <ScoreRing score={score} risk="Moderate risk" />
              <RiskLabel risk="Moderate risk" />
            </div>
            <ul className="mt-6 space-y-2">
              {([["MFA", true], ["Backups", true], ["Password manager", false]] as const).map(([label, ok], i) => (
                <li
                  key={label}
                  className="animate-rise flex items-center justify-between rounded-button border border-border bg-surface-raised px-3 py-2 text-sm"
                  style={{ animationDelay: `${400 + i * 150}ms` }}
                >
                  {label} <Tick ok={ok} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="border-y border-border">
        <p className="mx-auto max-w-6xl px-5 py-4 text-center text-sm text-muted-foreground">
          Built for Indian SMBs, clinics, coaching centers, CA firms, and D2C brands
        </p>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">One assessment. A clear action plan.</h2>
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

      {/* What we check */}
      <section id="security-checks" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What does SecureCheck look for?</h2>
        <p className="mt-3 text-muted-foreground">Ten controls that matter most for a small business.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {CHECKS.map(([t, d]) => (
            <div key={t} className="rounded-card border border-border bg-card p-5">
              <p className="font-medium">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Score preview */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">See exactly where you stand.</h2>
        <div className="mt-10 grid items-center gap-10 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-card p-8">
            <ScoreRing score={72} risk="Moderate risk" />
            <p className="text-lg font-semibold text-medium">Moderate</p>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>The score is a snapshot of your current security baseline.</p>
            <p>Every finding comes with a plain-English explanation of why it matters and what to do.</p>
            <p>The score is an assessment indicator, not a guarantee of security.</p>
            <Link to="/signup" className="inline-block pt-2"><Button>Get your free score</Button></Link>
          </div>
        </div>
      </section>

      {/* Sample finding */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your report tells you exactly what to do next.</h2>
        <div className="mt-10 rounded-card border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity="High" />
            <span className="text-xs text-muted-foreground">Email</span>
          </div>
          <p className="mt-3 font-medium">Email is not protected with MFA</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why it matters</p>
          <p className="mt-1 text-sm">Your email resets every other password, so a hijacked inbox can lead to everything else.</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested fix</p>
          <p className="mt-1 text-sm">Turn on MFA for every mailbox in your email provider's admin settings.</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">12 more findings, ranked by severity, waiting after your assessment.</p>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start free. Upgrade when you're ready.</h2>
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
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find out where your business stands.</h2>
        <p className="mt-4 text-muted-foreground">Ten questions. Under a minute. A score, findings, and a plan.</p>
        <Link to="/signup" className="mt-8 inline-block"><Button>Start free check</Button></Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-5">
          <p className="font-semibold">SecureCheck</p>
          <FooterCol title="Product">
            <a href="#how-it-works">How it works</a>
            <a href="#security-checks">Security checks</a>
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
