-- Chạy file này trong Supabase SQL Editor sau khi đã chạy guestbook.sql.
-- Sau cùng, xem hướng dẫn cuối file để cấp quyền cho tài khoản quản trị.

create sequence if not exists public.invitation_code_seq start with 1;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  invite_number bigint not null default nextval('public.invitation_code_seq') unique,
  guest_code text not null unique,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  copy_count integer not null default 0 check (copy_count >= 0),
  copied_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.wedding_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.guestbook_entries
  add column if not exists invitation_id uuid references public.invitations(id) on delete set null;

-- Đưa 5 link hiện có vào Supabase. Có thể chạy lại an toàn.
insert into public.invitations (invite_number, guest_code, name, slug)
values
  (1, 'K001', 'Anh Nguyễn Văn Nam', 'anh-nguyen-van-nam-k001'),
  (2, 'K002', 'Chị Trần Thị Lan', 'chi-tran-thi-lan-k002'),
  (3, 'K003', 'Gia đình anh Phạm Đức Minh', 'gia-dinh-anh-pham-duc-minh-k003'),
  (4, 'K004', 'Bạn Hoàng Anh', 'ban-hoang-anh-k004'),
  (5, 'K005', 'Cô Nguyễn Thị Hoa', 'co-nguyen-thi-hoa-k005'),
  (6, 'K006', 'Bạn Huy', 'ban-huy-k006'),
  (7, 'K007', 'Bạn Én', 'ban-en-k007')
on conflict (slug) do nothing;

select setval('public.invitation_code_seq', (select max(invite_number) from public.invitations), true);

update public.guestbook_entries as entry
set invitation_id = invitation.id
from public.invitations as invitation
where entry.invitation_id is null
  and entry.invitation_slug = invitation.slug;

create or replace function public.is_wedding_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.wedding_admins where user_id = auth.uid()
  );
$$;

alter table public.invitations enable row level security;
alter table public.wedding_admins enable row level security;

revoke all on table public.invitations from anon;
grant select, insert, update, delete on table public.invitations to authenticated;

drop policy if exists "Wedding admins manage invitations" on public.invitations;
create policy "Wedding admins manage invitations"
on public.invitations
for all
to authenticated
using (public.is_wedding_admin())
with check (public.is_wedding_admin());

-- Không cấp quyền đọc trực tiếp bảng admin cho người dùng trình duyệt.
revoke all on table public.wedding_admins from anon, authenticated;

create or replace function public.get_invitation_by_slug(p_slug text)
returns table (id uuid, name text, slug text, guest_code text)
language sql
stable
security definer
set search_path = public
as $$
  select invitation.id, invitation.name, invitation.slug, invitation.guest_code
  from public.invitations as invitation
  where invitation.slug = lower(btrim(p_slug))
  limit 1;
$$;

create or replace function public.create_invitation(p_name text, p_slug_base text)
returns table (
  id uuid,
  name text,
  slug text,
  guest_code text,
  copy_count integer,
  copied_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := btrim(p_name);
  clean_slug_base text := lower(btrim(p_slug_base));
  next_number bigint;
  next_code text;
  next_slug text;
begin
  if not public.is_wedding_admin() then
    raise exception 'Bạn không có quyền quản trị.' using errcode = '42501';
  end if;
  if char_length(clean_name) not between 1 and 120 then
    raise exception 'Tên khách mời không hợp lệ.' using errcode = '22023';
  end if;
  if clean_slug_base !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Không tạo được đường link hợp lệ.' using errcode = '22023';
  end if;

  next_number := nextval('public.invitation_code_seq');
  next_code := 'K' || lpad(next_number::text, 3, '0');
  next_slug := clean_slug_base || '-' || lower(next_code);

  return query
  insert into public.invitations (invite_number, guest_code, name, slug)
  values (next_number, next_code, clean_name, next_slug)
  returning invitations.id, invitations.name, invitations.slug, invitations.guest_code,
    invitations.copy_count, invitations.copied_at, invitations.sent_at, invitations.created_at;
end;
$$;

create or replace function public.record_invitation_copy(p_invitation_id uuid)
returns table (
  id uuid,
  name text,
  slug text,
  guest_code text,
  copy_count integer,
  copied_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_wedding_admin() then
    raise exception 'Bạn không có quyền quản trị.' using errcode = '42501';
  end if;

  return query
  update public.invitations
  set copy_count = invitations.copy_count + 1, copied_at = now()
  where invitations.id = p_invitation_id
  returning invitations.id, invitations.name, invitations.slug, invitations.guest_code,
    invitations.copy_count, invitations.copied_at, invitations.sent_at, invitations.created_at;
end;
$$;

create or replace function public.create_invitations(p_names text[], p_slug_bases text[])
returns table (
  id uuid,
  name text,
  slug text,
  guest_code text,
  copy_count integer,
  copied_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  item_index integer;
begin
  if not public.is_wedding_admin() then
    raise exception 'Bạn không có quyền quản trị.' using errcode = '42501';
  end if;
  if coalesce(array_length(p_names, 1), 0) = 0
    or array_length(p_names, 1) <> array_length(p_slug_bases, 1)
    or array_length(p_names, 1) > 300 then
    raise exception 'Danh sách import không hợp lệ.' using errcode = '22023';
  end if;

  for item_index in array_lower(p_names, 1)..array_upper(p_names, 1) loop
    return query select * from public.create_invitation(p_names[item_index], p_slug_bases[item_index]);
  end loop;
end;
$$;

revoke all on function public.get_invitation_by_slug(text) from public;
grant execute on function public.get_invitation_by_slug(text) to anon, authenticated;
revoke all on function public.create_invitation(text, text) from public;
grant execute on function public.create_invitation(text, text) to authenticated;
revoke all on function public.record_invitation_copy(uuid) from public;
grant execute on function public.record_invitation_copy(uuid) to authenticated;
revoke all on function public.create_invitations(text[], text[]) from public;
grant execute on function public.create_invitations(text[], text[]) to authenticated;

-- Cập nhật policy của lưu bút để nhận invitation_id cho mỗi lời chúc mới.
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

-- BƯỚC CUỐI: Tạo một user trong Supabase Authentication > Users bằng email/mật khẩu của bạn.
-- Rồi thay email bên dưới và chạy riêng câu lệnh này một lần:
-- insert into public.wedding_admins (user_id)
-- select id from auth.users where email = 'email-cua-ban@example.com'
-- on conflict (user_id) do nothing;
