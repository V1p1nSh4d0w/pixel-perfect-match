import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/app" },
  { label: "Assessment", to: "/app/assessment" },
  { label: "Findings", to: "/app/findings" },
  { label: "Action Plan", to: "/app/action-plan" },
  { label: "Reports", to: "/app/reports" },
  { label: "Settings", to: "/app/settings" },
] as const;

function activePath(pathname: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return match?.to ?? "/app";
}

export function pageTitleForPath(pathname: string): string {
  const to = activePath(pathname);
  return NAV_ITEMS.find((item) => item.to === to)?.label ?? "Dashboard";
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const current = activePath(pathname);

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.to === current;
        return (
          <div key={item.to} className="flex flex-col gap-1">
            {item.to === "/app/settings" ? (
              <>
                <div className="my-2 border-t border-border" />
                <Link
                  to="/pricing"
                  onClick={onNavigate}
                  className="border-l-2 border-transparent py-2 pl-3 text-sm text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                >
                  Pricing
                </Link>
              </>
            ) : null}
            <Link
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "border-l-2 py-2 pl-3 text-sm transition-colors",
                active
                  ? "border-primary bg-surface-raised font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
