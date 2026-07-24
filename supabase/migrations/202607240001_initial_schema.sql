create extension if not exists pgcrypto;

create table if not exists public.jp_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  japanese text not null,
  reading text not null,
  meaning text not null,
  pos text not null,
  semantic_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, japanese, pos)
);

create table if not exists public.jp_sentences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  japanese text not null,
  reading text not null,
  meaning text not null,
  source text not null default 'local',
  created_at timestamptz not null default now()
);

create table if not exists public.jp_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  word_id uuid not null references public.jp_words(id) on delete cascade,
  result text not null default 'studied',
  studied_at timestamptz not null default now()
);

create table if not exists public.bg_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.bg_users (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, nickname)
);

create table if not exists public.bg_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game_id uuid not null references public.bg_games(id) on delete restrict,
  played_at timestamptz not null default now()
);

create table if not exists public.bg_scores (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.bg_matches(id) on delete cascade,
  player_id uuid not null references public.bg_users(id) on delete restrict,
  score numeric not null default 0,
  rank integer check (rank is null or rank > 0),
  unique (match_id, player_id)
);

create index if not exists jp_words_user_created_idx on public.jp_words(user_id, created_at desc);
create index if not exists jp_history_user_studied_idx on public.jp_history(user_id, studied_at desc);
create index if not exists bg_matches_game_played_idx on public.bg_matches(game_id, played_at desc);
create index if not exists bg_scores_match_rank_idx on public.bg_scores(match_id, rank);

alter table public.jp_words enable row level security;
alter table public.jp_sentences enable row level security;
alter table public.jp_history enable row level security;
alter table public.bg_games enable row level security;
alter table public.bg_users enable row level security;
alter table public.bg_matches enable row level security;
alter table public.bg_scores enable row level security;

create policy "Users manage own jp_words" on public.jp_words
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage own jp_sentences" on public.jp_sentences
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage own jp_history" on public.jp_history
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage own bg_games" on public.bg_games
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage own bg_users" on public.bg_users
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users manage own bg_matches" on public.bg_matches
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage scores for own matches" on public.bg_scores
  for all to authenticated using (
    exists (select 1 from public.bg_matches m where m.id = match_id and m.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.bg_matches m where m.id = match_id and m.user_id = (select auth.uid()))
  );

grant select, insert, update, delete on public.jp_words to authenticated;
grant select, insert, update, delete on public.jp_sentences to authenticated;
grant select, insert, update, delete on public.jp_history to authenticated;
grant select, insert, update, delete on public.bg_games to authenticated;
grant select, insert, update, delete on public.bg_users to authenticated;
grant select, insert, update, delete on public.bg_matches to authenticated;
grant select, insert, update, delete on public.bg_scores to authenticated;
