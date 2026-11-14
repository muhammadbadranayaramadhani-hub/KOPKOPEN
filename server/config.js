import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Pembaca .env kecil (tanpa dependensi). Tidak menimpa variabel yang sudah ada di environment.
export function parseEnv(text) {
  const out = {};
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    else val = val.replace(/\s+#.*$/, '');
    out[key] = val;
  }
  return out;
}

export function loadEnvFile(file = path.join(here, '.env'), env = process.env) {
  try {
    const parsed = parseEnv(fs.readFileSync(file, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) if (env[k] === undefined) env[k] = v;
    return true;
  } catch {
    return false;
  }
}

const int = (v, d, min, max) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};

export function loadConfig(env = process.env) {
  const effort = (env.GROQ_REASONING_EFFORT || '').trim().toLowerCase();
  return {
    port: int(env.PORT, 8787, 1, 65535),
    host: env.HOST || '127.0.0.1',
    apiKey: (env.GROQ_API_KEY || '').trim(),
    model: (env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
    reasoningEffort: ['none', 'low', 'medium', 'high'].includes(effort) ? effort : null,
    timeoutMs: int(env.AI_TIMEOUT_MS, 25000, 3000, 120000),
    rateLimitPerMin: int(env.RATE_LIMIT_PER_MIN, 30, 1, 1000),
    rateLimitHeavyPerMin: int(env.RATE_LIMIT_HEAVY_PER_MIN, 8, 1, 500),
    allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
    trustProxy: env.TRUST_PROXY === '1' || env.TRUST_PROXY === 'true',
  };
}

