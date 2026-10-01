CREATE TABLE public.template_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event text NOT NULL CHECK (event IN ('template_button_clicked','unlock_clicked','template_downloaded')),
  template_name text NOT NULL,
  finding_id uuid,
  price_paise integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.template_events TO authenticated;
GRANT ALL ON public.template_events TO service_role;
ALTER TABLE public.template_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read template events" ON public.template_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));