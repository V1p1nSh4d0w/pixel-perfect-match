ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_razorpay_order_id_key
  ON public.subscriptions (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.has_paid_access(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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

REVOKE ALL ON FUNCTION public.has_paid_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_paid_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_paid_access(uuid) TO service_role;