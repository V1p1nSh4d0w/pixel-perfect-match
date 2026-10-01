import { useQuery } from "@tanstack/react-query";
import { fetchProfile, supabase } from "@/lib/supabase";
import type { Profile } from "@/types/profile";

export function useProfile() {
  return useQuery<{ userId: string; email: string; profile: Profile | null } | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      return {
        userId: user.id,
        email: user.email ?? "",
        profile: await fetchProfile(user.id),
      };
    },
  });
}
