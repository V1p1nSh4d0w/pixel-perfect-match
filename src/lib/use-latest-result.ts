import { useQuery } from "@tanstack/react-query";
import { fetchLatestResult } from "@/lib/supabase";

export const LATEST_RESULT_KEY = ["latest-assessment"] as const;

export function useLatestResult() {
  const q = useQuery({ queryKey: LATEST_RESULT_KEY, queryFn: fetchLatestResult });
  return { result: q.data ?? null, isLoading: q.isLoading, error: q.error };
}
