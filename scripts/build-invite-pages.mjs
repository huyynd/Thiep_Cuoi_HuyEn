import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wedding } from '../src/config/wedding.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guests = JSON.parse(fs.readFileSync(path.join(root, 'src/data/guests.generated.json'), 'utf8'));
const index = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const destination = path.join(root, 'dist/moi');
fs.mkdirSync(destination, { recursive: true });

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
function replaceTag(html, search, replacement) {
  if (!html.includes(search)) throw new Error(`Không tìm thấy placeholder trong HTML: ${search}`);
  return html.replace(search, replacement);
}

for (const guest of guests) {
  const heading = `Thiệp cưới ${wedding.groom} & ${wedding.bride} kính mời ${guest.name}`;
  const description = `Trân trọng kính mời ${guest.name} đến chung vui cùng ${wedding.groom} và ${wedding.bride} vào ${wedding.dateLabel}.`;
  const url = `${wedding.siteUrl.replace(/\/+$/, '')}/moi/${guest.slug}`;
  let html = index;
  html = replaceTag(html, '<title>Thiệp cưới của chúng mình</title>', `<title>${escapeHtml(heading)}</title>`);
  html = replaceTag(html, 'content="Một lời mời cưới chân thành, dành riêng cho bạn."', `content="${escapeHtml(description)}"`);
  html = replaceTag(html, 'content="Thiệp mời dự lễ thành hôn"', `content="${escapeHtml(heading)}"`);
  html = replaceTag(html, 'content="Trân trọng kính mời bạn đến chung vui cùng chúng mình."', `content="${escapeHtml(description)}"`);
  const imageTags = wedding.shareImageUrl
    ? `\n    <meta property="og:image" content="${escapeHtml(wedding.shareImageUrl)}" />\n    <meta name="twitter:image" content="${escapeHtml(wedding.shareImageUrl)}" />`
    : '';
  html = replaceTag(html, '</head>', `    <meta property="og:url" content="${escapeHtml(url)}" />${imageTags}\n  </head>`);
  // Generate an index page in each guest folder so the public URL
  // `/moi/<guest-slug>` is resolved directly by Vercel (and other static
  // hosts) without relying on their optional clean-URL behaviour.
  const guestDirectory = path.join(destination, guest.slug);
  fs.mkdirSync(guestDirectory, { recursive: true });
  fs.writeFileSync(path.join(guestDirectory, 'index.html'), html, 'utf8');
}
console.log(`✓ Tạo ${guests.length} trang HTML tĩnh, mỗi trang có tiêu đề chia sẻ riêng.`);
