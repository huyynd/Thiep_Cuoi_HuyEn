import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight, Check, ChevronDown, Copy,
  ExternalLink, Heart, MapPin, Music2, Pause, PenLine, Send, X
} from 'lucide-react';
import { wedding } from './config/wedding.js';
import { createGuestbookEntry, getGuestbookEntries, isGuestbookConfigured } from './lib/guestbook.js';
import { getInvitationBySlug } from './lib/invitations.js';

function getInvitationSlug() {
  const match = window.location.pathname.match(/^\/moi\/([^/]+)\/?$/);
  if (!match) return window.location.pathname === '/' ? null : false;
  return decodeURIComponent(match[1]);
}

function getCountdown(dateString, now) {
  const remaining = Math.max(0, new Date(dateString).getTime() - now);
  const d = Math.floor(remaining / 86_400_000);
  const h = Math.floor((remaining / 3_600_000) % 24);
  const m = Math.floor((remaining / 60_000) % 60);
  const s = Math.floor((remaining / 1_000) % 60);
  return [{ label: 'Ngày', value: d }, { label: 'Giờ', value: h },
  { label: 'Phút', value: m }, { label: 'Giây', value: s }];
}

function getCoverDate(dateString) {
  const [year = '', month = '', day = ''] = dateString.slice(0, 10).split('-');
  return { day, month, year: year.slice(-2), fullYear: year };
}

const snowflakes = [
  ['4%', '2.5s', '10s', '3px', '12px'], ['11%', '-3s', '13s', '5px', '-17px'],
  ['18%', '-7s', '11s', '3px', '20px'], ['26%', '-1s', '15s', '6px', '-12px'],
  ['33%', '-10s', '12s', '4px', '17px'], ['40%', '-5s', '14s', '3px', '-18px'],
  ['47%', '-12s', '11s', '5px', '14px'], ['55%', '-2s', '16s', '3px', '-14px'],
  ['63%', '-8s', '13s', '6px', '19px'], ['70%', '-4s', '10s', '3px', '-20px'],
  ['76%', '-11s', '15s', '5px', '10px'], ['83%', '-6s', '12s', '3px', '-11px'],
  ['90%', '-9s', '14s', '4px', '16px'], ['96%', '-1s', '11s', '3px', '-15px'],
  ['7%', '-8s', '17s', '2px', '-8px'], ['15%', '-13s', '12s', '4px', '13px'],
  ['22%', '-4s', '18s', '3px', '-19px'], ['30%', '-15s', '10s', '5px', '9px'],
  ['37%', '-9s', '16s', '2px', '16px'], ['44%', '-2s', '13s', '4px', '-15px'],
  ['51%', '-14s', '18s', '3px', '20px'], ['59%', '-6s', '12s', '5px', '-9px'],
  ['67%', '-16s', '15s', '2px', '14px'], ['73%', '-3s', '17s', '4px', '-17px'],
  ['80%', '-12s', '11s', '3px', '8px'], ['87%', '-5s', '16s', '5px', '-14px'],
  ['93%', '-15s', '13s', '2px', '18px'], ['99%', '-7s', '17s', '4px', '-10px'],
];

/* Hiệu ứng hoa rơi — tạm tắt, có thể bỏ comment để bật lại.
const fallingPetals = [
  ['3%', '-2s', '13s', '14px', '40px', '12deg'], ['12%', '-8s', '17s', '20px', '-48px', '-28deg'],
  ['21%', '-4s', '15s', '12px', '32px', '22deg'], ['31%', '-11s', '18s', '18px', '-39px', '-18deg'],
  ['42%', '-6s', '14s', '15px', '44px', '35deg'], ['51%', '-13s', '19s', '22px', '-31px', '-36deg'],
  ['61%', '-3s', '16s', '13px', '37px', '18deg'], ['70%', '-9s', '15s', '19px', '-45px', '-22deg'],
  ['79%', '-5s', '18s', '15px', '28px', '31deg'], ['88%', '-12s', '14s', '21px', '-33px', '-16deg'],
  ['96%', '-7s', '17s', '12px', '43px', '26deg'], ['7%', '-14s', '20s', '17px', '-25px', '-32deg'],
];
*/

function CoverSnowfall() {
  return <div className="photo-cover-snow" aria-hidden="true">
    {snowflakes.map(([left, delay, duration, size, drift], index) => (
      <span key={index} style={{ '--snow-left': left, '--snow-delay': delay, '--snow-duration': duration, '--snow-size': size, '--snow-drift': drift }} />
    ))}
  </div>;
}

/*
function PetalFall() {
  return <div className="petal-fall" aria-hidden="true">
    {fallingPetals.map(([left, delay, duration, size, drift, rotate], index) => (
      <span key={index} style={{ '--petal-left': left, '--petal-delay': delay, '--petal-duration': duration, '--petal-size': size, '--petal-drift': drift, '--petal-rotate': rotate }} />
    ))}
  </div>;
}
*/

function FlowerOrnament({ className = '' }) {
  return <div className={`flower-ornament ${className}`} aria-hidden="true">
    <span /><span /><span /><span /><span /><i />
  </div>;
}

function WeddingCalendar({ now }) {
  const dateISO = wedding.calendarDateISO || wedding.dateISO;
  const dateObj = new Date(dateISO);
  const isValid = !Number.isNaN(dateObj.getTime());
  const year = isValid ? dateObj.getFullYear() : 2026;
  const month = isValid ? dateObj.getMonth() : 11;
  const weddingDay = isValid ? dateObj.getDate() : 28;
  const dateLabel = `${year}.${String(month + 1).padStart(2, '0')}.${String(weddingDay).padStart(2, '0')}`;
  const weekdayLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(dateObj);
  const countdown = getCountdown(dateISO, now);

  const weekDays = [
    { key: 'cn', label: 'CN', isSunday: true },
    { key: 't2', label: 'T2' }, { key: 't3', label: 'T3' },
    { key: 't4', label: 'T4' }, { key: 't5', label: 'T5' },
    { key: 't6', label: 'T6' }, { key: 't7', label: 'T7' },
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingBlanks = firstDay;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push({ key: `blank-start-${i}`, isBlank: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (leadingBlanks + (day - 1)) % 7;
    const isSunday = dayOfWeek === 0;
    cells.push({
      key: `day-${day}`,
      day,
      isWedding: day === weddingDay,
      isSunday,
    });
  }
  const trailingBlanks = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailingBlanks; i++) {
    cells.push({ key: `blank-end-${i}`, isBlank: true });
  }

  return (
    <div className="ceremony-calendar-card" aria-label={`Lịch ngày cưới: ${dateLabel}`}>
      <img className="calendar-floral" src="/photos/floral-tulip-lily-corner.png" alt="" aria-hidden="true" />
      <div className="ceremony-calendar-header">
        <div>{dateLabel}</div>
        <p>{weekdayLabel} · Ngày cưới của chúng mình</p>
      </div>

      <div className="ceremony-calendar-grid">
        <div className="ceremony-calendar-weekdays">
          {weekDays.map((w) => (
            <div key={w.key} className={w.isSunday ? 'is-sunday' : ''}>
              {w.label}
            </div>
          ))}
        </div>

        <div className="ceremony-calendar-days">
          {cells.map((cell) => {
            if (cell.isBlank) {
              return <div key={cell.key} aria-hidden="true" />;
            }
            return (
              <div
                key={cell.key}
                className={`${cell.isSunday ? 'is-sunday' : ''} ${cell.isWedding ? 'is-wedding-day' : ''}`}
              >
                <span>{cell.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ceremony-calendar-countdown">
        {countdown.map((item) => <div key={item.label}>
          <span>{item.label.toLowerCase()}</span>
          <strong>{String(item.value).padStart(2, '0')}</strong>
        </div>)}
      </div>
      <p className="ceremony-calendar-note">Đếm ngược đến ngày cưới của {wedding.groom} và {wedding.bride}.</p>
    </div>
  );
}

function LoveStory() {
  const chapters = wedding.loveStory || [];
  const storyRef = useRef(null);
  const [revealedChapters, setRevealedChapters] = useState(() => new Set());

  useEffect(() => {
    const root = storyRef.current;
    if (!root || !('IntersectionObserver' in window)) {
      setRevealedChapters(new Set(chapters.map((_, index) => index)));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      setRevealedChapters((current) => {
        const next = new Set(current);
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.storyIndex);
          if (entry.isIntersecting) next.add(index);
          else next.delete(index);
        });
        return next;
      });
      // Reveal the next milestone just before it reaches the visible phone frame,
      // so the timeline never appears to have an empty gap while scrolling.
    }, { threshold: 0, rootMargin: '120px 0px' });

    const items = root.querySelectorAll('[data-story-index]');
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
    };
  }, [chapters.length]);

  if (!chapters.length) return null;

  return <section className="love-story" ref={storyRef} aria-label="Hành trình tình yêu của chúng mình">
    <img className="love-story-floral" src="/photos/floral-lily-sprig.png" alt="" aria-hidden="true" />
    <div className="love-story-kicker">OUR LOVE STORY</div>
    <div className="love-story-ornament" aria-hidden="true"><span />♥<span /></div>
    <div className="love-story-timeline">
      {chapters.map((chapter, index) => <article data-story-index={index} className={`love-story-chapter ${index % 2 ? 'is-right' : 'is-left'} ${revealedChapters.has(index) ? 'is-revealed' : ''}`} key={`${chapter.year}-${chapter.title}`}>
        <div className="love-story-copy">
          <time>{chapter.year}</time>
          <h3>{chapter.title}</h3>
          <p>{chapter.text}</p>
        </div>
        <div className="love-story-marker" aria-hidden="true">♥</div>
        <div className="love-story-photo">
          <img src={chapter.photo} alt={`${chapter.title} của ${wedding.groom} và ${wedding.bride}`} loading="lazy" />
        </div>
      </article>)}
    </div>
  </section>;
}

function TodayTogether() {
  const details = wedding.todayTogether || {};
  return <section className="today-together" aria-label="Cô dâu và chú rể">
    <img className="today-together-floral" src="/photos/floral-lily-sprig.png" alt="" aria-hidden="true" />
    <p className="today-together-kicker">Và hôm nay</p>
    <h2>Chúng mình chính thức về chung một nhà</h2>
    <div className="today-together-grid">
      <div className="today-together-photo bride-photo">
        <img src={details.bridePhoto || '/photos/khoanhkhac/anh3.jpg'} alt={`Cô dâu ${wedding.bride}`} loading="lazy" />
      </div>
      <div className="today-together-person bride-person">
        <span>Cô dâu</span>
        <strong>{wedding.bride}</strong>
        <div className="today-together-signature">
          {details.brideSignature && <img src={details.brideSignature} alt={`Chữ ký ${wedding.bride}`} />}
        </div>
      </div>
      <div className="today-together-person groom-person">
        <span>Chú rể</span>
        <strong>{wedding.groom}</strong>
        <div className="today-together-signature">
          {details.groomSignature && <img src={details.groomSignature} alt={`Chữ ký ${wedding.groom}`} />}
        </div>
      </div>
      <div className="today-together-photo groom-photo">
        <img src={details.groomPhoto || '/photos/khoanhkhac/anh7.jpg'} alt={`Chú rể ${wedding.groom}`} loading="lazy" />
      </div>
    </div>
  </section>;
}

function WeddingInfo() {
  const info = wedding.familyInfo;
  if (!info) return null;
  const families = [info.groom, info.bride];

  return <section className="wedding-info" id="wedding-info" aria-label="Thông tin lễ cưới">
    <img className="wedding-info-floral" src="/photos/floral-lily-sprig.png" alt="" aria-hidden="true" />
    <div className="wedding-info-inner">
      <div className="wedding-info-kicker">WEDDING INFO</div>
      <h2>Thông tin lễ cưới</h2>

      <div className="family-info-grid">
        {families.map((family, index) => <div className="family-info-item" key={index}>
          <div className="family-info-side">{index === 0 ? 'NHÀ TRAI' : 'NHÀ GÁI'}</div>
          <div className="family-info-title">{family.title}</div>
          <div className="family-info-names">
            {family.names.map((name) => <strong key={name}>{name}</strong>)}
          </div>
          <p>{family.address}</p>
        </div>)}
      </div>

      <div className="wedding-announcement">
        <p>Trân trọng báo tin</p>
        <p>Lễ thành hôn của con chúng tôi</p>
      </div>

      <div className="couple-announcement">
        <div>
          <strong>{info.groomFullName}</strong>
          <span>{info.groomRole}</span>
        </div>
        <i>&amp;</i>
        <div>
          <strong>{info.brideFullName}</strong>
          <span>{info.brideRole}</span>
        </div>
      </div>
    </div>
  </section>;
}

function VenueMap({ house, label }) {
  if (!house) return null;
  const title = house.title || label;
  const query = house.mapQuery || house.address || title;
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;

  return <article className="venue-map-card">
    <div className="venue-map-heading">
      <span>{label}</span>
      <h4>{title}</h4>
      {house.host && <p className="venue-map-host">{house.host}</p>}
      {house.address && <p className="venue-map-address"><MapPin size={17} />{house.address}</p>}
    </div>
    <div className="venue-map-frame">
      <iframe title={`Bản đồ ${title}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </div>
    {house.mapsUrl && <a className="btn btn-primary btn-venue-map" target="_blank" rel="noreferrer noopener" href={house.mapsUrl}>
      <MapPin size={16} /> Chỉ đường đến {label.toLowerCase()} <ExternalLink size={14} />
    </a>}
  </article>;
}

function MomentsCarousel() {
  const photos = wedding.momentPhotos || [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  if (!photos.length) return null;
  const showNext = () => setActiveIndex((current) => (current + 1) % photos.length);

  return <section className="moments-carousel section-block" aria-label="Khoảnh khắc của chúng mình">
    <img className="moments-floral" src="/photos/floral-lily-sprig.png" alt="" aria-hidden="true" />
    <div className="eyebrow">GALLERY</div>
    <h2>Khoảnh khắc của chúng mình</h2>
    <div className="carousel-shell">
      <img className="carousel-featured-backdrop" src={photos[activeIndex]} alt="" aria-hidden="true" />
      <button className="carousel-featured" type="button" onClick={showNext} aria-label="Xem ảnh tiếp theo">
        <img className="carousel-featured-image" src={photos[activeIndex]} alt={`Khoảnh khắc của ${wedding.groom} và ${wedding.bride} ${activeIndex + 1}`} />
      </button>
    </div>
    <div className="carousel-thumbnails" aria-label="Chọn ảnh">
      {photos.map((photo, index) => <button
        type="button"
        key={photo}
        className={`carousel-thumbnail ${index === activeIndex ? 'is-active' : ''}`}
        onClick={() => setActiveIndex(index)}
        aria-label={`Xem ảnh ${index + 1}`}
        aria-current={index === activeIndex ? 'true' : undefined}
      >
        <img src={photo} alt="" />
      </button>)}
    </div>
  </section>;
}

function WeddingEvents() {
  return <section className="event-section section-block" id="thong-tin">
    <img className="event-section-floral" src="/photos/floral-lily-sprig.png" alt="" aria-hidden="true" />
    <div className="eyebrow">WEDDING INVITATION</div>
    <h2>Trân trọng kính mời</h2>
    <div className="event-card event-card-invitation">
      <div className="corner-motif">✿</div>
      <div className="wedding-invitation-events">
        <InvitationEvent
          title="TIỆC CƯỚI · 27/12"
          dateISO={wedding.dateISO}
          time={wedding.partyHourLabel}
          note="Trân trọng kính mời quý khách đến nâng ly chung vui"
        />
        <div className="invitation-event-divider" aria-hidden="true" />
        <InvitationEvent
          title="LỄ THÀNH HÔN · 28/12"
          dateISO={wedding.calendarDateISO || wedding.dateISO}
          time={wedding.ceremonyHourLabel}
          note="Lễ rước dâu và thành hôn của hai chúng mình"
        />
      </div>

    </div>
  </section>;
}

function WeddingVenues() {
  return <section className="event-section section-block wedding-venues" id="dia-diem">
    <img className="venues-floral" src="/photos/floral-tulip-lily-corner.png" alt="" aria-hidden="true" />
    <div className="event-card event-card-venues">
      <div className="event-label">LOCATION</div>
      <h3 className="venues-title">Địa điểm tổ chức</h3>
      <div className="venues-grid">
        <VenueMap house={wedding.groomHouse} label="Nhà trai" />
        <VenueMap house={wedding.brideHouse} label="Nhà gái" />
      </div>
    </div>
  </section>;
}

function getGuestbookPreview(message) {
  return message.length > 80 ? `${message.slice(0, 80).trimEnd()}…` : message;
}

function Guestbook({ guest }) {
  const [entries, setEntries] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [guestbookError, setGuestbookError] = useState('');
  const [showAllEntries, setShowAllEntries] = useState(false);
  const guestbookRailRef = useRef(null);
  const guestbookScrollPositionRef = useRef(0);

  useEffect(() => {
    if (!isGuestbookConfigured) return undefined;
    let active = true;
    const loadEntries = async () => {
      try {
        const loadedEntries = await getGuestbookEntries();
        if (active) setEntries(loadedEntries);
      } catch (error) {
        console.error('Không thể tải sổ lưu bút:', error);
      }
    };

    loadEntries();
    const pollId = window.setInterval(loadEntries, 15000);
    return () => {
      active = false;
      window.clearInterval(pollId);
    };
  }, []);

  useEffect(() => {
    if (latestEntryId && guestbookRailRef.current) {
      guestbookRailRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [entries, latestEntryId]);

  function openWriter() {
    guestbookScrollPositionRef.current = window.scrollY;
    setName('');
    setMessage('');
    setGuestbookError('');
    setDialog('write');
  }

  function restoreGuestbookScrollPosition() {
    const top = guestbookScrollPositionRef.current;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: 'auto' });
      window.setTimeout(() => window.scrollTo({ top, behavior: 'auto' }), 120);
    });
  }

  async function submitEntry(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;

    setSaving(true);
    setGuestbookError('');
    try {
      const entry = await createGuestbookEntry({
        name: trimmedName,
        message: trimmedMessage,
        invitationId: guest?.id,
        invitationSlug: guest?.slug,
        invitationRecipient: guest?.name,
        invitationPath: `${window.location.pathname}${window.location.search}`,
        invitationUrl: window.location.href,
      });
      setEntries((current) => [entry, ...current.filter((currentEntry) => currentEntry.id !== entry.id)]);
      setLatestEntryId(entry.id);
      setDialog(null);
      restoreGuestbookScrollPosition();
    } catch (error) {
      console.error('Không thể gửi lời chúc:', error);
      setGuestbookError('Chưa thể gửi lời chúc. Vui lòng thử lại sau ít phút.');
    } finally {
      setSaving(false);
    }
  }

  function openEntry(entry) {
    setSelectedEntry(entry);
    setDialog('detail');
  }

  return <section className="guestbook section-block" aria-label="Sổ lưu bút">
    <img className="guestbook-floral" src="/photos/floral-lily-sprig.png" alt="" aria-hidden="true" />
    <div className="eyebrow">GUESTBOOK</div>
    <h2>Sổ lưu bút</h2>
    <div className="guestbook-card">
      {entries.length > 0 ? <div className="guestbook-rail" ref={guestbookRailRef} aria-label="Các lời chúc">
        {entries.map((entry) => <button type="button" key={entry.id} onClick={() => openEntry(entry)} className={`guestbook-note-card ${latestEntryId === entry.id ? 'is-new' : ''}`} aria-label={`Xem lời chúc của ${entry.name}`}>
          <Heart size={22} fill="currentColor" strokeWidth={1.2} aria-hidden="true" />
          <p>{getGuestbookPreview(entry.message)}</p>
          <div className="guestbook-note-meta"><span className="guestbook-author" title={entry.name}><strong>{entry.name}</strong></span><time>{new Date(entry.createdAt).toLocaleDateString('vi-VN')}</time></div>
        </button>)}
      </div> : <p className="guestbook-empty-note">Hãy để lại lời chúc đầu tiên dành cho Huy &amp; Yến nhé.</p>}
      {entries.length > 1 && <div className="guestbook-hint">Vuốt ngang để xem thêm lời chúc</div>}
      <div className="guestbook-links">
        <button type="button" onClick={openWriter}>Gửi lời chúc đến Huy &amp; Yến</button>
      </div>
      {entries.length > 0 && <>
        <button
          className={`guestbook-expand-button ${showAllEntries ? 'is-expanded' : ''}`}
          type="button"
          onClick={() => setShowAllEntries((current) => !current)}
          aria-expanded={showAllEntries}
          aria-controls="guestbook-all-entries"
        >
          {showAllEntries ? 'Thu gọn lời chúc' : `Xem tất cả lời chúc (${entries.length})`} <ChevronDown size={17} aria-hidden="true" />
        </button>
        {showAllEntries && <div className="guestbook-inline-entries" id="guestbook-all-entries">
          {entries.map((entry) => <article className="guestbook-inline-entry" key={entry.id}>
            <div><strong>{entry.name}</strong><time>{new Date(entry.createdAt).toLocaleDateString('vi-VN')}</time></div>
            <p>{entry.message}</p>
          </article>)}
        </div>}
      </>}
    </div>

    {dialog && createPortal(<div className="guestbook-dialog" role="presentation">
      <button className="guestbook-backdrop" type="button" aria-label="Đóng sổ lưu bút" onClick={() => setDialog(null)} />
      <div className="guestbook-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="guestbook-dialog-title">
        <div className="guestbook-dialog-head">
          <div className="guestbook-dialog-icon"><PenLine size={25} /></div>
          <h3 id="guestbook-dialog-title">{dialog === 'write' ? 'Viết lưu bút' : dialog === 'detail' ? 'Lời chúc gửi đến chúng mình' : 'Xem tất cả lời chúc'}</h3>
          <button className="guestbook-close" type="button" aria-label="Đóng" onClick={() => setDialog(null)}><X size={28} /></button>
        </div>

        {dialog === 'write' ? <form className="guestbook-form" onSubmit={submitEntry}>
          <label>Họ tên
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập họ tên" maxLength={80} autoFocus required />
          </label>
          <label>Nội dung
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Gửi lời chúc đến Đức Huy & Bùi Yến" maxLength={500} required />
          </label>
          {guestbookError && <p className="guestbook-form-error" role="alert">{guestbookError}</p>}
          <div className="guestbook-form-footer"><span>{message.length}/500</span><button className="btn btn-primary" type="submit" disabled={saving}><Send size={16} /> {saving ? 'Đang gửi...' : 'Hoàn tất'}</button></div>
        </form> : dialog === 'detail' && selectedEntry ? <article className="guestbook-detail">
          <Heart size={25} fill="currentColor" strokeWidth={1.2} aria-hidden="true" />
          <p>{selectedEntry.message}</p>
          <div><strong>— {selectedEntry.name} —</strong><time>{new Date(selectedEntry.createdAt).toLocaleDateString('vi-VN')}</time></div>
        </article> : <div className="guestbook-entries">
          {entries.length ? entries.map((entry) => <article key={entry.id} className="guestbook-entry">
            <div><strong>{entry.name}</strong><time>{new Date(entry.createdAt).toLocaleDateString('vi-VN')}</time></div>
            <p>{entry.message}</p>
          </article>) : <div className="guestbook-empty"><p>Chưa có lời chúc nào.</p><button className="btn btn-outline" type="button" onClick={openWriter}>Viết lưu bút</button></div>}
        </div>}
      </div>
    </div>, document.body)}
  </section>;
}

function InvitationEvent({ title, dateISO, time, note }) {
  const [year = '2026', month = '12', day = '28'] = dateISO.slice(0, 10).split('-');
  const weekDays = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  const weekDay = weekDays[new Date(Number(year), Number(month) - 1, Number(day)).getDay()];

  return <article className="invitation-event">
    <div className="invitation-event-title">{title}</div>
    <div className={`invitation-event-time ${time.length > 8 ? 'is-text' : ''}`}>{time}</div>
    <div className="invitation-event-date">
      <span>{weekDay}</span>
      <strong>{day}</strong>
      <span>THÁNG <i className="invitation-month-number">{month}</i></span>
    </div>
    <div className="invitation-event-year">{year}</div>
    <p>{note}</p>
  </article>;
}

function PaperInvitationCover() {
  return <section className="paper-invitation-cover" id="thiep-moi" aria-label="Trang bìa thiệp mời">
    <img
      className="paper-invitation-cover-floral"
      src="/photos/bouquet-tulip-panel.png"
      alt=""
      aria-hidden="true"
    />
    <div className="paper-invitation-cover-content">
      <p className="paper-invitation-cover-kicker">WEDDING INVITATION</p>
      <h2>
        <span>{wedding.groom}</span>
        <em>và</em>
        <span>{wedding.bride}</span>
      </h2>
      <p className="paper-invitation-cover-message">
        Trân trọng kính mời bạn đến chung vui<br />
        trong ngày trọng đại của chúng mình.
      </p>
      <div className="paper-invitation-cover-events">
        <p><strong>CHỦ NHẬT · 27.12.2026</strong><span>{wedding.partyHourLabel} · Tiệc cưới</span></p>
        <p><strong>THỨ HAI · 28.12.2026</strong><span>{wedding.ceremonyHourLabel} · Lễ thành hôn</span></p>
      </div>
      <p className="paper-invitation-cover-place">Vĩnh Tường, Vĩnh Phúc</p>
      <i className="paper-invitation-cover-signoff">Hẹn gặp bạn!</i>
    </div>
  </section>;
}

export default function App() {
  const invitationSlug = getInvitationSlug();
  const [guest, setGuest] = useState(() => invitationSlug ? undefined : null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!invitationSlug) {
      setGuest(null);
      return undefined;
    }
    let active = true;
    setGuest(undefined);
    getInvitationBySlug(invitationSlug)
      .then((invitation) => { if (active) setGuest(invitation || false); })
      .catch((error) => {
        console.error('Không thể tải thông tin khách mời:', error);
        if (active) setGuest(false);
      });
    return () => { active = false; };
  }, [invitationSlug]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    const syncPlaying = () => setPlaying(!audio.paused);
    const interactionEvents = ['pointerdown', 'touchstart', 'keydown'];
    const removeInteractionListeners = () => {
      interactionEvents.forEach((eventName) => {
        document.removeEventListener(eventName, startMusic, true);
      });
    };
    const startMusic = async () => {
      try {
        await audio.play();
        setPlaying(true);
        removeInteractionListeners();
      } catch {
        setPlaying(false);
      }
    };

    audio.addEventListener('play', syncPlaying);
    audio.addEventListener('pause', syncPlaying);
    interactionEvents.forEach((eventName) => {
      document.addEventListener(eventName, startMusic, true);
    });
    startMusic();

    return () => {
      removeInteractionListeners();
      audio.removeEventListener('play', syncPlaying);
      audio.removeEventListener('pause', syncPlaying);
    };
  }, []);

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); }
      catch { setPlaying(false); alert('Trình duyệt không phát được nhạc. Hãy kiểm tra file nhạc.'); }
    } else { audio.pause(); setPlaying(false); }
  }

  async function copyInviteUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Sao chép đường link này:', window.location.href);
    }
  }

  if (invitationSlug && guest === undefined) {
    return <main className="notfound"><Heart size={34} color="#b87389" /><h1>Đang mở thiệp mời…</h1><p>Chúng mình đang chuẩn bị lời mời dành riêng cho bạn.</p></main>;
  }

  if (guest === false) {
    return <main className="notfound">
      <Heart size={34} color="#b87389" />
      <h1>Chưa tìm thấy thiệp mời</h1>
      <p>Đường link có thể bị sai hoặc khách mời chưa có trong danh sách.</p>
      <a href="/" className="btn btn-primary">Về trang thiệp cưới <ArrowRight size={16} /></a>
    </main>;
  }

  const recipient = guest?.name || 'Quý khách';
  const coverDate = getCoverDate(wedding.calendarDateISO || wedding.dateISO);

  return <>
    {wedding.musicUrl && <audio ref={audioRef} autoPlay playsInline loop preload="auto" src={wedding.musicUrl} />}
    {/* <PetalFall /> */}
    <section className="photo-cover" aria-label="Ảnh bìa thiệp cưới">
      <img className="photo-cover-image" src="/photos/anh1.png" alt={`Ảnh ${wedding.groom} và ${wedding.bride}`} />
      <div className="photo-cover-shade" aria-hidden="true" />
      <CoverSnowfall />
      <div className="photo-cover-frame" aria-hidden="true" />
      <div className="photo-cover-heading" aria-hidden="true">
        <span>TO BE</span>
        <span>TOGETHER</span>
      </div>
      <div className="photo-cover-date" aria-label={`Ngày cưới ${coverDate.day} tháng ${coverDate.month} năm ${coverDate.fullYear}`}>
        <span className="cover-date-day">{coverDate.day}</span>
        <span className="cover-date-month">{coverDate.month}</span>
        <span className="cover-date-year">{coverDate.year}</span>
      </div>
      <div className="photo-cover-names">
        <span>{wedding.groom}</span>
        <span>{wedding.bride}</span>
      </div>
      {/* <p className="photo-cover-party">TIỆC CƯỚI · 27.12.2026 · {wedding.partyHourLabel}</p> */}
      <a className="photo-cover-scroll" href="#thiep-moi" aria-label="Xem thiệp mời">
        <ChevronDown size={22} />
      </a>
    </section>
    <div className="topline">THE WEDDING INVITATION <span className="topline-dot">✦</span> A DAY TO REMEMBER</div>
    {/* <PaperInvitationCover /> */}
    <main>
      <section className="hero" id="thiep-moi" aria-label="Thiệp mời đám cưới">
        <div className="hero-fade" aria-hidden="true" />
        <img className="hero-floral hero-floral-top" src="/photos/floral-tulip-lily-corner.png" alt="" aria-hidden="true" />
        <img className="hero-floral hero-floral-bottom" src="/photos/floral-tulip-lily-corner.png" alt="" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-kicker"><span /> SAVE THE DATE <span /></div>
          <div className="hero-rule"><Heart size={21} fill="#b57487" strokeWidth={1.4} /></div>
          <h1><span>{wedding.groom}</span><em>&</em><span>{wedding.bride}</span></h1>
          <p className="hero-subtitle">CHÚNG MÌNH SẮP VỀ CHUNG MỘT NHÀ</p>
          <div className="nameplate">
            <div className="nameplate-leaf">✦</div>
            <span>Trân trọng kính mời</span>
            <strong>{recipient}</strong>
            <p>Đến dự ngày vui và chung vui cùng gia đình chúng mình</p>
          </div>
          <WeddingCalendar now={now} />
          <a className="down-arrow" href="#thong-tin" aria-label="Xem lịch tiệc và địa điểm"><ChevronDown size={22} /></a>
        </div>
      </section>

      <WeddingEvents />

      <WeddingInfo />

      <LoveStory />

      <TodayTogether />

      <MomentsCarousel />

      <Guestbook guest={guest || null} />

      <WeddingVenues />

      <section className="closing section-block">
        <img className="closing-floral" src="/photos/floral-tulip-lily-corner.png" alt="" aria-hidden="true" />
        <div className="closing-heart"><Heart size={28} strokeWidth={1.2} /></div>
        <p>Thanh xuân sẽ đẹp hơn khi có bạn cùng chứng kiến khoảnh khắc đặc biệt này.</p>
        <h2>Hẹn gặp bạn nhé!</h2>
        <div className="signature">{wedding.groom} <span>&</span> {wedding.bride}</div>
        <button className="btn btn-share" type="button" onClick={copyInviteUrl}>
          {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Đã sao chép link' : 'Sao chép link thiệp'}
        </button>
      </section>

      <section className="thanks-photo" aria-label="Lời cảm ơn">
        <img src="/photos/khoanhkhac/anh4.jpg" alt={`Khoảnh khắc của ${wedding.groom} và ${wedding.bride}`} />
        <div className="thanks-photo-overlay" aria-hidden="true" />
        <div className="thanks-photo-wave thanks-photo-wave-top" aria-hidden="true" />
        <div className="thanks-photo-wave thanks-photo-wave-bottom" aria-hidden="true" />
        <img className="thanks-photo-floral" src="/photos/floral-tulip-lily-corner.png" alt="" aria-hidden="true" />
        <div className="thanks-photo-content">
          <p>Cảm ơn bạn đã ghé thăm tấm thiệp nhỏ này.</p>
          <p>Sự hiện diện và lời chúc của bạn<br />là món quà ý nghĩa nhất với chúng mình.</p>
          <div className="thanks-photo-signature">
            <span>— With love —</span>
            <strong>{wedding.groom} &amp; {wedding.bride}</strong>
          </div>
        </div>
      </section>
    </main>
    {wedding.musicUrl && <button className={`music-button ${playing ? 'is-playing' : ''}`} type="button" aria-label={playing ? 'Tạm dừng nhạc' : 'Phát nhạc nền'} onClick={toggleMusic}>
      {playing ? <><span className="music-ripples" aria-hidden="true"><i /><i /><i /></span><Pause size={19} fill="currentColor" /></> : <Music2 size={20} />}
    </button>}
    <footer>Made with <Heart size={12} fill="currentColor" /> · {wedding.groom} & {wedding.bride}</footer>
  </>;
}
