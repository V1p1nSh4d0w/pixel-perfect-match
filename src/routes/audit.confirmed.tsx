import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { RETAINER_LINE } from "@/lib/config";

export const Route = createFileRoute("/audit/confirmed")({
  head: () => ({
    meta: [
      { title: "Audit booked — SecureCheck" },
      { name: "description", content: "Your SecureCheck Full Audit payment was received." },
      { property: "og:title", content: "Audit booked — SecureCheck" },
      { property: "og:description", content: "Your SecureCheck Full Audit payment was received." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Confirmed,
});

function Confirmed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-lg rounded-card border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold text-foreground">Payment received.</h1>
        <p className="mt-3 text-sm text-muted-foreground">Check your email for the booking link. We'll respond within 24 hours.</p>
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">{RETAINER_LINE}</p>
        <Link to="/app" className="mt-6 block">
          <Button fullWidth>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
