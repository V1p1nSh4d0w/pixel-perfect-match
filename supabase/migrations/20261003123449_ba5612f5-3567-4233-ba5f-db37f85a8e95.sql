CREATE TABLE public.checkup_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('personal','business')),
  checkup_path text NOT NULL,
  checkup_name text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.checkup_results TO authenticated;
GRANT ALL ON public.checkup_results TO service_role;
ALTER TABLE public.checkup_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own checkup results" ON public.checkup_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own checkup results" ON public.checkup_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX checkup_results_user_idx ON public.checkup_results (user_id, checkup_path, created_at DESC);