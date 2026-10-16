import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Copy,
  Heart, MapPin, Music2, Pause, Sparkles
} from 'lucide-react';
import { wedding } from './config/wedding.js';
import guests from './data/guests.generated.json';

function findGuest() {
  const match = window.location.pathname.match(/^\/moi\/([^/]+)\/?$/);
  if (!match) return window.location.pathname === '/' ? null : false;
  const slug = decodeURIComponent(match[1]);
  return guests.find((guest) => guest.slug === slug) || false;
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

function FlowerOrnament({ className = '' }) {
  return <div className={`flower-ornament ${className}`} aria-hidden="true">
    <span /><span /><span /><span /><span /><i />
  </div>;
}

function makeCalendarFile() {
  const start = new Date(wedding.dateISO);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const dt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const safe = (s) => String(s).replaceAll('\\', '\\\\').replaceAll(',', '\\,')
    .replaceAll(';', '\\;').replace(/\r?\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invite//VN//EN',
    'BEGIN:VEVENT', `UID:wedding-${dt(start)}@thiep-cuoi.local`,
    `DTSTAMP:${dt(new Date())}`, `DTSTART:${dt(start)}`, `DTEND:${dt(end)}`,
    `SUMMARY:${safe(`Lễ cưới ${wedding.groom} & ${wedding.bride}`)}`,
    `LOCATION:${safe(`${wedding.venue}, ${wedding.address}`)}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'lich-cuoi.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function Gallery() {
  if (!wedding.photos?.length) {
    return <div className="quote-panel">
      <div className="quote-spark"><Sparkles size={26} strokeWidth={1.2} /></div>
      <p>“Trong muôn vàn khoảnh khắc, điều đẹp nhất là có những người thân yêu cùng chia sẻ niềm vui.”</p>
      <span>— {wedding.groom} & {wedding.bride} —</span>
    </div>;
  }
  return <div className="gallery-grid">
    {wedding.photos.map((url, i) => (
      <div className="gallery-photo" key={url}>
        <img src={url} loading="lazy" alt={`Khoảnh khắc của cô dâu chú rể ${i + 1}`} />
      </div>
    ))}
  </div>;
}

export default function App() {
  const guest = findGuest();
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35;
    }
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

  if (guest === false) {
    return <main className="notfound">
      <Heart size={34} color="#b87389" />
      <h1>Chưa tìm thấy thiệp mời</h1>
      <p>Đường link có thể bị sai hoặc khách mời chưa có trong danh sách.</p>
      <a href="/" className="btn btn-primary">Về trang thiệp cưới <ArrowRight size={16} /></a>
    </main>;
  }

  const countdown = getCountdown(wedding.dateISO, now);
  const isWeddingDay = countdown.every((x) => x.value === 0);
  const recipient = guest?.name || 'Quý khách';

  return <>
    {wedding.musicUrl && <audio ref={audioRef} loop preload="none" src={wedding.musicUrl} />}
    <div className="topline">THE WEDDING INVITATION <span className="topline-dot">✦</span> A DAY TO REMEMBER</div>
    <main>
      <section className="hero" aria-label="Thiệp mời đám cưới">
        <div className="hero-fade" aria-hidden="true" />
        <FlowerOrnament className="flower-left" />
        <FlowerOrnament className="flower-right" />
        <div className="hero-content">
          <div className="hero-kicker"><span /> SAVE THE DATE <span /></div>
          <div className="hero-rule"><Heart size={16} fill="#b57487" strokeWidth={1.4} /></div>
          <h1><span>{wedding.groom}</span><em>&</em><span>{wedding.bride}</span></h1>
          <p className="hero-subtitle">CHÚNG MÌNH SẮP VỀ CHUNG MỘT NHÀ</p>
          <div className="nameplate">
            <div className="nameplate-leaf">✦</div>
            <span>Trân trọng kính mời</span>
            <strong>{recipient}</strong>
            <p>Đến dự ngày vui và chung vui cùng gia đình chúng mình</p>
          </div>
          <div className="hero-date">{wedding.dateLabel}</div>
          <a className="down-arrow" href="#loi-moi" aria-label="Xem chi tiết thiệp mời"><ChevronDown size={22}/></a>
        </div>
      </section>

      <section className="welcome section-block" id="loi-moi">
        <div className="eyebrow">WITH LOVE & GRATITUDE</div>
        <h2>Một lời mời từ trái tim</h2>
        <div className="small-rose">✿</div>
        <p className="intro">{wedding.message}</p>
        <p className="intro-small">Mong được đón tiếp <b>{recipient}</b> trong ngày trọng đại của hai chúng mình.</p>
      </section>

      <section className="event-section section-block" id="thong-tin">
        <div className="eyebrow">THE CELEBRATION</div>
        <h2>Thông tin buổi tiệc</h2>
        <div className="event-card">
          <div className="corner-motif">✿</div>
          <div className="event-icon"><CalendarDays size={23} strokeWidth={1.35} /></div>
          <div className="event-label">NGÀY THÀNH HÔN</div>
          <h3>{wedding.dateLabel}</h3>
          <div className="detail-row"><Clock3 size={17} /> <span>{wedding.hourLabel}</span></div>
          <div className="event-divider" />
          <div className="event-label">ĐỊA ĐIỂM TỔ CHỨC</div>
          <h3>{wedding.venue}</h3>
          <p className="event-address"><MapPin size={17} />{wedding.address}</p>
          <div className="event-actions">
            <button className="btn btn-outline" type="button" onClick={makeCalendarFile}><CalendarDays size={16}/> Lưu lịch</button>
            {wedding.mapsUrl && <a className="btn btn-primary" target="_blank" rel="noreferrer noopener" href={wedding.mapsUrl}>
              <MapPin size={16} /> Chỉ đường</a>}
          </div>
        </div>
      </section>

      <section className="countdown-section section-block">
        <div className="eyebrow">COUNTING EVERY MOMENT</div>
        <h2>{isWeddingDay ? 'Ngày hạnh phúc đã đến!' : 'Đếm ngược đến ngày vui'}</h2>
        <div className="counter-grid">
          {countdown.map((item) => <div className="counter-item" key={item.label}>
            <strong>{String(item.value).padStart(2, '0')}</strong><span>{item.label}</span>
          </div>)}
        </div>
      </section>

      <section className="memories section-block">
        <div className="eyebrow">OUR LOVE STORY</div>
        <h2>Những khoảnh khắc yêu thương</h2>
        <Gallery />
      </section>

      <section className="closing section-block">
        <div className="closing-heart"><Heart size={28} strokeWidth={1.2}/></div>
        <p>Thanh xuân sẽ đẹp hơn khi có bạn cùng chứng kiến khoảnh khắc đặc biệt này.</p>
        <h2>Hẹn gặp bạn nhé!</h2>
        <div className="signature">{wedding.groom} <span>&</span> {wedding.bride}</div>
        <button className="btn btn-share" type="button" onClick={copyInviteUrl}>
          {copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? 'Đã sao chép link' : 'Sao chép link thiệp'}
        </button>
      </section>
    </main>
    {wedding.musicUrl && <button className="music-button" type="button" aria-label={playing ? 'Tạm dừng nhạc' : 'Phát nhạc nền'} onClick={toggleMusic}>
      {playing ? <Pause size={20} fill="currentColor"/> : <Music2 size={20}/>} 
    </button>}
    <footer>Made with <Heart size={12} fill="currentColor"/> · {wedding.groom} & {wedding.bride}</footer>
  </>;
}
