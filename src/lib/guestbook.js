const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isGuestbookConfigured = Boolean(supabaseUrl && supabasePublishableKey);

function endpoint(path) {
  return `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`;
}

async function request(path, options = {}) {
  if (!isGuestbookConfigured) throw new Error('Supabase chưa được cấu hình.');

  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || 'Không thể kết nối sổ lưu bút.');
  }

  return response.status === 204 ? null : response.json();
}

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
  const entries = await request('guestbook_entries?select=id,name,message,created_at,invitation_slug,invitation_recipient,invitation_path,invitation_url&order=created_at.desc');
  return entries.map(mapEntry);
}

export async function createGuestbookEntry({ name, message, invitationSlug, invitationRecipient, invitationPath, invitationUrl }) {
  const entries = await request('guestbook_entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      name,
      message,
      invitation_slug: invitationSlug || null,
      invitation_recipient: invitationRecipient || null,
      invitation_path: invitationPath || '/',
      invitation_url: invitationUrl || null,
    }),
  });
  return mapEntry(entries[0]);
}
