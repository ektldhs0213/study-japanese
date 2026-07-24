-- Separate the user-selected study input date from the database creation time.

alter table public.jp_words
  add column if not exists study_date date;

update public.jp_words
set study_date = created_at::date
where study_date is null;

alter table public.jp_words
  alter column study_date set default current_date,
  alter column study_date set not null;

drop policy if exists "Public updates jp_words" on public.jp_words;
create policy "Public updates jp_words"
on public.jp_words
for update
to anon, authenticated
using (true)
with check (true);

revoke update, delete on public.jp_words from anon, authenticated;
grant update (japanese, reading, meaning, pos, semantic_tags, study_date)
on public.jp_words
to anon, authenticated;

create index if not exists jp_words_study_date_idx
on public.jp_words (study_date desc);
