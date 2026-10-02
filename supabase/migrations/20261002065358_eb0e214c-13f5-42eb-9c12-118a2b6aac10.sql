CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT UPDATE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads flags" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update flags" ON public.feature_flags FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.feature_flags (key, enabled) VALUES ('premium_enabled', false);

CREATE OR REPLACE FUNCTION public.premium_enabled()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT enabled FROM public.feature_flags WHERE key = 'premium_enabled'), false)
$$;

CREATE OR REPLACE FUNCTION public.has_feature_access(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND (NOT public.premium_enabled() OR public.has_paid_access(_user_id))
$$;

CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  linked_finding_key text NOT NULL,
  file_path text NOT NULL,
  preview_text text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read published templates" ON public.templates FOR SELECT TO authenticated
  USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert templates" ON public.templates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update templates" ON public.templates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete templates" ON public.templates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.templates (title, description, linked_finding_key, file_path, preview_text, published) VALUES
 ('Security Policy Template', 'A one-page security policy you can adapt and sign.', 'no_written_security_policy', 'security-policy-template.pdf', 'Covers passwords, MFA, devices, email, backups, access and incident reporting.', true),
 ('MFA Rollout Guide', 'A one-week plan to turn on multi-factor authentication.', 'mfa_not_enabled', 'mfa-rollout-guide.pdf', 'Day-by-day steps to enable MFA, starting with admin and email accounts.', true),
 ('Backup & Restore Checklist', 'A checklist to set up and test backups.', 'backups_not_tested', 'backup-restore-checklist.pdf', 'What to back up, how often, and how to run a quarterly restore test.', true);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_name text NOT NULL CHECK (event_name IN ('template_button_clicked','template_downloaded','domain_check_run','report_shared','help_requested','premium_requested')),
  object_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_name_created_idx ON public.events (event_name, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update events" ON public.events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE lower(email) = 'hello.securecheck@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;