import { getSupabase } from './supabase.js';

function slugify(value) {
  return value.toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');
}

function mapInvitation(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    guestCode: row.guest_code,
    copyCount: row.copy_count,
    copiedAt: row.copied_at,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

export async function getInvitationBySlug(slug) {
  const { data, error } = await getSupabase().rpc('get_invitation_by_slug', { p_slug: slug });
  if (error) throw error;
  return mapInvitation(data?.[0]);
}

export async function listInvitations() {
  const { data, error } = await getSupabase()
    .from('invitations')
    .select('id,name,slug,guest_code,copy_count,copied_at,sent_at,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapInvitation);
}

export async function createInvitation(name) {
  const slugBase = slugify(name);
  if (!slugBase) throw new Error('Không tạo được link từ tên khách mời.');
  const { data, error } = await getSupabase().rpc('create_invitation', { p_name: name, p_slug_base: slugBase });
  if (error) throw error;
  return mapInvitation(data?.[0]);
}

export async function markInvitationSent(id, sent) {
  const { data, error } = await getSupabase()
    .from('invitations')
    .update({ sent_at: sent ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id,name,slug,guest_code,copy_count,copied_at,sent_at,created_at')
    .single();
  if (error) throw error;
  return mapInvitation(data);
}

export async function recordInvitationCopy(id) {
  const { data, error } = await getSupabase().rpc('record_invitation_copy', { p_invitation_id: id });
  if (error) throw error;
  return mapInvitation(data?.[0]);
}
