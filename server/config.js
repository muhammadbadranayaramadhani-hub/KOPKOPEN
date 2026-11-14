const int = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function loadConfig(env = process.env) {
  const effort = (env.GROQ_REASONING_EFFORT || '').trim().toLowerCase();
  return {
    port: int(env.PORT, 8787, 1, 65535),
<<<<<<< HEAD
    host: env.HOST || '127.0.0.1',
    apiKey: (env.GROQ_API_KEY || '').trim(),
    model: (env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
    reasoningEffort: ['none', 'low', 'medium', 'high'].includes(effort) ? effort : null,
=======
    host: env.HOST || '0.0.0.0',

    apiKey: (env.GROQ_API_KEY || '').trim(),
    model: (env.GROQ_MODEL || 'openai/gpt-oss-20b').trim(),

>>>>>>> 491c03a43c7148600a97de6fe965b79c0dbba886
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

