ALTER TABLE public.findings
  ADD COLUMN reassessed_at timestamptz,
  ADD COLUMN previous_answer text,
  ADD COLUMN reassessed_answer text,
  ADD COLUMN previous_score integer,
  ADD COLUMN new_score integer;