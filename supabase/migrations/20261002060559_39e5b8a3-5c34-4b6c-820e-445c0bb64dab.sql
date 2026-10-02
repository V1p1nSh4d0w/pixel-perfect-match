CREATE TABLE public.playbook_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  finding_id uuid NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (finding_id, step_index)
);
GRANT SELECT, INSERT, DELETE ON public.playbook_progress TO authenticated;
GRANT ALL ON public.playbook_progress TO service_role;
ALTER TABLE public.playbook_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own playbook progress" ON public.playbook_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own playbook progress" ON public.playbook_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.findings f WHERE f.id = finding_id AND f.user_id = auth.uid()));
CREATE POLICY "Users remove own playbook progress" ON public.playbook_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.control_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text NOT NULL,
  framework text NOT NULL,
  reference text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.control_references TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.control_references TO authenticated;
GRANT ALL ON public.control_references TO service_role;
ALTER TABLE public.control_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read references" ON public.control_references FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage references" ON public.control_references FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_control_references_updated_at BEFORE UPDATE ON public.control_references
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.control_references (control_id, framework, reference, verified) VALUES
  ('personal_devices', 'ISO 27001:2022', 'Annex A 8.1 — User endpoint devices', false),
  ('personal_devices', 'CIS Controls v8', 'Control 4 — Secure Configuration of Enterprise Assets and Software', false);