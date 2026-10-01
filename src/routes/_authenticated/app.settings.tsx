import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { PageHeader } from "@/components/PageHeader";
import { useProfile } from "@/hooks/useProfile";
import { signOut, updateBusinessName } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
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
    await navigate({ to: "/login", replace: true });
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-md space-y-6">
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
      </div>
    </>
  );
}
