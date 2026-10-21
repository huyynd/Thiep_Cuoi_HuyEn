import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Copy,
  ExternalLink, Heart, Home, MapPin, Music2, Pause, Sparkles
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

function CoverSnowfall() {
  return <div className="photo-cover-snow" aria-hidden="true">
    {snowflakes.map(([left, delay, duration, size, drift], index) => (
      <span key={index} style={{ '--snow-left': left, '--snow-delay': delay, '--snow-duration': duration, '--snow-size': size, '--snow-drift': drift }} />
    ))}
  </div>;
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

function WeddingInfo() {
  const info = wedding.familyInfo;
  if (!info) return null;
  const families = [info.groom, info.bride];

  return <section className="wedding-info" id="wedding-info" aria-label="Thông tin lễ cưới">
    <div className="wedding-info-inner">
      <div className="wedding-info-kicker">WEDDING INFO</div>
      <h2>Thông tin lễ cưới</h2>

      <div className="family-info-grid">
        {families.map((family, index) => <div className="family-info-item" key={index}>
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
    <div className="eyebrow">GALLERY</div>
    <h2>Khoảnh khắc của chúng mình</h2>
    <div className="carousel-shell">
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
  const coverDate = getCoverDate(wedding.calendarDateISO || wedding.dateISO);

  return <>
    {wedding.musicUrl && <audio ref={audioRef} autoPlay playsInline loop preload="auto" src={wedding.musicUrl} />}
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
      <a className="photo-cover-scroll" href="#thiep-moi" aria-label="Xem thiệp mời">
        <ChevronDown size={22} />
      </a>
    </section>
    <div className="topline">THE WEDDING INVITATION <span className="topline-dot">✦</span> A DAY TO REMEMBER</div>
    <main>
      <section className="hero" id="thiep-moi" aria-label="Thiệp mời đám cưới">
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
          <WeddingCalendar now={now} />
          <a className="down-arrow" href="#wedding-info" aria-label="Xem thông tin lễ cưới"><ChevronDown size={22}/></a>
        </div>
      </section>

      <WeddingInfo />

      <section className="welcome section-block" id="loi-moi">
        <div className="eyebrow">WITH LOVE & GRATITUDE</div>
        <h2>Một lời mời từ trái tim</h2>
        <div className="small-rose">✿</div>
        <p className="intro">{wedding.message}</p>
        <p className="intro-small">Mong được đón tiếp <b>{recipient}</b> trong ngày trọng đại của hai chúng mình.</p>
      </section>

      <MomentsCarousel />

      <section className="event-section section-block" id="thong-tin">
        <div className="eyebrow">THE CELEBRATION</div>
        <h2>Thông tin ngày vui</h2>
        <div className="event-card">
          <div className="corner-motif">✿</div>
          
          <div className="event-timeline">
            <div className="event-block is-party-block">
              <div className="event-icon"><Heart size={21} fill="#d14d72" color="#d14d72" strokeWidth={0} /></div>
              <div className="event-label">TIỆC CƯỚI (MỜI TIỆC)</div>
              <h3>{wedding.partyDateLabel}</h3>
              <div className="detail-row"><Clock3 size={16} /> <span>{wedding.partyHourLabel}</span></div>
              <p className="event-role-desc">Trân trọng kính mời quý khách đến nâng ly chung vui</p>
            </div>

            <div className="event-timeline-sep">
              <span className="sep-line" />
              <Heart size={14} fill="#c88b9c" color="#c88b9c" className="sep-heart" />
              <span className="sep-line" />
            </div>

            <div className="event-block is-ceremony-block">
              <div className="event-icon ceremony-icon"><Sparkles size={21} strokeWidth={1.4} /></div>
              <div className="event-label">LỄ THÀNH HÔN & ĐÓN DÂU</div>
              <h3>{wedding.ceremonyDateLabel}</h3>
              <div className="detail-row"><Clock3 size={16} /> <span>{wedding.ceremonyHourLabel}</span></div>
              <p className="event-role-desc">Lễ rước dâu và thành hôn của hai chúng mình</p>
            </div>
          </div>

          <div className="event-divider" />
          <div className="event-label">ĐỊA ĐIỂM TỔ CHỨC</div>
          <h3 className="venues-title">Chỉ đường đến ngày vui của hai gia đình</h3>

          <div className="venues-grid">
            {/* Tư gia nhà trai */}
            <div className="venue-card is-groom-house">
              <div className="venue-badge">
                <Home size={13} />
                <span>NHÀ TRAI</span>
              </div>
              <h4>{wedding.groomHouse?.title || 'Tư gia nhà trai'}</h4>
              <p className="venue-host">{wedding.groomHouse?.host || `Nhà Chú Rể ${wedding.groom}`}</p>
              {wedding.groomHouse?.address && (
                <p className="venue-address-text"><MapPin size={14} />{wedding.groomHouse.address}</p>
              )}
              {wedding.groomHouse?.mapsUrl && (
                <a
                  className="btn btn-primary btn-venue-map"
                  target="_blank"
                  rel="noreferrer noopener"
                  href={wedding.groomHouse.mapsUrl}
                >
                  <MapPin size={15} /> Chỉ đường Nhà Trai <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Tư gia nhà gái */}
            <div className="venue-card is-bride-house">
              <div className="venue-badge">
                <Home size={13} />
                <span>NHÀ GÁI</span>
              </div>
              <h4>{wedding.brideHouse?.title || 'Tư gia nhà gái'}</h4>
              <p className="venue-host">{wedding.brideHouse?.host || `Nhà Cô Dâu ${wedding.bride}`}</p>
              {wedding.brideHouse?.address && (
                <p className="venue-address-text"><MapPin size={14} />{wedding.brideHouse.address}</p>
              )}
              {wedding.brideHouse?.mapsUrl && (
                <a
                  className="btn btn-primary btn-venue-map"
                  target="_blank"
                  rel="noreferrer noopener"
                  href={wedding.brideHouse.mapsUrl}
                >
                  <MapPin size={15} /> Chỉ đường Nhà Gái <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          <div className="event-actions">
            <button className="btn btn-outline" type="button" onClick={makeCalendarFile}>
              <CalendarDays size={16}/> Lưu lịch tiệc vào điện thoại
            </button>
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
