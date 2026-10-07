import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { rememberFindingsDestination } from "@/lib/auth-continuation";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      const returnTo = location.pathname === "/app/findings" ? location.href : undefined;
      rememberFindingsDestination(returnTo);
      throw redirect({ to: "/login", search: returnTo ? { returnTo } : {} });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
