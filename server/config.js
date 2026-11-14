const int = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function loadConfig(env = process.env) {
  return {
    port: int(env.PORT, 8787, 1, 65535),
    host: env.HOST || '0.0.0.0',

    apiKey: (env.GROQ_API_KEY || '').trim(),
    model: (env.GROQ_MODEL || 'openai/gpt-oss-20b').trim(),

    timeoutMs: int(env.AI_TIMEOUT_MS, 25000, 3000, 120000),
    rateLimitPerMin: int(env.RATE_LIMIT_PER_MIN, 30, 1, 1000),
    rateLimitHeavyPerMin: int(env.RATE_LIMIT_HEAVY_PER_MIN, 8, 1, 500),

    allowedOrigins: (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),

    trustProxy: env.TRUST_PROXY === '1' || env.TRUST_PROXY === 'true',
  };
}
