-- The Findings page presents one latest run and up to three prior runs for a
-- selected Personal or Business scope, across all checkup paths in that scope.
-- Lock out writes while existing history is brought into that same model.
LOCK TABLE public.checkup_results IN SHARE ROW EXCLUSIVE MODE;

WITH ranked_runs AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, scope
      ORDER BY created_at DESC, id DESC
    ) AS run_number
  FROM public.checkup_results
)
DELETE FROM public.checkup_results AS result
USING ranked_runs
WHERE result.id = ranked_runs.id
  AND ranked_runs.run_number > 4;

-- Replace the existing function in place. Its existing trigger remains bound
-- to this function, so no duplicate trigger or retention path is introduced.
CREATE OR REPLACE FUNCTION public.prune_checkup_result_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  -- Serialize inserts for one user's scope even when they use different paths.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.user_id::text || ':' || NEW.scope, 0)
  );

  WITH ranked_runs AS (
    SELECT
      id,
      row_number() OVER (ORDER BY created_at DESC, id DESC) AS run_number
    FROM public.checkup_results
    WHERE user_id = NEW.user_id
      AND scope = NEW.scope
  )
  DELETE FROM public.checkup_results AS result
  USING ranked_runs
  WHERE result.id = ranked_runs.id
    AND ranked_runs.run_number > 4;

  RETURN NEW;
END;
$$;
