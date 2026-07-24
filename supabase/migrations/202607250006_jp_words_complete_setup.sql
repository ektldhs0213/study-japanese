begin;

do $migration$
begin
  if to_regclass('public.jp_words') is null then
    raise exception 'public.jp_words table does not exist.';
  end if;
end
$migration$;

-- Stop the previous trigger while existing rows are normalized.
drop trigger if exists enforce_jp_word_dates_trigger on public.jp_words;

alter table public.jp_words
  add column if not exists study_date date;

update public.jp_words
set
  japanese = normalize(btrim(japanese), NFKC),
  pos = lower(btrim(pos)),
  meaning = (
    select string_agg(btrim(part.value), ', ' order by part.position)
    from unnest(string_to_array(meaning, ',')) with ordinality as part(value, position)
  ),
  study_date = coalesce(study_date, created_at::date);

alter table public.jp_words
  drop constraint if exists jp_words_japanese_meaning_key,
  drop constraint if exists jp_words_japanese_pos_key;

-- Merge duplicate Japanese + POS rows.
-- created_at keeps the first insertion date.
-- study_date keeps the latest update/study date.
with ranked as (
  select
    id,
    japanese,
    pos,
    row_number() over (
      partition by japanese, pos
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.jp_words
),
merged as (
  select
    words.japanese,
    words.pos,
    string_agg(
      distinct btrim(meaning_part.value),
      ', '
      order by btrim(meaning_part.value)
    ) as meanings,
    array_agg(distinct btrim(tag.value) order by btrim(tag.value))
      filter (where tag.value is not null and btrim(tag.value) <> '') as tags,
    min(words.created_at) as first_created_at,
    max(words.study_date) as latest_study_date
  from public.jp_words words
  cross join lateral unnest(string_to_array(words.meaning, ',')) as meaning_part(value)
  left join lateral unnest(coalesce(words.semantic_tags, array[]::text[])) as tag(value) on true
  group by words.japanese, words.pos
)
update public.jp_words keeper
set
  meaning = merged.meanings,
  semantic_tags = coalesce(merged.tags, array[]::text[]),
  created_at = merged.first_created_at,
  study_date = merged.latest_study_date
from ranked, merged
where keeper.id = ranked.id
  and ranked.duplicate_rank = 1
  and ranked.japanese = merged.japanese
  and ranked.pos = merged.pos;

with ranked as (
  select
    id,
    row_number() over (
      partition by japanese, pos
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.jp_words
)
delete from public.jp_words words
using ranked
where words.id = ranked.id
  and ranked.duplicate_rank > 1;

alter table public.jp_words
  alter column study_date type date using study_date::date,
  alter column study_date set default current_date,
  alter column study_date set not null,
  add constraint jp_words_japanese_pos_key unique (japanese, pos);

create index if not exists jp_words_study_date_idx
on public.jp_words (study_date desc);

-- INSERT: both dates use the selected input date.
-- UPDATE: created_at is immutable; only study_date changes.
create or replace function public.enforce_jp_word_dates()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, now());
    new.study_date := new.created_at::date;
  else
    new.created_at := old.created_at;
    new.study_date := coalesce(new.study_date, old.study_date);
  end if;
  return new;
end
$function$;

create trigger enforce_jp_word_dates_trigger
before insert or update on public.jp_words
for each row execute function public.enforce_jp_word_dates();

alter table public.jp_words enable row level security;

drop policy if exists "Users manage own jp_words" on public.jp_words;
drop policy if exists "Public users manage jp_words" on public.jp_words;
drop policy if exists "Public reads jp_words" on public.jp_words;
drop policy if exists "Public inserts jp_words" on public.jp_words;
drop policy if exists "Public updates jp_words" on public.jp_words;

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

create policy "Public updates jp_words"
on public.jp_words
for update
to anon, authenticated
using (true)
with check (true);

revoke all on public.jp_words from anon, authenticated;
grant select, insert on public.jp_words to anon, authenticated;
grant update (japanese, reading, meaning, pos, semantic_tags, created_at, study_date)
on public.jp_words
to anon, authenticated;

do $migration$
declare
  column_type text;
begin
  select data_type
  into column_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'jp_words'
    and column_name = 'study_date';

  if column_type <> 'date' then
    raise exception 'study_date type must be date, current type: %', column_type;
  end if;
end
$migration$;

commit;
