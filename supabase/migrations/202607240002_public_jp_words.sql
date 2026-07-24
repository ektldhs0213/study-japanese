-- Convert an existing authenticated/private word table into a shared public
-- wordbook. Apply this migration when 202607240001_initial_schema.sql has
-- already been executed.

do $migration$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jp_words' and column_name = 'user_id'
  ) then
    execute '
      alter table public.jp_words
        alter column user_id drop not null,
        alter column user_id drop default
    ';
  end if;
end
$migration$;

alter table public.jp_words
  drop constraint if exists jp_words_user_id_japanese_pos_key;

-- Remove duplicate Japanese+POS rows before adding the public unique key.
with duplicates as (
  select
    id,
    row_number() over (
      partition by japanese, pos
      order by created_at desc, id desc
    ) as duplicate_number
  from public.jp_words
)
delete from public.jp_words
where id in (
  select id from duplicates where duplicate_number > 1
);

alter table public.jp_words
  drop constraint if exists jp_words_japanese_pos_key;

alter table public.jp_words
  add constraint jp_words_japanese_pos_key unique (japanese, pos);

drop policy if exists "Users manage own jp_words" on public.jp_words;
drop policy if exists "Public users manage jp_words" on public.jp_words;
drop policy if exists "Public reads jp_words" on public.jp_words;
drop policy if exists "Public inserts jp_words" on public.jp_words;

create policy "Public reads jp_words"
on public.jp_words
for select
to anon, authenticated
using (true);

create policy "Public inserts jp_words"
on public.jp_words
for insert
to anon, authenticated
with check (true);

revoke update, delete on public.jp_words from anon, authenticated;
grant select, insert on public.jp_words to anon, authenticated;
