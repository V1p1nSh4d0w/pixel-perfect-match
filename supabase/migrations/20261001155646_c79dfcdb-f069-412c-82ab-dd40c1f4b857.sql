CREATE OR REPLACE FUNCTION public.has_paid_access(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.subscriptions
      WHERE user_id = _user_id
        AND (
          (plan = 'starter' AND status = 'active')
          OR
          (plan = 'pro' AND current_period_end IS NOT NULL AND current_period_end > now())
        )
    )
$$;