import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  backHome,
}: {
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
  footer?: ReactNode;
  backHome?: boolean | undefined;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      {backHome ? (
        <Link to="/" className="absolute left-6 top-6 text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Back to home
        </Link>
      ) : null}
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <BrandLogo className="block text-lg font-semibold tracking-tight text-foreground" />
          <p className="mt-1 text-sm text-muted-foreground">Know your security. Fix what matters.</p>
        </div>

        <div className="rounded-card border border-border bg-card p-6">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  );
}
