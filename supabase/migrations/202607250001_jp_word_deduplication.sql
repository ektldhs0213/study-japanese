-- Keep the newest row for each Japanese + Korean meaning pair.
-- General users still receive no DELETE permission.

update public.jp_words words
set
  japanese = btrim(words.japanese),
  meaning = (
    select string_agg(btrim(part.value), ', ' order by part.position)
    from unnest(string_to_array(words.meaning, ',')) with ordinality as part(value, position)
  );

with ranked_words as (
  select
    id,
    row_number() over (
      partition by btrim(japanese), btrim(meaning)
      order by created_at desc, id desc
    ) as duplicate_rank
  from public.jp_words
)
delete from public.jp_words words
using ranked_words ranked
where words.id = ranked.id
  and ranked.duplicate_rank > 1;

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'jp_words_japanese_meaning_key'
      and conrelid = 'public.jp_words'::regclass
  ) then
    alter table public.jp_words
      add constraint jp_words_japanese_meaning_key unique (japanese, meaning);
  end if;
end
$migration$;
