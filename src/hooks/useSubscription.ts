import { useQuery } from "@tanstack/react-query";
import { fetchSubscription } from "@/lib/supabase";
import { isProActive, type Subscription } from "@/types/subscription";

export const SUBSCRIPTION_KEY = ["subscription"] as const;

export function useSubscription() {
  const q = useQuery<Subscription | null>({ queryKey: SUBSCRIPTION_KEY, queryFn: fetchSubscription });
  return { subscription: q.data ?? null, isPro: isProActive(q.data), isLoading: q.isLoading };
}
