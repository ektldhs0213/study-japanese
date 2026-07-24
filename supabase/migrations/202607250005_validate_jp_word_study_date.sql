-- Enforce PostgreSQL DATE type for every word-study filter value.

do $migration$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jp_words'
      and column_name = 'study_date'
  ) then
    raise exception 'public.jp_words.study_date does not exist. Run 202607250003 first.';
  end if;
end
$migration$;

alter table public.jp_words
  alter column study_date type date using study_date::date,
  alter column study_date set default current_date,
  alter column study_date set not null;

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
