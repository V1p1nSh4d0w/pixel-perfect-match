import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { CheckupShell } from "@/components/CheckupShell";
import { BUSINESS_TYPES, TEAM_SIZES, EMPTY_ONBOARDING, loadOnboarding, saveOnboarding, type BusinessOnboarding } from "@/lib/business-onboarding";

const TITLE = "Business Security | SecureCheck";
const DESC = "A practical security checkup for your business. No technical knowledge required.";

export const Route = createFileRoute("/checkup/business/")({
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
  component: BusinessOnboardingPage,
});

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`min-h-11 rounded-button border px-4 py-3 text-left text-sm transition-colors ${
        selected ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function BusinessOnboardingPage() {
  const navigate = useNavigate();
  const [v, setV] = useState<BusinessOnboarding>(EMPTY_ONBOARDING);
  useEffect(() => setV(loadOnboarding()), []);
  const update = (patch: Partial<BusinessOnboarding>) => setV((p) => { const n = { ...p, ...patch }; saveOnboarding(n); return n; });

  const typeDone = v.type !== "" && (v.type !== "other" || v.otherType.trim() !== "");
  const ready = typeDone && v.teamSize !== "" && v.mode !== "";

  return (
    <CheckupShell back backTo="/app" backLabel="← Back to Security">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">For business owners and teams</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Business Security</h1>
      <p className="mt-3 text-muted-foreground">{DESC}</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">1. What type of business do you run?</h2>
        <div role="radiogroup" className="mt-4 grid gap-2 sm:grid-cols-2">
          {BUSINESS_TYPES.map(([id, icon, label]) => (
            <Option key={id} selected={v.type === id} onClick={() => update({ type: id })}>
              {icon ? <span aria-hidden="true">{icon} </span> : null}{label}
            </Option>
          ))}
        </div>
        {v.type === "other" ? (
          <label className="mt-4 block text-sm">
            <span className="font-medium">Tell us what type of business you run</span>
            <input
              value={v.otherType}
              maxLength={80}
              onChange={(e) => update({ otherType: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-button border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        ) : null}
      </section>

      {typeDone ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">2. How many people regularly use your business systems?</h2>
          <div role="radiogroup" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {TEAM_SIZES.map((s) => (
              <Option key={s} selected={v.teamSize === s} onClick={() => update({ teamSize: s })}>{s}</Option>
            ))}
          </div>
        </section>
      ) : null}

      {typeDone && v.teamSize ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">3. What do you want to check?</h2>
          <div role="radiogroup" className="mt-4 grid gap-2 sm:grid-cols-2">
            <Option selected={v.mode === "quick"} onClick={() => update({ mode: "quick" })}>
              <span className="block font-medium text-foreground">Quick Check</span>
              <span className="mt-1 block">Review the highest-priority business security risks.</span>
            </Option>
            <Option selected={v.mode === "deep"} onClick={() => update({ mode: "deep" })}>
              <span className="block font-medium text-foreground">Deep Check</span>
              <span className="mt-1 block">Review more business security areas in greater detail.</span>
            </Option>
          </div>
        </section>
      ) : null}

      {ready ? (
        <div className="mt-10">
          <Button className="w-full sm:w-auto" onClick={() => navigate({ to: "/checkup/business/start" })}>Start Business Checkup</Button>
        </div>
      ) : null}
    </CheckupShell>
  );
}
