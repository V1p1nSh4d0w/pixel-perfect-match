import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { toast } from "sonner";
import { fetchLatestAnswersFor, loadLocalAnswers, saveCheckupResult, type CheckupItem } from "@/lib/checkup-results";

/**
 * Saves each completed checkup (tab always; account when signed in) and, when
 * opened with ?results=1 (e.g. "Back to Results" from Findings), restores the
 * latest answers and shows the results screen again.
 */
export function useCheckupPersistence<A extends string>(opts: {
  done: boolean;
  answers: Record<string, A>;
  items: CheckupItem[];
  name: string;
  restore: (answers: Record<string, A>) => void;
}) {
  const { pathname, search } = useLocation();
  const savedFor = useRef<string | null>(null);
  const restoring = useRef(false);
  const { done, answers, items, name, restore } = opts;

  useEffect(() => {
    if (!(search as Record<string, unknown>)["results"]) return;
    restoring.current = true;
    const local = loadLocalAnswers(pathname);
    const apply = (a: Record<string, string> | null) => {
      if (a) { savedFor.current = JSON.stringify(a); restore(a as Record<string, A>); }
      restoring.current = false;
    };
    if (local) apply(local);
    else fetchLatestAnswersFor(pathname).then(apply, () => apply(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!done || restoring.current) return;
    const signature = JSON.stringify(answers);
    if (savedFor.current === signature) return;
    savedFor.current = signature;
    saveCheckupResult({ path: pathname, name, answers, items }).catch((e: unknown) => {
      savedFor.current = null;
      console.error("Saving checkup results failed", e);
      toast.error("Your results couldn't be saved to your account. They're still shown here.");
    });
  }, [done, answers, items, name, pathname]);

  return { path: pathname };
}
