import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

// Kept flat for pageTitleForPath / top-bar lookups; rendering uses NAV_GROUPS.
export const NAV_ITEMS = [
  { label: "Dashboard", to: "/app" },
  { label: "Assessment", to: "/app/assessment" },
  { label: "Findings", to: "/app/findings" },
  { label: "Action Plan", to: "/app/action-plan" },
  { label: "Reports", to: "/app/reports" },
  { label: "Settings", to: "/app/settings" },
] as const;

type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 shrink-0", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  assessment: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  findings: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  "action-plan": (
    <>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>
  ),
  reports: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  pricing: (
    <>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </>
  ),
  settings: (
    <>
      <line x1="21" y1="4" x2="14" y2="4" />
      <line x1="10" y1="4" x2="3" y2="4" />
      <line x1="21" y1="12" x2="12" y2="12" />
      <line x1="8" y1="12" x2="3" y2="12" />
      <line x1="21" y1="20" x2="16" y2="20" />
      <line x1="12" y1="20" x2="3" y2="20" />
      <line x1="14" y1="2" x2="14" y2="6" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="16" y1="18" x2="16" y2="22" />
    </>
  ),
};

type NavGroup = {
  label: string;
  items: { label: string; to: string; icon: keyof typeof ICONS }[];
};

export const NAV_GROUPS: NavGroup[] = [
  { label: "Main", items: [{ label: "Dashboard", to: "/app", icon: "dashboard" }] },
  {
    label: "Assessment",
    items: [
      { label: "Assessment", to: "/app/assessment", icon: "assessment" },
      { label: "Findings", to: "/app/findings", icon: "findings" },
      { label: "Action Plan", to: "/app/action-plan", icon: "action-plan" },
      { label: "Reports", to: "/app/reports", icon: "reports" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Pricing", to: "/pricing", icon: "pricing" },
      { label: "Settings", to: "/app/settings", icon: "settings" },
    ],
  },
];

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
    <nav className="flex flex-col" aria-label="Main navigation">
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={group.label} className={cn(groupIndex > 0 && "mt-4")}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {group.label}
          </p>
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const active = item.to === current;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors",
                      active
                        ? "border-primary bg-surface-raised font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
                      <Icon>{ICONS[item.icon]}</Icon>
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
