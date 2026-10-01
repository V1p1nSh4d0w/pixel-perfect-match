import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SidebarNav, pageTitleForPath } from "@/components/SidebarNav";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { signOut } from "@/lib/supabase";
import { SUPPORT_EMAIL } from "@/lib/config";
import { AccountMenu } from "@/components/AccountMenu";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useProfile();
  const { isPro } = useSubscription();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const email = data?.email ?? "";
  const businessName = data?.profile?.business_name ?? "";
  const initial = (businessName || email || "?").trim().charAt(0).toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <Link to="/app" className="text-base font-semibold tracking-tight text-foreground">
          SecureCheck
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <SidebarNav onNavigate={() => setDrawerOpen(false)} />
      </div>
      <div className="space-y-1.5 border-t border-border px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {isPro ? "Pro plan" : "Free plan"}
          </span>
          {isPro ? (
            <span className="rounded-full border border-primary px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-primary">
              Pro
            </span>
          ) : null}
        </div>
        <Link to="/audit" onClick={() => setDrawerOpen(false)} className="block text-xs text-muted-foreground transition-colors hover:text-foreground">
          Full Audit — ₹15,000
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs text-primary transition-colors hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 md:block print:hidden">{sidebar}</aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-background/80"
          />
          <div className="absolute inset-y-0 left-0 w-60">{sidebar}</div>
        </div>
      ) : null}

      <div className="md:pl-60 print:pl-0">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-5 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-button border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
              </span>
            </button>
            <span className="text-sm font-medium text-foreground">{pageTitleForPath(pathname)}</span>
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hidden text-xs text-muted-foreground hover:text-foreground lg:block">Support: {SUPPORT_EMAIL}</a>
            ) : null}
            <span className="hidden truncate text-sm text-muted-foreground sm:block">{businessName}</span>
            {isPro ? (
              <span className="rounded-full border border-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary">PRO</span>
            ) : null}
            <AccountMenu initial={initial} email={email} isPro={isPro} />
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] p-8 print:max-w-none print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
