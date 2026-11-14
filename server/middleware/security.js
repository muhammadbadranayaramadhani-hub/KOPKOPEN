// Header keamanan dasar + CORS terbatas. Saat frontend memakai proxy Vite (satu origin), CORS tidak diperlukan.

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  next();
}

export function cors(allowedOrigins = []) {
  const allowed = new Set(allowedOrigins);
  return function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (origin && allowed.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '600');
    }
    if (req.method === 'OPTIONS') {
      res.statusCode = origin && allowed.has(origin) ? 204 : 403;
      return res.end();
    }
    return next();
  };
}
