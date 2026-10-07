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
import { deleteMyAccount, exportMyAccountData, signOut, signOutOtherSessions, updateBusinessName, updatePassword } from "@/lib/supabase";
import { usePremiumEnabled } from "@/hooks/useSubscription";
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
  const { premiumEnabled } = usePremiumEnabled();
  const tabs = [
    { label: "Account", search: {} },
    ...(premiumEnabled ? [{ label: "Billing", search: { tab: "billing" as const } }] : []),
  ];
  const showBilling = premiumEnabled && tab === "billing";
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Settings" />
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => {
          const active = t.label === "Billing" ? showBilling : !showBilling;
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
      {showBilling ? (
        <div className="max-w-md space-y-6"><BillingPanel /></div>
      ) : (
        <div className="space-y-6"><AccountPanel /></div>
      )}
    </div>
  );
}

function AccountPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useProfile();
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSignOutOthers() {
    setSigningOutOthers(true);
    try {
      await signOutOtherSessions();
      toast.success("Other sessions have been signed out.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign out other sessions.");
    } finally {
      setSigningOutOthers(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportMyAccountData();
      const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `securecheck-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Your data export has been downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export your data.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      await deleteMyAccount();
      queryClient.clear();
      toast.success("Your account and associated data have been deleted.");
      await navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete your account.");
      setDeletingAccount(false);
    }
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
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
        <div className="mt-5 border-t border-border pt-5">
          <Button variant="secondary" onClick={handleSignOut}>Sign out</Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Security</CardTitle>
        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <Input label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit" loading={changingPassword}>Change password</Button>
        </form>
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-3 text-sm text-muted-foreground">Sign out of SecureCheck on every other device. This session will stay signed in.</p>
          <Button variant="secondary" onClick={handleSignOutOthers} loading={signingOutOthers}>Sign out of all other sessions</Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Privacy &amp; Data</CardTitle>
        <p className="mt-3 text-sm text-muted-foreground">Download a copy of your SecureCheck account and checkup data.</p>
        <div className="mt-4"><Button variant="secondary" onClick={handleExport} loading={exporting}>Export my data</Button></div>
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">Deleting your account permanently removes your profile and associated SecureCheck data.</p>
          {!confirmingDeletion ? (
            <div className="mt-4"><Button variant="danger" onClick={() => setConfirmingDeletion(true)}>Delete my account</Button></div>
          ) : (
            <div className="mt-4 rounded-card border border-danger/40 bg-danger/5 p-4">
              <p className="text-sm font-medium">Are you sure you want to permanently delete your account?</p>
              <p className="mt-1 text-sm text-muted-foreground">This cannot be undone. Your account and associated data will be removed.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="danger" onClick={handleDeleteAccount} loading={deletingAccount}>Permanently delete account</Button>
                <Button variant="secondary" onClick={() => setConfirmingDeletion(false)} disabled={deletingAccount}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
