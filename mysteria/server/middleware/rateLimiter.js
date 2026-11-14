import { AppError } from '../errors.js';

// Pembatas laju jendela-tetap di memori, per IP. Cukup untuk satu proses; untuk banyak instance
// gunakan penyimpanan bersama (Redis) di deployment produksi.
export function createRateLimiter({ windowMs = 60_000, max = 30, name = 'umum', now = Date.now, keyFn } = {}) {
  const hits = new Map();
  const sweep = setInterval(() => {
    const t = now();
    for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
  }, Math.max(windowMs, 10_000));
  if (typeof sweep.unref === 'function') sweep.unref();

  const mw = function rateLimiter(req, res, next) {
    const key = keyFn ? keyFn(req) : req.ip || req.socket?.remoteAddress || 'anon';
    const t = now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= t) {
      entry = { count: 0, reset: t + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.reset / 1000)));
    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.reset - t) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return next(new AppError('RATE_LIMITED', `Terlalu banyak permintaan (${name}). Coba lagi dalam ${retryAfter} detik.`, 429, { retryAfter }));
    }
    return next();
  };
  mw.reset = () => hits.clear();
  mw.stop = () => clearInterval(sweep);
  return mw;
}
