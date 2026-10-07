import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { signUpWithEmail, supabase } from "@/lib/supabase";
import { completeFindingsDestination, rememberFindingsDestination } from "@/lib/auth-continuation";

export const Route = createFileRoute("/signup")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { returnTo?: string } => typeof search["returnTo"] === "string"
    ? { returnTo: search["returnTo"] }
    : {},
  head: () => ({
    meta: [
      { title: "Create your SecureCheck account" },
      { name: "description", content: "Sign up for SecureCheck and start your first security assessment." },
      { property: "og:title", content: "Create your SecureCheck account" },
      {
        property: "og:description",
        content: "Sign up for SecureCheck and start your first security assessment.",
      },
    ],
  }),
  beforeLoad: async ({ search }) => {
    rememberFindingsDestination(search.returnTo);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const destination = await completeFindingsDestination(search.returnTo);
      if (destination) throw redirect({ to: "/app/findings", search: destination });
      throw redirect({ to: "/app" });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    businessName?: string;
    email?: string;
    password?: string;
    form?: string;
    notice?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!businessName.trim()) next.businessName = "Business name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const result = await signUpWithEmail(email.trim(), password, businessName.trim());
      if (!result.session) {
        setErrors({ notice: "Check your email to confirm your account. Your checkup will be waiting when you return here." });
        return;
      }
      const destination = await completeFindingsDestination(returnTo);
      if (destination) await navigate({ to: "/app/findings", search: destination });
      else await navigate({ to: "/app" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Could not create your account" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backHome
      title="Create your account"
      subtitle={returnTo ? "Create your free account to view your detailed findings." : "Takes less than a minute."}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" search={returnTo ? { returnTo } : {}} className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          error={errors.businessName}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="At least 8 characters"
        />
        {errors.form ? <p className="text-xs text-danger">{errors.form}</p> : null}
        {errors.notice ? <p className="text-xs text-muted-foreground">{errors.notice}</p> : null}
        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
