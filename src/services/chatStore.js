// Penyimpanan riwayat chat AI (RENNTZY, REI) di luar komponen, supaya riwayat tidak hilang
// saat panel ditutup (komponen dilepas). Disalin ke sessionStorage agar bertahan juga saat halaman dimuat ulang.
const mem = new Map();
const PREFIX = 'mysteria.chat.';
const MAX_MESSAGES = 40;

function session() {
  try { return typeof sessionStorage !== 'undefined' ? sessionStorage : null; } catch { return null; }
}
const valid = (m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string';

export function loadChat(key) {
  if (!key) return [];
  if (mem.has(key)) return mem.get(key);
  let list = [];
  try {
    const st = session();
    const raw = st && st.getItem(PREFIX + key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed.filter(valid).slice(-MAX_MESSAGES);
  } catch { /* abaikan: riwayat dimulai kosong */ }
  mem.set(key, list);
  return list;
}

export function saveChat(key, messages) {
  if (!key) return;
  const list = messages.filter(valid).slice(-MAX_MESSAGES);
  mem.set(key, list);
  try {
    const st = session();
    if (st) st.setItem(PREFIX + key, JSON.stringify(list));
  } catch { /* penyimpanan penuh/diblokir: tetap tersimpan di memori */ }
}

export function clearChats() {
  mem.clear();
  try {
    const st = session();
    if (!st) return;
    Object.keys(st).filter((k) => k.startsWith(PREFIX)).forEach((k) => st.removeItem(k));
  } catch { /* abaikan */ }
}
