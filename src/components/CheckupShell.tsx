import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

export function CheckupShell({ children, back, backTo = "/checkup", backLabel = "All checkups", personal, business }: { children: ReactNode; back?: boolean; backTo?: string; backLabel?: string; personal?: boolean; business?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <BrandLogo className="text-base font-semibold tracking-tight" />
          {back ? (
            <Link to={backTo} className="text-sm text-muted-foreground hover:text-foreground">
              {backLabel}
            </Link>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-16 md:py-20">
        {personal ? (
          <Link to="/checkup/personal" className="-mt-8 mb-8 inline-flex min-h-11 items-center rounded-button border border-border bg-card px-4 text-sm font-medium hover:border-primary md:-mt-10">
            ← Personal Security
          </Link>
        ) : null}
        {business ? (
          <Link to="/checkup/business/start" className="-mt-8 mb-8 inline-flex min-h-11 items-center rounded-button border border-border bg-card px-4 text-sm font-medium hover:border-primary md:-mt-10">
            ← Business Security
          </Link>
        ) : null}
        {children}
      </main>
    </div>
  );
}
