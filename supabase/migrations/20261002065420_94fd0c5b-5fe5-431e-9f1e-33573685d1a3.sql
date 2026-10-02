CREATE OR REPLACE FUNCTION public.premium_enabled()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT COALESCE((SELECT enabled FROM public.feature_flags WHERE key = 'premium_enabled'), false)
$$;