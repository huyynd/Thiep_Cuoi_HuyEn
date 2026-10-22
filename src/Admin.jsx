import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Link2, LoaderCircle, LogIn, LogOut, Plus, RefreshCw, Send, Users } from 'lucide-react';
import { wedding } from './config/wedding.js';
import { createInvitation, listInvitations, markInvitationSent, recordInvitationCopy } from './lib/invitations.js';
import { getSupabase, isSupabaseConfigured } from './lib/supabase.js';

function invitationUrl(invitation) {
  return `${wedding.siteUrl}/moi/${invitation.slug}`;
}

function readableDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Chưa gửi';
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const stats = useMemo(() => ({
    total: invitations.length,
    sent: invitations.filter((item) => item.sentAt).length,
    copies: invitations.reduce((total, item) => total + (item.copyCount || 0), 0),
  }), [invitations]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Chưa có cấu hình Supabase cho website.');
      setLoading(false);
      return undefined;
    }
    const client = getSupabase();
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function loadInvitations() {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      setInvitations(await listInvitations());
    } catch (loadError) {
      setError('Không tải được danh sách. Hãy kiểm tra tài khoản này đã được cấp quyền quản trị trong Supabase.');
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadInvitations(); }, [session]);

  async function signIn(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: signInError } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError('Email hoặc mật khẩu chưa đúng.');
    setSubmitting(false);
  }

  async function signOut() {
    await getSupabase().auth.signOut();
    setInvitations([]);
  }

  async function addInvitation(event) {
    event.preventDefault();
    const name = guestName.trim();
    if (!name) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await createInvitation(name);
      setInvitations((current) => [created, ...current]);
      setGuestName('');
      setNotice(`Đã tạo link cho ${created.name}.`);
    } catch (createError) {
      setError('Không thể tạo link. Vui lòng thử lại.');
      console.error(createError);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink(invitation) {
    setError('');
    try {
      await navigator.clipboard.writeText(invitationUrl(invitation));
      const updated = await recordInvitationCopy(invitation.id);
      setInvitations((current) => current.map((item) => item.id === updated.id ? updated : item));
      setCopiedId(invitation.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch (copyError) {
      setError('Không thể sao chép link. Hãy thử lại trên trình duyệt.');
      console.error(copyError);
    }
  }

  async function toggleSent(invitation) {
    setError('');
    try {
      const updated = await markInvitationSent(invitation.id, !invitation.sentAt);
      setInvitations((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (updateError) {
      setError('Không thể cập nhật trạng thái gửi.');
      console.error(updateError);
    }
  }

  if (!isSupabaseConfigured) return <main className="admin-page"><div className="admin-login"><h1>Thiếu cấu hình Supabase</h1><p>Hãy thêm biến môi trường trước khi dùng trang quản trị.</p></div></main>;

  if (!session) return <main className="admin-page">
    <form className="admin-login" onSubmit={signIn}>
      <div className="admin-icon"><LogIn size={25} /></div>
      <p className="admin-kicker">HUY &amp; YẾN</p>
      <h1>Quản lý khách mời</h1>
      <p>Đăng nhập tài khoản quản trị để tạo và gửi thiệp riêng.</p>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="admin-primary" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={18} /> : <LogIn size={18} />} Đăng nhập</button>
    </form>
  </main>;

  return <main className="admin-page">
    <section className="admin-shell">
      <header className="admin-header">
        <div><p className="admin-kicker">WEDDING INVITATION</p><h1>Khách mời</h1><span>{session.user.email}</span></div>
        <button className="admin-secondary" type="button" onClick={signOut}><LogOut size={17} /> Đăng xuất</button>
      </header>

      <div className="admin-stats" aria-label="Tổng quan danh sách khách mời">
        <div><Users size={20} /><strong>{stats.total}</strong><span>Khách mời</span></div>
        <div><Send size={20} /><strong>{stats.sent}</strong><span>Đã gửi</span></div>
        <div><Copy size={20} /><strong>{stats.copies}</strong><span>Lần copy</span></div>
      </div>

      <form className="admin-create" onSubmit={addInvitation}>
        <label htmlFor="guest-name">Tên khách mời</label>
        <div><input id="guest-name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Ví dụ: Anh Nguyễn Văn Nam" maxLength={120} required /><button className="admin-primary" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />} Tạo link</button></div>
        <p>Mã khách sẽ tự tăng; link vừa tạo dùng được ngay sau khi lưu.</p>
      </form>

      <div className="admin-list-head"><h2>Danh sách link</h2><button className="admin-icon-button" type="button" onClick={loadInvitations} aria-label="Tải lại danh sách"><RefreshCw size={18} /></button></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <div className="admin-loading"><LoaderCircle className="spin" size={25} /> Đang tải...</div> : <div className="admin-invitations">
        {invitations.map((invitation) => <article className="admin-invitation" key={invitation.id}>
          <div className="admin-invitation-main"><span className="admin-code">{invitation.guestCode}</span><h3>{invitation.name}</h3><a href={invitationUrl(invitation)} target="_blank" rel="noreferrer"><Link2 size={15} /> /moi/{invitation.slug}</a></div>
          <div className="admin-invitation-meta"><span>{invitation.copyCount} lần copy</span><span>{invitation.sentAt ? `Đã gửi · ${readableDate(invitation.sentAt)}` : 'Chưa gửi'}</span></div>
          <div className="admin-invitation-actions"><button type="button" className="admin-copy" onClick={() => copyLink(invitation)}>{copiedId === invitation.id ? <Check size={17} /> : <Copy size={17} />}{copiedId === invitation.id ? 'Đã copy' : 'Copy link'}</button><label className="admin-sent"><input type="checkbox" checked={Boolean(invitation.sentAt)} onChange={() => toggleSent(invitation)} /><span>Đã gửi</span></label></div>
        </article>)}
        {!invitations.length && <p className="admin-empty">Chưa có khách mời nào. Hãy tạo link đầu tiên ở trên.</p>}
      </div>}
    </section>
  </main>;
}
