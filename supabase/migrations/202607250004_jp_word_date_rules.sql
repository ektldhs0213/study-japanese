-- INSERT: created_at and study_date use the same selected input date.
-- UPDATE: created_at stays immutable and only study_date may change.

create or replace function public.enforce_jp_word_dates()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, now());
    new.study_date := coalesce(new.study_date, new.created_at::date);
  else
    new.created_at := old.created_at;
    new.study_date := coalesce(new.study_date, old.study_date);
  end if;
  return new;
end
$function$;

drop trigger if exists enforce_jp_word_dates_trigger on public.jp_words;
create trigger enforce_jp_word_dates_trigger
before insert or update on public.jp_words
for each row execute function public.enforce_jp_word_dates();

revoke update, delete on public.jp_words from anon, authenticated;
grant update (japanese, reading, meaning, pos, semantic_tags, created_at, study_date)
on public.jp_words
to anon, authenticated;
