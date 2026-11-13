import { AppError, invalid } from '../errors.js';

// Semua masukan dari browser diperlakukan TIDAK TEPERCAYA. Fungsi di sini membersihkan, membatasi
// panjang, dan memvalidasi bentuk data sebelum menyentuh konteks atau prompt.

export const LIMITS = Object.freeze({
  message: 400,
  historyItems: 8,
  historyText: 600,
  answer: 200,
  reasoning: 500,
  topic: 60,
  idList: 40,
});

// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value, { field = 'teks', max = LIMITS.message, min = 1, allowEmpty = false } = {}) {
  if (typeof value !== 'string') throw invalid(`${field} harus berupa teks.`);
  const s = value.replace(CTRL, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!allowEmpty && s.length < min) throw invalid(`${field} tidak boleh kosong.`);
  if (s.length > max) throw new AppError('INPUT_TOO_LONG', `${field} maksimal ${max} karakter.`, 400);
  return s;
}

// Mencegah pemain "menutup" pembatas tag di prompt (<player_message>...).
export function escapeForPrompt(s) {
  return String(s).replace(/</g, '＜').replace(/>/g, '＞');
}

export function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function requireBody(body) {
  if (!isPlainObject(body)) throw invalid('Isi permintaan harus berupa objek JSON.');
  return body;
}

export function oneOf(value, list, field, fallback) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw invalid(`${field} wajib diisi.`);
  }
  if (!list.includes(value)) throw invalid(`${field} tidak valid.`, { allowed: list });
  return value;
}

export function boundedInt(value, { min = 0, max = 3, fallback = 0, field = 'angka' } = {}) {
  if (value === undefined || value === null) return fallback;
  if (!Number.isFinite(value)) throw invalid(`${field} harus berupa angka.`);
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

// Daftar ID: harus array string pendek; ID yang tidak dikenal diabaikan (klien lama / data usang).
export function idList(value, whitelist, field) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > LIMITS.idList) throw invalid(`${field} harus berupa daftar singkat.`);
  const out = [];
  for (const v of value) {
    if (typeof v !== 'string' || v.length > 40) throw invalid(`${field} berisi nilai tidak valid.`);
    if (whitelist.includes(v) && !out.includes(v)) out.push(v);
  }
  return out;
}

// Riwayat percakapan: {role:'user'|'model', text}. Batasi jumlah & panjang; wajib mulai dari 'user'.
export function sanitizeHistory(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw invalid('Riwayat percakapan harus berupa daftar.');
  const items = value.slice(-LIMITS.historyItems).map((it) => {
    if (!isPlainObject(it) || !['user', 'model'].includes(it.role)) throw invalid('Format riwayat percakapan tidak valid.');
    // Balasan AI bisa lebih panjang dari batas; potong saja (jangan tolak) agar percakapan tidak macet.
    const text = cleanText(String(it.text ?? '').slice(0, LIMITS.historyText), { field: 'Riwayat', max: LIMITS.historyText, allowEmpty: true });
    return { role: it.role, text };
  }).filter((it) => it.text);
  while (items.length && items[0].role !== 'user') items.shift();
  // gabungkan peran berurutan yang sama agar bergantian
  const merged = [];
  for (const it of items) {
    const last = merged[merged.length - 1];
    if (last && last.role === it.role) last.text += `\n${it.text}`;
    else merged.push({ ...it });
  }
  return merged;
}

// Susun "contents" Gemini. Pesan pemain dibungkus tag agar jelas sebagai data.
export function toContents(history, userText, { tag = 'player_message' } = {}) {
  const contents = history.map((h) => ({
    role: h.role,
    parts: [{ text: h.role === 'user' ? `<${tag}>${escapeForPrompt(h.text)}</${tag}>` : h.text }],
  }));
  const wrapped = `<${tag}>${escapeForPrompt(userText)}</${tag}>`;
  const last = contents[contents.length - 1];
  if (last && last.role === 'user') last.parts[0].text += `\n${wrapped}`;
  else contents.push({ role: 'user', parts: [{ text: wrapped }] });
  return contents;
}

// ---------- Deteksi upaya injeksi prompt / permintaan jawaban langsung ----------
const INJECTION = [
  /abaikan\s+(semua\s+|seluruh\s+)?(instruksi|perintah|aturan|petunjuk)/i,
  /lupakan\s+(semua\s+|seluruh\s+)?(instruksi|perintah|aturan)/i,
  /ignore\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above|earlier|your)\s+(instructions?|prompts?|rules?)/i,
  /(system|developer)\s*(prompt|message|instruction)/i,
  /(prompt|instruksi|aturan)\s+sistem/i,
  /(kamu|anda)\s+(sekarang\s+)?(adalah|jadi)\s+(ai|chatgpt|dan|bot)\b/i,
  /(berpura-pura|pura-pura)\s+(menjadi|jadi)/i,
  /jailbreak|developer\s+mode|dan\s+mode/i,
  /(tampilkan|tunjukkan|bocorkan|ungkapkan|reveal|show|print|tulis ulang)\s+.{0,30}(instruksi|prompt|aturan|api\s*key|kunci\s*api)/i,
  /(role|peran)\s*[:=]\s*(system|developer)/i,
];
const SPOILER_REQUEST = [
  /(jawaban|solusi|kunci)\s+(resmi|akhir|sebenarnya|lengkap|rahasia)/i,
  /(langsung|sekarang)\s+(beri|kasih|bilang|katakan|sebutkan).{0,25}(jawab|penyebab|kesimpulan|solusi)/i,
  /siapa\s+pelaku(nya)?|apa\s+penyebab(nya)?\s+(sebenarnya|yang benar)/i,
  /(beri|kasih|bilang)\s*(tahu)?\s*(aku|saya)?\s*(jawaban|kesimpulan)(nya)?\b/i,
];

export function classifyMessage(text) {
  return {
    injection: INJECTION.some((re) => re.test(text)),
    spoilerRequest: SPOILER_REQUEST.some((re) => re.test(text)),
  };
}

// ---------- Angka dan aritmetika deterministik ----------
export function numbersIn(text) {
  const out = [];
  for (const m of String(text).matchAll(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?/g)) {
    let tok = m[0];
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(tok)) tok = tok.replace(/\./g, '').replace(',', '.');
    else tok = tok.replace(',', '.');
    const n = Number(tok);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

// Evaluator ekspresi aritmetika AMAN (tanpa eval): angka, + - * / ^ ( ) dan x/× sebagai kali.
export function safeEval(expr) {
  const src = String(expr).replace(/[×x]/gi, '*').replace(/÷/g, '/').replace(/,/g, '.').replace(/\s+/g, '');
  if (!src || src.length > 80 || !/^[0-9+\-*/^().]+$/.test(src)) throw new Error('ekspresi tidak valid');
  let i = 0;
  const peek = () => src[i];
  function parseNumber() {
    const m = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (!m) throw new Error('angka diharapkan');
    i += m[0].length;
    return Number(m[0]);
  }
  function parsePrimary() {
    if (peek() === '(') {
      i++;
      const v = parseAddSub();
      if (peek() !== ')') throw new Error('kurung tidak seimbang');
      i++;
      return v;
    }
    if (peek() === '-') { i++; return -parsePower(); }
    if (peek() === '+') { i++; return parsePower(); }
    return parseNumber();
  }
  function parsePower() {
    const base = parsePrimary();
    if (peek() === '^') {
      i++;
      const exp = parsePower();
      if (Math.abs(exp) > 12) throw new Error('pangkat terlalu besar');
      return base ** exp;
    }
    return base;
  }
  function parseMulDiv() {
    let v = parsePower();
    while (peek() === '*' || peek() === '/') {
      const op = src[i++];
      const r = parsePower();
      if (op === '/') { if (r === 0) throw new Error('pembagian nol'); v /= r; } else v *= r;
    }
    return v;
  }
  function parseAddSub() {
    let v = parseMulDiv();
    while (peek() === '+' || peek() === '-') {
      const op = src[i++];
      const r = parseMulDiv();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  const result = parseAddSub();
  if (i !== src.length) throw new Error('karakter tak terduga');
  if (!Number.isFinite(result)) throw new Error('hasil tidak terhingga');
  return result;
}

export const approxEqual = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));

// ---------- Keluaran JSON dari AI ----------
export function parseJsonLoose(text) {
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a === -1 || b <= a) throw new AppError('AI_BAD_OUTPUT', 'AI mengembalikan format yang tidak dapat dibaca.', 502);
  try {
    return JSON.parse(s.slice(a, b + 1));
  } catch {
    throw new AppError('AI_BAD_OUTPUT', 'AI mengembalikan JSON yang tidak valid.', 502);
  }
}

const bad = (msg) => new AppError('AI_BAD_OUTPUT', `Keluaran AI tidak valid: ${msg}`, 502);

export function strField(v, name, { max = 400, min = 1 } = {}) {
  if (typeof v !== 'string') throw bad(`${name} bukan teks`);
  const s = v.replace(CTRL, '').trim();
  if (s.length < min) throw bad(`${name} kosong`);
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

export function scoreField(v, name) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw bad(`${name} bukan angka`);
  return Math.min(100, Math.max(0, Math.round(v)));
}

export function listField(v, name, { min = 1, max = 4, itemMax = 180 } = {}) {
  if (!Array.isArray(v)) throw bad(`${name} bukan daftar`);
  const items = v.map((x) => strField(x, name, { max: itemMax })).slice(0, max);
  if (items.length < min) throw bad(`${name} terlalu sedikit`);
  return items;
}

// Teks yang dihasilkan AI tidak boleh memuat angka besar di luar fakta resmi (cegah klaim keliru).
export function assertOnlyAllowedBigNumbers(text, allowed, name = 'teks') {
  const offenders = numbersIn(text).filter((n) => n >= 100 && !allowed.includes(n));
  if (offenders.length) throw bad(`${name} memuat angka tidak resmi (${offenders.slice(0, 3).join(', ')})`);
}
