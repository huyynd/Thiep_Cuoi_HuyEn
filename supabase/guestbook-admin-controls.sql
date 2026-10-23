-- Chạy file này trong Supabase SQL Editor sau invitations-admin.sql.
-- Giữ sổ lưu bút công khai như cũ, thêm khả năng Ẩn / Hiện lại / Xóa cho superadmin.

alter table public.guestbook_entries
  add column if not exists is_hidden boolean not null default false;

alter table public.guestbook_entries enable row level security;

drop policy if exists "Anyone can read wedding guestbook" on public.guestbook_entries;
drop policy if exists "Anyone can read visible wedding guestbook entries" on public.guestbook_entries;
create policy "Anyone can read visible wedding guestbook entries"
on public.guestbook_entries
for select
to anon, authenticated
using (is_hidden = false);

drop policy if exists "Wedding admins manage guestbook entries" on public.guestbook_entries;
create policy "Wedding admins manage guestbook entries"
on public.guestbook_entries
for all
to authenticated
using (public.is_wedding_admin())
with check (public.is_wedding_admin());

grant select, insert on table public.guestbook_entries to anon;
grant select, update, delete on table public.guestbook_entries to authenticated;
