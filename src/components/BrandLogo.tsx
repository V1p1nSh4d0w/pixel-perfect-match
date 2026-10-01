import { Link } from "@tanstack/react-router";
import { useAppHomeHref } from "@/hooks/useAppHomeHref";

/**
 * The SecureCheck wordmark for public pages. Signed-in users go straight to
 * /app; signed-out users go to the landing page — no redirect flash.
 */
export function BrandLogo({ className }: { className?: string }) {
  const href = useAppHomeHref();
  return (
    <Link to={href ?? "/app"} className={className}>
      SecureCheck
    </Link>
  );
}
