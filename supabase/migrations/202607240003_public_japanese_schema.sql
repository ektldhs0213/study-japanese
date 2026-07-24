-- Align an existing Japanese-study database with the public, no-auth schema.
-- This migration preserves existing sentence/history data when legacy columns
-- are present.

alter table public.jp_words drop column if exists user_id;
alter table public.jp_words drop constraint if exists jp_words_japanese_pos_key;
drop index if exists public.jp_words_user_created_idx;
create index if not exists jp_words_created_idx on public.jp_words(created_at desc);
create index if not exists jp_words_lookup_idx on public.jp_words(japanese, pos);

alter table public.jp_sentences add column if not exists created_at timestamptz default now();
alter table public.jp_sentences drop column if exists user_id;
alter table public.jp_sentences drop column if exists source;
alter table public.jp_sentences alter column created_at set not null;

alter table public.jp_history add column if not exists japanese text;
alter table public.jp_history add column if not exists action text;
alter table public.jp_history add column if not exists created_at timestamptz default now();

do $migration$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jp_history' and column_name = 'word_id'
  ) then
    execute '
      update public.jp_history history
      set japanese = words.japanese
      from public.jp_words words
      where history.word_id = words.id and history.japanese is null
    ';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jp_history' and column_name = 'result'
  ) then
    execute 'update public.jp_history set action = result where action is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jp_history' and column_name = 'studied_at'
  ) then
    execute 'update public.jp_history set created_at = studied_at where studied_at is not null';
  end if;
end
$migration$;

update public.jp_history set japanese = 'unknown' where japanese is null;
update public.jp_history set action = 'studied' where action is null;

alter table public.jp_history alter column japanese set not null;
alter table public.jp_history alter column action set not null;
alter table public.jp_history alter column created_at set not null;
alter table public.jp_history drop column if exists user_id;
alter table public.jp_history drop column if exists word_id;
alter table public.jp_history drop column if exists result;
alter table public.jp_history drop column if exists studied_at;
drop index if exists public.jp_history_user_studied_idx;
create index if not exists jp_history_created_idx on public.jp_history(created_at desc);

alter table public.jp_words enable row level security;
alter table public.jp_sentences enable row level security;
alter table public.jp_history enable row level security;

drop policy if exists "Users manage own jp_words" on public.jp_words;
drop policy if exists "Public users manage jp_words" on public.jp_words;
drop policy if exists "Public reads jp_words" on public.jp_words;
drop policy if exists "Public inserts jp_words" on public.jp_words;
create policy "Public reads jp_words" on public.jp_words
  for select to anon, authenticated using (true);
create policy "Public inserts jp_words" on public.jp_words
  for insert to anon, authenticated with check (true);

drop policy if exists "Users manage own jp_sentences" on public.jp_sentences;
drop policy if exists "Public reads jp_sentences" on public.jp_sentences;
drop policy if exists "Public inserts jp_sentences" on public.jp_sentences;
create policy "Public reads jp_sentences" on public.jp_sentences
  for select to anon, authenticated using (true);
create policy "Public inserts jp_sentences" on public.jp_sentences
  for insert to anon, authenticated with check (true);

drop policy if exists "Users manage own jp_history" on public.jp_history;
drop policy if exists "Public reads jp_history" on public.jp_history;
drop policy if exists "Public inserts jp_history" on public.jp_history;
create policy "Public reads jp_history" on public.jp_history
  for select to anon, authenticated using (true);
create policy "Public inserts jp_history" on public.jp_history
  for insert to anon, authenticated with check (true);

revoke update, delete on public.jp_words from anon, authenticated;
revoke update, delete on public.jp_sentences from anon, authenticated;
revoke update, delete on public.jp_history from anon, authenticated;
grant select, insert on public.jp_words to anon, authenticated;
grant select, insert on public.jp_sentences to anon, authenticated;
grant select, insert on public.jp_history to anon, authenticated;
