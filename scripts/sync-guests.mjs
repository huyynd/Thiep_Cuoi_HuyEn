import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { wedding } from '../src/config/wedding.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(root, 'data', 'guests.csv');
const jsonOutput = path.join(root, 'src', 'data', 'guests.generated.json');
const csvOutput = path.join(root, 'danh-sach-link.csv');

/** CSV parser: UTF-8/BOM, commas, escaped quotes, CRLF and line breaks in quoted cells. */
function parseCsv(content) {
  const input = content.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell.trim()); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV thiếu dấu ngoặc kép đóng.');
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function makeSlug(value) {
  return value.toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function csvCell(value) {
  let text = String(value);
  // Prevent Excel from interpreting a guest value as a formula.
  if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

const lines = parseCsv(fs.readFileSync(input, 'utf8'));
if (lines.length < 2 || lines[0][0] !== 'ma' || lines[0][1] !== 'ten_hien_thi') {
  throw new Error('data/guests.csv phải có dòng đầu: ma,ten_hien_thi');
}
const seen = new Set();
const guests = lines.slice(1).map(([givenCode, displayName], rowIndex) => {
  if (!displayName) throw new Error(`Dòng ${rowIndex + 2}: thiếu ten_hien_thi.`);
  const slugName = makeSlug(displayName);
  if (!slugName) throw new Error(`Dòng ${rowIndex + 2}: không tạo được slug từ tên khách.`);
  const code = givenCode
    ? makeSlug(givenCode)
    : crypto.createHash('sha256').update(displayName).digest('hex').slice(0, 6);
  if (!code || code.length > 24) {
    throw new Error(`Dòng ${rowIndex + 2}: mã khách không hợp lệ (tối đa 24 ký tự).`);
  }
  const slug = `${slugName}-${code}`;
  if (seen.has(slug)) {
    throw new Error(`Dòng ${rowIndex + 2}: đường link bị trùng (${slug}). Hãy đặt mã riêng trong cột ma.`);
  }
  seen.add(slug);
  return { id: code, name: displayName, slug };
});

const siteUrl = wedding.siteUrl.replace(/\/+$/, '');
if (!/^https:\/\//.test(siteUrl)) throw new Error('wedding.siteUrl phải là URL bắt đầu bằng https://');

fs.writeFileSync(jsonOutput, JSON.stringify(guests, null, 2) + '\n', 'utf8');
const outputRows = [
  '\uFEFF' + ['ma', 'ten_hien_thi', 'duong_link'].map(csvCell).join(','),
  ...guests.map(g => [g.id, g.name, `${siteUrl}/moi/${g.slug}`].map(csvCell).join(','))
];
fs.writeFileSync(csvOutput, outputRows.join('\r\n') + '\r\n', 'utf8');
console.log(`✓ Đã cập nhật ${guests.length} khách mời.`);
console.log('✓ Danh sách URL: danh-sach-link.csv');
