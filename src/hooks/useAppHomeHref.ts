import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Destination for public-page logo links: /app for signed-in users, / for
 * signed-out. Returns null until the session has been read (link then falls
 * back to /app, whose auth gate handles signed-out users).
 */
export function useAppHomeHref() {
  const [href, setHref] = useState<"/app" | "/" | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHref(data.session ? "/app" : "/");
    });
  }, []);
  return href;
}
