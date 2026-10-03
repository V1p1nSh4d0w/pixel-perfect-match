import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

export function CheckupShell({ children, back }: { children: ReactNode; back?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <BrandLogo className="text-base font-semibold tracking-tight" />
          {back ? (
            <Link to="/checkup" className="text-sm text-muted-foreground hover:text-foreground">
              ← All checkups
            </Link>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-16 md:py-20">{children}</main>
    </div>
  );
}
