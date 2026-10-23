import { getSupabase } from './supabase.js';

function mapEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    message: entry.message,
    isHidden: Boolean(entry.is_hidden),
    createdAt: entry.created_at,
    invitationRecipient: entry.invitation_recipient,
    invitationSlug: entry.invitation_slug,
  };
}

export async function listGuestbookEntriesForAdmin() {
  const { data, error } = await getSupabase()
    .from('guestbook_entries')
    .select('id,name,message,is_hidden,created_at,invitation_recipient,invitation_slug')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapEntry);
}

export async function setGuestbookEntryHidden(id, isHidden) {
  const { data, error } = await getSupabase()
    .from('guestbook_entries')
    .update({ is_hidden: isHidden })
    .eq('id', id)
    .select('id,name,message,is_hidden,created_at,invitation_recipient,invitation_slug')
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function deleteGuestbookEntry(id) {
  const { error } = await getSupabase()
    .from('guestbook_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
