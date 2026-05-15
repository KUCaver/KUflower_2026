-- Supabase schema for 축제 쿨BTI.
-- Run this in Supabase SQL Editor before wiring the frontend.
--
-- Current app works without DB. Use this schema when adding:
-- 1) result persistence
-- 2) share URLs
-- 3) purchased/verified cyber garden gallery
--
-- Security model:
-- - anon can insert quiz results.
-- - anon can read only purchased/verified public gallery rows.
-- - anon cannot update/delete results.
-- - purchase codes are never readable by anon.
-- - purchase verification must go through an Edge Function using service_role.

create extension if not exists pgcrypto;

create table if not exists public.coolbti_results (
  id uuid primary key default gen_random_uuid(),
  public_slug text not null unique default encode(gen_random_bytes(8), 'hex'),
  client_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  result_key text not null check (result_key in ('succulent', 'cactus', 'hoya', 'fishbone')),
  answers jsonb not null,
  scores jsonb not null,
  card_payload jsonb not null default '{}'::jsonb,
  user_nickname text,
  plant_name text,
  user_intro text,
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  constraint coolbti_results_answers_array check (jsonb_typeof(answers) = 'array'),
  constraint coolbti_results_scores_object check (jsonb_typeof(scores) = 'object'),
  constraint coolbti_results_nickname_length check (
    user_nickname is null or char_length(user_nickname) <= 30
  ),
  constraint coolbti_results_plant_name_length check (
    plant_name is null or char_length(plant_name) <= 30
  ),
  constraint coolbti_results_user_intro_length check (
    user_intro is null or char_length(user_intro) <= 80
  )
);

alter table public.coolbti_results
  add column if not exists client_token text not null default encode(gen_random_bytes(16), 'hex');

alter table public.coolbti_results
  add column if not exists user_intro text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coolbti_results_client_token_key'
      and conrelid = 'public.coolbti_results'::regclass
  ) then
    alter table public.coolbti_results
      add constraint coolbti_results_client_token_key unique (client_token);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coolbti_results_user_intro_length'
      and conrelid = 'public.coolbti_results'::regclass
  ) then
    alter table public.coolbti_results
      add constraint coolbti_results_user_intro_length check (
        user_intro is null or char_length(user_intro) <= 80
      );
  end if;
end $$;

create index if not exists coolbti_results_result_key_idx
  on public.coolbti_results (result_key);

create index if not exists coolbti_results_created_at_idx
  on public.coolbti_results (created_at desc);

create index if not exists coolbti_results_public_gallery_idx
  on public.coolbti_results (created_at desc)
  where is_purchased = true;

alter table public.coolbti_results enable row level security;

grant insert on table public.coolbti_results to anon;
grant select, insert, update, delete on table public.coolbti_results to service_role;

drop policy if exists "coolbti anon insert results" on public.coolbti_results;
create policy "coolbti anon insert results"
  on public.coolbti_results
  for insert
  to anon
  with check (
    result_key in ('succulent', 'cactus', 'hoya', 'fishbone')
    and jsonb_typeof(answers) = 'array'
    and jsonb_typeof(scores) = 'object'
    and is_purchased = false
    and purchased_at is null
  );

drop policy if exists "coolbti anon read purchased gallery" on public.coolbti_results;
create policy "coolbti anon read purchased gallery"
  on public.coolbti_results
  for select
  to anon
  using (is_purchased = true);

create table if not exists public.purchase_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text,
  is_used boolean not null default false,
  used_at timestamptz,
  used_registration_id uuid references public.coolbti_results(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint purchase_codes_label_length check (label is null or char_length(label) <= 80)
);

create index if not exists purchase_codes_unused_idx
  on public.purchase_codes (created_at desc)
  where is_used = false;

alter table public.purchase_codes enable row level security;

grant select, insert, update, delete on table public.purchase_codes to service_role;

-- No anon policies on purchase_codes by design.
-- 운영자가 코드를 넣을 때는 Supabase dashboard, SQL editor, or server-side script only.

-- Optional helper view for public aggregate counts.
-- security_invoker keeps the underlying RLS behavior explicit for Supabase.
create or replace view public.coolbti_public_stats
with (security_invoker = true) as
select
  result_key,
  count(*)::integer as total_count
from public.coolbti_results
where is_purchased = true
group by result_key;

grant select on public.coolbti_public_stats to anon;
