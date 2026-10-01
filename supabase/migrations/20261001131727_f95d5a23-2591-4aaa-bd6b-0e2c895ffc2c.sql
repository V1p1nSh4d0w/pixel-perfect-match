ALTER TABLE public.profiles
  ADD COLUMN onboarding_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN viewed_findings boolean NOT NULL DEFAULT false,
  ADD COLUMN downloaded_report boolean NOT NULL DEFAULT false,
  ADD COLUMN dismissed_onboarding boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN onboarding_eligible SET DEFAULT true;