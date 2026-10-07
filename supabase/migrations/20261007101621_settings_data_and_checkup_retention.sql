-- Keep the newest run and three prior runs for each user's checkup stream.
-- Scope and path are both part of the key so Personal/Business and every
-- distinct checkup flow retain independent histories.
LOCK TABLE public.checkup_results IN SHARE ROW EXCLUSIVE MODE;

WITH ranked_runs AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, scope, checkup_path
      ORDER BY created_at DESC, id DESC
    ) AS run_number
  FROM public.checkup_results
)
DELETE FROM public.checkup_results AS result
USING ranked_runs
WHERE result.id = ranked_runs.id
  AND ranked_runs.run_number > 4;

CREATE OR REPLACE FUNCTION public.prune_checkup_result_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      NEW.user_id::text || ':' || NEW.scope || ':' || NEW.checkup_path,
      0
    )
  );

  WITH ranked_runs AS (
    SELECT
      id,
      row_number() OVER (ORDER BY created_at DESC, id DESC) AS run_number
    FROM public.checkup_results
    WHERE user_id = NEW.user_id
      AND scope = NEW.scope
      AND checkup_path = NEW.checkup_path
  )
  DELETE FROM public.checkup_results AS result
  USING ranked_runs
  WHERE result.id = ranked_runs.id
    AND ranked_runs.run_number > 4;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_checkup_result_history() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS prune_checkup_result_history_after_insert ON public.checkup_results;
CREATE TRIGGER prune_checkup_result_history_after_insert
AFTER INSERT ON public.checkup_results
FOR EACH ROW
EXECUTE FUNCTION public.prune_checkup_result_history();

-- Delete only the caller's account. Cascades remove rows with ON DELETE CASCADE;
-- explicitly remove caller-owned analytics/payment records whose foreign keys
-- intentionally use SET NULL or have no FK, before deleting the auth user.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  caller_id uuid := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.events WHERE user_id = caller_id;
  DELETE FROM public.template_events WHERE user_id = caller_id;
  DELETE FROM public.audits WHERE user_id = caller_id;
  DELETE FROM auth.users WHERE id = caller_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
