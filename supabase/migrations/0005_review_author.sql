-- Snapshot the reviewer's display name on the review so approved reviews can
-- show an author publicly without exposing the customers table (which is
-- owner-scoped by RLS).
alter table public.reviews add column if not exists author_name text;
