CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES public.findings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_items TO authenticated;
GRANT ALL ON public.action_items TO service_role;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own action items" ON public.action_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own action items" ON public.action_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND (finding_id IS NULL OR EXISTS (SELECT 1 FROM public.findings f WHERE f.id = finding_id AND f.user_id = auth.uid())));
CREATE POLICY "Users update own action items" ON public.action_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own action items" ON public.action_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE UNIQUE INDEX action_items_user_finding_uniq ON public.action_items (user_id, finding_id) WHERE finding_id IS NOT NULL;