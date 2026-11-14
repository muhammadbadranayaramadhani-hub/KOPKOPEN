// Klien tipis untuk backend AI MYSTERIA. TIDAK ada kunci API di sini: semua panggilan lewat /api/ai/*
// (diteruskan proxy Vite / reverse proxy ke server Express yang memegang GEMINI_API_KEY).

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';
const TIMEOUT_MS = 35000;

export class AiError extends Error {
  constructor(code, message, { retryable = false, status = 0, retryAfter } = {}) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => ctrl.abort());
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } catch (e) {
    if (ctrl.signal.aborted && !(signal && signal.aborted)) throw new AiError('TIMEOUT', 'AI terlalu lama menjawab. Coba lagi.', { retryable: true });
    if (signal && signal.aborted) throw new AiError('ABORTED', 'Dibatalkan.');
    throw new AiError('OFFLINE', 'Tidak dapat terhubung ke server AI. Game tetap bisa dimainkan tanpa AI.', { retryable: true });
  } finally {
    clearTimeout(timer);
  }
  let json = null;
  try { json = await res.json(); } catch { /* bukan JSON */ }
  if (!json || typeof json !== 'object') throw new AiError('BAD_RESPONSE', 'Server AI memberi jawaban yang tidak dikenali.', { retryable: true, status: res.status });
  if (!json.success) {
    const e = json.error || {};
    throw new AiError(e.code || 'ERROR', e.message || 'Terjadi kesalahan.', { retryable: Boolean(e.retryable), status: res.status, retryAfter: e.retryAfter });
  }
  return json.data;
}

export const fetchHealth = (signal) => request('/api/health', { signal });
export const ai = {
  companion: (body, signal) => request('/api/ai/companion', { method: 'POST', body, signal }),
  interrogate: (body, signal) => request('/api/ai/interrogate', { method: 'POST', body, signal }),
  tutor: (body, signal) => request('/api/ai/tutor', { method: 'POST', body, signal }),
  evaluate: (body, signal) => request('/api/ai/evaluate', { method: 'POST', body, signal }),
  generateChallenge: (body, signal) => request('/api/ai/generate-challenge', { method: 'POST', body, signal }),
};

// Ringkasan progres yang dikirim ke server (hanya ID; isi bukti diambil server dari datanya sendiri).
export function buildProgress(cs) {
  const done = (map) => Object.entries(map || {}).filter(([, v]) => v && v.done).map(([k]) => k);
  return {
    location: cs.location || null,
    collected: [...(cs.collected || [])],
    solved: done(cs.challenges),
    connections: done(cs.connections),
    hypothesis: (cs.flags && cs.flags.hypothesis) || null,
    caseSolved: Boolean(cs.final && cs.final.solved),
  };
}

export function friendlyError(err) {
  if (!(err instanceof AiError)) return { message: 'Terjadi kesalahan tak terduga.', retryable: true };
  const map = {
    AI_NOT_CONFIGURED: 'Fitur AI belum diaktifkan di server. Game tetap dapat dimainkan.',
    RATE_LIMITED: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
    INPUT_TOO_LONG: err.message,
    CHARACTER_LOCKED: err.message,
  };
  return { message: map[err.code] || err.message, retryable: err.retryable && err.code !== 'AI_NOT_CONFIGURED' };
}
