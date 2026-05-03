-- Optional schema for result persistence.
-- MVP does not need this table. Use it only when share URLs or aggregate stats are required.

create table if not exists public.coolbti_results (
  id uuid primary key default gen_random_uuid(),
  result_key text not null check (result_key in ('succulent', 'cactus', 'hoya', 'fishbone')),
  answers jsonb not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.coolbti_results enable row level security;

create policy "Allow anonymous result insert"
  on public.coolbti_results
  for insert
  to anon
  with check (true);

create policy "Allow anonymous result read"
  on public.coolbti_results
  for select
  to anon
  using (true);
