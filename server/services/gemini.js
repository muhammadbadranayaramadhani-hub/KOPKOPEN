import { AppError } from '../errors.js';

// Pembungkus tunggal Google Gen AI SDK (@google/genai). Satu konfigurasi dipakai bersama kelima identitas AI.
// SDK dimuat malas (dynamic import) agar server tetap bisa naik dan melapor "AI belum dikonfigurasi"
// walau kunci belum diisi, dan agar logika lain bisa diuji dengan klien pengganti.

export function thinkingConfigFor(config) {
  if (config.thinkingBudget !== null && config.thinkingBudget !== undefined) return { thinkingBudget: config.thinkingBudget };
  if (config.thinkingLevel) return config.thinkingLevel === 'off' ? null : { thinkingLevel: config.thinkingLevel };
  // Flash 2.5 mendukung thinkingBudget 0 sehingga token output tidak habis untuk "berpikir".
  if (/2\.5-flash/.test(config.model) && !/pro/.test(config.model)) return { thinkingBudget: 0 };
  // Seri Gemini 3 memakai thinkingLevel; "low" menjaga jawaban singkat cepat dan murah.
  if (/gemini-3/.test(config.model)) return { thinkingLevel: 'low' };
  return null;
}

export function mapGeminiError(err, aborted = false) {
  if (err instanceof AppError) return err;
  const msg = String((err && (err.message || err.statusText)) || '');
  const status = Number(err && (err.status || err.code)) || 0;
  if (aborted || (err && err.name === 'AbortError') || /aborted|timed? ?out/i.test(msg)) {
    return new AppError('AI_TIMEOUT', 'Layanan AI terlalu lama merespons.', 504);
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(msg)) {
    return new AppError('AI_RATE_LIMITED', 'Batas penggunaan layanan AI tercapai. Coba lagi sebentar lagi.', 429);
  }
  if (status === 401 || status === 403 || /API key (not valid|expired)|PERMISSION_DENIED|API_KEY_INVALID/i.test(msg)) {
    return new AppError('AI_AUTH_FAILED', 'Server tidak dapat mengakses layanan AI (periksa konfigurasi kunci API).', 502);
  }
  if (status === 404 || /not found|is not supported/i.test(msg)) {
    return new AppError('AI_MODEL_NOT_FOUND', 'Model AI yang dikonfigurasi tidak tersedia.', 502);
  }
  if (status === 400 || /INVALID_ARGUMENT/i.test(msg)) {
    return new AppError('AI_BAD_REQUEST', 'Layanan AI menolak permintaan ini.', 502);
  }
  return new AppError('AI_UNAVAILABLE', 'Layanan AI sedang tidak tersedia.', 503);
}

export function createGemini(config, { sdkLoader = () => import('@google/genai') } = {}) {
  const configured = Boolean(config.apiKey);
  let clientPromise = null;

  function getClient() {
    if (!clientPromise) {
      clientPromise = sdkLoader().then((mod) => new mod.GoogleGenAI({ apiKey: config.apiKey }));
      clientPromise.catch(() => { clientPromise = null; });
    }
    return clientPromise;
  }

  async function generate({ system, contents, json = false, schema, temperature = 0.7, maxOutputTokens = 700 }) {
    if (!configured) {
      throw new AppError('AI_NOT_CONFIGURED', 'Layanan AI belum dikonfigurasi di server (GEMINI_API_KEY belum diisi).', 503);
    }
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), config.timeoutMs);
    try {
      const client = await getClient();
      const thinking = thinkingConfigFor(config);
      // Token "berpikir" ikut dihitung dalam batas output; beri ruang agar jawaban tidak terpotong.
      const thinksSomething = !thinking || thinking.thinkingBudget !== 0;
      const cfg = { systemInstruction: system, temperature, maxOutputTokens: thinksSomething ? maxOutputTokens + 1500 : maxOutputTokens, abortSignal: ac.signal };
      if (json) {
        cfg.responseMimeType = 'application/json';
        if (schema) cfg.responseSchema = schema;
      }
      if (thinking) cfg.thinkingConfig = thinking;
      const res = await client.models.generateContent({ model: config.model, contents, config: cfg });
      const text = res && typeof res.text === 'string' ? res.text.trim() : '';
      if (!text) {
        const reason = (res && res.candidates && res.candidates[0] && res.candidates[0].finishReason) || (res && res.promptFeedback && res.promptFeedback.blockReason) || 'unknown';
        throw new AppError('AI_EMPTY_RESPONSE', 'AI tidak memberikan jawaban untuk permintaan ini.', 502, { reason });
      }
      const finish = res && res.candidates && res.candidates[0] && res.candidates[0].finishReason;
      if (finish === 'MAX_TOKENS') throw new AppError('AI_BAD_OUTPUT', 'Jawaban AI terpotong. Coba lagi.', 502, { reason: finish });
      return { text };
    } catch (err) {
      const mapped = mapGeminiError(err, ac.signal.aborted);
      if (!(err instanceof AppError)) console.error(`[gemini] ${mapped.code} (${err && err.name}: ${String(err && err.message).slice(0, 160)})`);
      throw mapped;
    } finally {
      clearTimeout(timer);
    }
  }

  return { isConfigured: configured, model: config.model, generate };
}
