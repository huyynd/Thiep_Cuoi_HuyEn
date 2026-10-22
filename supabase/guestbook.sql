create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  invitation_slug text,
  invitation_recipient text,
  invitation_path text not null default '/',
  invitation_url text,
  created_at timestamptz not null default now()
);

-- Các lệnh dưới đây cũng áp dụng được nếu bảng đã được tạo từ phiên bản trước.
alter table public.guestbook_entries
  add column if not exists invitation_slug text,
  add column if not exists invitation_recipient text,
  add column if not exists invitation_path text not null default '/',
  add column if not exists invitation_url text;

alter table public.guestbook_entries
  drop constraint if exists guestbook_entries_invitation_slug_length,
  drop constraint if exists guestbook_entries_invitation_recipient_length,
  drop constraint if exists guestbook_entries_invitation_path_length,
  drop constraint if exists guestbook_entries_invitation_url_length;

alter table public.guestbook_entries
  add constraint guestbook_entries_invitation_slug_length
    check (invitation_slug is null or char_length(invitation_slug) between 1 and 160),
  add constraint guestbook_entries_invitation_recipient_length
    check (invitation_recipient is null or char_length(btrim(invitation_recipient)) between 1 and 120),
  add constraint guestbook_entries_invitation_path_length
    check (char_length(invitation_path) between 1 and 240),
  add constraint guestbook_entries_invitation_url_length
    check (invitation_url is null or char_length(invitation_url) between 1 and 500);

alter table public.guestbook_entries enable row level security;

grant select, insert on table public.guestbook_entries to anon;

drop policy if exists "Anyone can read wedding guestbook" on public.guestbook_entries;
create policy "Anyone can read wedding guestbook"
on public.guestbook_entries
for select
to anon
using (true);

drop policy if exists "Anyone can add a wedding guestbook entry" on public.guestbook_entries;
create policy "Anyone can add a wedding guestbook entry"
on public.guestbook_entries
for insert
to anon
with check (
  char_length(btrim(name)) between 1 and 80
  and char_length(btrim(message)) between 1 and 500
  and (invitation_slug is null or char_length(invitation_slug) between 1 and 160)
  and (invitation_recipient is null or char_length(btrim(invitation_recipient)) between 1 and 120)
  and char_length(invitation_path) between 1 and 240
  and (invitation_url is null or char_length(invitation_url) between 1 and 500)
);
