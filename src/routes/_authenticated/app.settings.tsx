import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { PageHeader } from "@/components/PageHeader";
import { BillingPanel } from "@/components/BillingPanel";
import { useProfile } from "@/hooks/useProfile";
import { signOut, updateBusinessName } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [
    { title: "Settings — SecureCheck" },
    { name: "description", content: "Manage your SecureCheck account and billing settings." },
    { property: "og:title", content: "Settings — SecureCheck" },
    { property: "og:description", content: "Manage your SecureCheck account and billing settings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  validateSearch: (search: Record<string, unknown>) =>
    search["tab"] === "billing" ? { tab: "billing" as const } : {},
  component: SettingsPage,
});

function SettingsPage() {
  const { tab } = Route.useSearch();
  const tabs = [
    { label: "Account", search: {} },
    { label: "Billing", search: { tab: "billing" as const } },
  ];
  return (
    <>
      <PageHeader title="Settings" />
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => {
          const active = (t.label === "Billing") === (tab === "billing");
          return (
            <Link
              key={t.label}
              to="/app/settings"
              search={t.search}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <div className="max-w-md space-y-6">{tab === "billing" ? <BillingPanel /> : <AccountPanel />}</div>
    </>
  );
}

function AccountPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useProfile();
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.profile) setBusinessName(data.profile.business_name);
  }, [data?.profile]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }
    if (!data) return;
    setError(undefined);
    setSaving(true);
    try {
      await updateBusinessName(data.userId, businessName.trim());
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Business name updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/", replace: true });
  }

  return (
    <>
      <Card>
        <CardTitle>Account</CardTitle>
        <form onSubmit={handleSave} className="mt-6 space-y-4" noValidate>
          <Input
            label="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            error={error}
            disabled={isLoading}
          />
          <Input label="Email" value={data?.email ?? ""} readOnly disabled />
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>
      </Card>
      <Button variant="secondary" onClick={handleSignOut}>
        Sign out
      </Button>
    </>
  );
}
