-- Canonical identity: normalized Japanese + POS.
-- Meanings and semantic tags are merged; the latest study input date is kept.

alter table public.jp_words
  drop constraint if exists jp_words_japanese_meaning_key;

alter table public.jp_words enable row level security;

drop policy if exists "Public updates jp_words" on public.jp_words;
create policy "Public updates jp_words"
on public.jp_words
for update
to anon, authenticated
using (true)
with check (true);

revoke update, delete on public.jp_words from anon, authenticated;
grant update (japanese, reading, meaning, pos, semantic_tags, created_at)
on public.jp_words
to anon, authenticated;

update public.jp_words
set
  japanese = normalize(btrim(japanese), NFKC),
  pos = lower(btrim(pos)),
  meaning = (
    select string_agg(btrim(part.value), ', ' order by part.position)
    from unnest(string_to_array(meaning, ',')) with ordinality as part(value, position)
  );

with ranked as (
  select
    id,
    japanese,
    pos,
    row_number() over (
      partition by japanese, pos
      order by created_at desc, id desc
    ) as duplicate_rank
  from public.jp_words
),
merged as (
  select
    words.japanese,
    words.pos,
    string_agg(distinct btrim(meaning_part.value), ', ' order by btrim(meaning_part.value)) as meanings,
    array_agg(distinct tag.value order by tag.value)
      filter (where tag.value is not null and btrim(tag.value) <> '') as tags,
    max(words.created_at) as latest_date
  from public.jp_words words
  cross join lateral unnest(string_to_array(words.meaning, ',')) as meaning_part(value)
  left join lateral unnest(words.semantic_tags) as tag(value) on true
  group by words.japanese, words.pos
)
update public.jp_words keeper
set
  meaning = merged.meanings,
  semantic_tags = coalesce(merged.tags, array[]::text[]),
  created_at = merged.latest_date
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
      order by created_at desc, id desc
    ) as duplicate_rank
  from public.jp_words
)
delete from public.jp_words words
using ranked
where words.id = ranked.id
  and ranked.duplicate_rank > 1;

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'jp_words_japanese_pos_key'
      and conrelid = 'public.jp_words'::regclass
  ) then
    alter table public.jp_words
      add constraint jp_words_japanese_pos_key unique (japanese, pos);
  end if;
end
$migration$;
