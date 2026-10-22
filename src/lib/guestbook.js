import { getSupabase, isSupabaseConfigured } from './supabase.js';

export const isGuestbookConfigured = isSupabaseConfigured;

function mapEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    message: entry.message,
    createdAt: entry.created_at,
    invitationSlug: entry.invitation_slug,
    invitationRecipient: entry.invitation_recipient,
    invitationPath: entry.invitation_path,
    invitationUrl: entry.invitation_url,
  };
}

export async function getGuestbookEntries() {
  const { data, error } = await getSupabase()
    .from('guestbook_entries')
    .select('id,name,message,created_at,invitation_slug,invitation_recipient,invitation_path,invitation_url')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapEntry);
}

export async function createGuestbookEntry({ name, message, invitationId, invitationSlug, invitationRecipient, invitationPath, invitationUrl }) {
  const { data, error } = await getSupabase()
    .from('guestbook_entries')
    .insert({
      name,
      message,
      invitation_id: invitationId || null,
      invitation_slug: invitationSlug || null,
      invitation_recipient: invitationRecipient || null,
      invitation_path: invitationPath || '/',
      invitation_url: invitationUrl || null,
    })
    .select('id,name,message,created_at,invitation_slug,invitation_recipient,invitation_path,invitation_url')
    .single();
  if (error) throw error;
  return mapEntry(data);
}
