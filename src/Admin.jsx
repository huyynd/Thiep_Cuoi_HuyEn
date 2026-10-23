import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Eye, EyeOff, FileUp, Link2, LoaderCircle, LogIn, LogOut, MessageCircleHeart, Plus, RefreshCw, Search, Send, Trash2, Users } from 'lucide-react';
import { wedding } from './config/wedding.js';
import { createInvitation, createInvitations, listInvitations, markInvitationSent, recordInvitationCopy } from './lib/invitations.js';
import { deleteGuestbookEntry, listGuestbookEntriesForAdmin, setGuestbookEntryHidden } from './lib/guestbookAdmin.js';
import { getSupabase, isSupabaseConfigured } from './lib/supabase.js';

function invitationUrl(invitation) {
  return `${wedding.siteUrl}/moi/${invitation.slug}`;
}

function readableDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Chưa gửi';
}

function normalizeHeader(value) {
  return String(value || '').toLocaleLowerCase('vi-VN').replace(/đ/g, 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function getNamesFromWorkbook(XLSX, workbook) {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
  if (!rows.length) return [];
  const supportedHeaders = new Set(['ten hien thi', 'ten khach moi', 'ho va ten', 'ten', 'name', 'guest']);
  const headerIndex = rows[0].findIndex((cell) => supportedHeaders.has(normalizeHeader(cell)));
  const column = headerIndex >= 0 ? headerIndex : 0;
  const firstRow = headerIndex >= 0 ? 1 : 0;
  return rows.slice(firstRow).map((row) => String(row[column] || '').trim()).filter(Boolean);
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  const stats = useMemo(() => ({
    total: invitations.length,
    sent: invitations.filter((item) => item.sentAt).length,
    copies: invitations.reduce((total, item) => total + (item.copyCount || 0), 0),
  }), [invitations]);

  const filteredInvitations = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi-VN');
    if (!keyword) return invitations;
    return invitations.filter((invitation) => [invitation.name, invitation.guestCode, invitation.slug]
      .some((value) => value.toLocaleLowerCase('vi-VN').includes(keyword)));
  }, [invitations, search]);

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
      const [loadedInvitations, loadedGuestbookEntries] = await Promise.all([
        listInvitations(),
        listGuestbookEntriesForAdmin(),
      ]);
      setInvitations(loadedInvitations);
      setGuestbookEntries(loadedGuestbookEntries);
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

  async function importExcel(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    setError('');
    setNotice('');
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const names = getNamesFromWorkbook(XLSX, workbook);
      if (!names.length) throw new Error('Không tìm thấy tên khách mời trong file.');
      if (names.length > 300) throw new Error('Mỗi lần chỉ import tối đa 300 khách mời.');
      const created = await createInvitations(names);
      setInvitations((current) => [...created.reverse(), ...current]);
      setNotice(`Đã tạo ${created.length} link khách mời từ file ${file.name}.`);
    } catch (importError) {
      setError(importError.message || 'Không thể import file này.');
      console.error(importError);
    } finally {
      setImporting(false);
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

  async function setGuestbookHidden(entry, isHidden) {
    setError('');
    try {
      const updated = await setGuestbookEntryHidden(entry.id, isHidden);
      setGuestbookEntries((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(isHidden ? 'Đã ẩn lời chúc.' : 'Đã cho hiển thị lại lời chúc.');
    } catch (updateError) {
      setError('Không thể cập nhật trạng thái lời chúc.');
      console.error(updateError);
    }
  }

  async function removeGuestbookEntry(entry) {
    if (!window.confirm(`Xóa vĩnh viễn lời chúc của ${entry.name}?`)) return;
    setError('');
    try {
      await deleteGuestbookEntry(entry.id);
      setGuestbookEntries((current) => current.filter((item) => item.id !== entry.id));
      setNotice('Đã xóa lời chúc.');
    } catch (deleteError) {
      setError('Không thể xóa lời chúc.');
      console.error(deleteError);
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
        <div><input id="guest-name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Ví dụ: Đức Huy & Bùi Yến" maxLength={120} required /><div className="admin-create-actions"><button className="admin-primary" type="submit" disabled={submitting || importing}>{submitting ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />} Tạo link</button><button className="admin-secondary" type="button" disabled={importing || submitting} onClick={() => fileInputRef.current?.click()}>{importing ? <LoaderCircle className="spin" size={18} /> : <FileUp size={18} />} {importing ? 'Đang import...' : 'Import Excel'}</button></div></div>
        <input ref={fileInputRef} className="admin-file-input" type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} />
        <p>Mã khách sẽ tự tăng. File Excel dùng cột <b>ten_hien_thi</b>, <b>Tên khách mời</b>, <b>Họ và tên</b>, hoặc cột đầu tiên chứa tên.</p>
      </form>

      <div className="admin-list-head"><h2>Danh sách link</h2><div className="admin-table-tools"><label className="admin-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên khách..." aria-label="Tìm khách mời" /></label><button className="admin-icon-button" type="button" onClick={loadInvitations} aria-label="Tải lại danh sách"><RefreshCw size={18} /></button></div></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <div className="admin-loading"><LoaderCircle className="spin" size={25} /> Đang tải...</div> : <div className="admin-table-wrap">
        {filteredInvitations.length ? <table className="admin-table">
          <thead><tr><th>Mã</th><th>Khách mời</th><th>Đường link</th><th>Copy</th><th>Trạng thái</th><th aria-label="Thao tác" /></tr></thead>
          <tbody>{filteredInvitations.map((invitation) => <tr key={invitation.id}>
            <td><span className="admin-code">{invitation.guestCode}</span></td>
            <td className="admin-guest-name">{invitation.name}</td>
            <td><a className="admin-table-link" href={invitationUrl(invitation)} target="_blank" rel="noreferrer"><Link2 size={15} /><span>/moi/{invitation.slug}</span></a></td>
            <td><strong className="admin-copy-count">{invitation.copyCount}</strong><span className="admin-copy-label">lần</span></td>
            <td><label className="admin-sent"><input type="checkbox" checked={Boolean(invitation.sentAt)} onChange={() => toggleSent(invitation)} /><span>{invitation.sentAt ? 'Đã gửi' : 'Chưa gửi'}</span></label>{invitation.sentAt && <small>{readableDate(invitation.sentAt)}</small>}</td>
            <td><button type="button" className="admin-copy" onClick={() => copyLink(invitation)}>{copiedId === invitation.id ? <Check size={17} /> : <Copy size={17} />}{copiedId === invitation.id ? 'Đã copy' : 'Copy'}</button></td>
          </tr>)}</tbody>
        </table> : <p className="admin-empty">{invitations.length ? 'Không tìm thấy khách mời phù hợp.' : 'Chưa có khách mời nào. Hãy tạo link đầu tiên ở trên.'}</p>}
      </div>}

      <section className="admin-guestbook">
        <div className="admin-list-head"><h2>Lời chúc đã gửi</h2></div>
        {loading ? null : guestbookEntries.length ? <div className="admin-guestbook-list">
          {guestbookEntries.map((entry) => <article className={`admin-guestbook-entry ${entry.isHidden ? 'is-hidden' : ''}`} key={entry.id}>
            <div className="admin-guestbook-entry-head"><div><strong>{entry.name}</strong><span>{readableDate(entry.createdAt)}</span></div><span className="admin-entry-status">{entry.isHidden ? 'Đã ẩn' : 'Đang hiện'}</span></div>
            <p>{entry.message}</p>
            <small>Gửi từ: {entry.invitationRecipient || entry.invitationSlug || 'Link chung'}</small>
            <div className="admin-guestbook-actions">
              <button type="button" onClick={() => setGuestbookHidden(entry, !entry.isHidden)}>{entry.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}{entry.isHidden ? 'Hiện lại' : 'Ẩn'}</button>
              <button type="button" onClick={() => removeGuestbookEntry(entry)}><Trash2 size={16} /> Xóa</button>
            </div>
          </article>)}
        </div> : <p className="admin-empty"><MessageCircleHeart size={18} /> Chưa có lời chúc nào.</p>}
      </section>
    </section>
  </main>;
}
