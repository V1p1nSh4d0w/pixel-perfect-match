import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SidebarNav, pageTitleForPath } from "@/components/SidebarNav";
import { useProfile } from "@/hooks/useProfile";
import { signOut } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useProfile();
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
    await navigate({ to: "/login", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="px-5 py-5">
        <Link to="/app" className="text-base font-semibold tracking-tight text-foreground">
          SecureCheck
        </Link>
      </div>
      <div className="flex-1 px-2">
        <SidebarNav onNavigate={() => setDrawerOpen(false)} />
      </div>
      <div className="space-y-1 border-t border-border px-5 py-4">
        <p className="truncate text-xs text-muted-foreground">{email}</p>
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
      <aside className="fixed inset-y-0 left-0 hidden w-60 md:block">{sidebar}</aside>

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

      <div className="md:pl-60">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-5">
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
            <span className="hidden truncate text-sm text-muted-foreground sm:block">{businessName}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-xs font-medium text-foreground">
              {initial}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
