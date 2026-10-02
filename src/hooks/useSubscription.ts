import { useQuery } from "@tanstack/react-query";
import { fetchFeatureAccess, fetchPremiumEnabled, fetchSubscription } from "@/lib/supabase";
import { hasPaidAccess, type Subscription } from "@/types/subscription";

export const SUBSCRIPTION_KEY = ["subscription"] as const;

export function usePremiumEnabled() {
  const q = useQuery({ queryKey: ["premium-enabled"], queryFn: fetchPremiumEnabled });
  return { premiumEnabled: q.data === true, isLoading: q.isLoading };
}

export function useSubscription() {
  const q = useQuery<Subscription | null>({ queryKey: SUBSCRIPTION_KEY, queryFn: fetchSubscription });
  const access = useQuery({ queryKey: [...SUBSCRIPTION_KEY, "feature-access"], queryFn: fetchFeatureAccess });
  const { premiumEnabled } = usePremiumEnabled();
  const isPro = hasPaidAccess(q.data);
  // hasAccess: what paid-candidate features should render. Server functions re-check via has_feature_access().
  return { subscription: q.data ?? null, isPro, hasPaidAccess: isPro, hasAccess: access.data === true, premiumEnabled, isLoading: q.isLoading };
}
