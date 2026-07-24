-- Public wordbook users may correct an existing word and its selected input date.
-- DELETE remains unavailable.

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
