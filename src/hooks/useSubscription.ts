import { useQuery } from "@tanstack/react-query";
import { fetchSubscription } from "@/lib/supabase";
import { hasPaidAccess, type Subscription } from "@/types/subscription";

export const SUBSCRIPTION_KEY = ["subscription"] as const;

export function useSubscription() {
  const q = useQuery<Subscription | null>({ queryKey: SUBSCRIPTION_KEY, queryFn: fetchSubscription });
  const isPro = hasPaidAccess(q.data);
  return { subscription: q.data ?? null, isPro, hasPaidAccess: isPro, isLoading: q.isLoading };
}
