import { AppError } from '../errors.js';

export function thinkingConfigFor() {
  return null;
}

export function mapGeminiError(err, aborted = false) {
  if (err instanceof AppError) return err;
  const msg = String((err && (err.message || err.statusText)) || '');
  const status = Number(err && (err.status || err.code)) || 0;
  if (aborted || (err && err.name === 'AbortError') || /aborted|timed? ?out/i.test(msg)) {
    return new AppError('AI_TIMEOUT', 'Layanan AI terlalu lama merespons.', 504);
  }
  if (status === 429 || /quota|rate limit/i.test(msg)) {
    return new AppError('AI_RATE_LIMITED', 'Batas penggunaan layanan AI tercapai. Coba lagi sebentar lagi.', 429);
  }
  if (status === 401 || status === 403 || /Invalid API Key|invalid_api_key|authentication/i.test(msg)) {
    return new AppError('AI_AUTH_FAILED', 'Server tidak dapat mengakses layanan AI (periksa konfigurasi kunci API Groq).', 502);
  }
  if (status === 404 || /model_not_found|does not exist/i.test(msg)) {
    return new AppError('AI_MODEL_NOT_FOUND', 'Model AI yang dikonfigurasi tidak tersedia.', 502);
  }
  if (status === 400 || /invalid_request_error/i.test(msg)) {
    return new AppError('AI_BAD_REQUEST', 'Layanan AI menolak permintaan ini.', 502);
  }
  return new AppError('AI_UNAVAILABLE', 'Layanan AI sedang tidak tersedia.', 503);
}

function toOpenAIMessages(system, contents) {
  const messages = [];
  if (system) {
    messages.push({ role: 'system', content: String(system) });
  }
  if (typeof contents === 'string') {
    messages.push({ role: 'user', content: contents });
    return messages;
  }
  if (Array.isArray(contents)) {
    for (const item of contents) {
      if (typeof item === 'string') {
        messages.push({ role: 'user', content: item });
        continue;
      }
      const role = item.role === 'model' ? 'assistant' : (item.role || 'user');
      const text = Array.isArray(item.parts)
        ? item.parts.map((p) => (typeof p === 'string' ? p : p.text || '')).join('')
        : String(item.content || item.text || '');
      if (text) messages.push({ role, content: text });
    }
  }
  return messages;
}

function describeSchema(node) {
  if (!node || typeof node !== 'object') return '"teks"';
  const rawType = String(node.type || 'object').toLowerCase();
  if (rawType === 'object' && node.properties) {
    const entries = Object.entries(node.properties).map(([k, v]) => `"${k}": ${describeSchema(v)}`);
    return `{ ${entries.join(', ')} }`;
  }
  if (rawType === 'array') {
    return `[${describeSchema(node.items)}]`;
  }
  if (rawType === 'integer' || rawType === 'number') return '0';
  if (rawType === 'boolean') return 'true';
  return node.description ? `"<${node.description}>"` : '"<teks>"';
}

export function createGemini(config, { sdkLoader = () => import('openai') } = {}) {
  const configured = Boolean(config.apiKey);
  const modelName = /^gemini/i.test(config.model) ? 'openai/gpt-oss-20b' : (config.model || 'openai/gpt-oss-20b');
  let clientPromise = null;

  function getClient() {
    if (!clientPromise) {
      clientPromise = sdkLoader().then((mod) => {
        const OpenAI = mod.default || mod.OpenAI;
        return new OpenAI({
          apiKey: config.apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        });
      });
      clientPromise.catch(() => { clientPromise = null; });
    }
    return clientPromise;
  }

  async function generate({ system, contents, json = false, schema, temperature = 0.7, maxOutputTokens = 700 }) {
    if (!configured) {
      throw new AppError('AI_NOT_CONFIGURED', 'Layanan AI belum dikonfigurasi di server (API Key belum diisi).', 503);
    }
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), config.timeoutMs);
    try {
      const client = await getClient();
      const messages = toOpenAIMessages(system, contents);

      if (json) {
        const example = schema
          ? `\n\nATURAN OUTPUT WAJIB: Balas HANYA dengan satu objek JSON valid tanpa teks pengantar atau penutup apa pun. Isi nilainya sesuai instruksi (jangan menyalin placeholder tipe data). Struktur wajib:\n${describeSchema(schema)}`
          : '\n\nATURAN OUTPUT WAJIB: Balas HANYA dengan satu objek JSON valid tanpa teks tambahan.';
        if (messages.length > 0 && messages[0].role === 'system') {
          messages[0].content += example;
        } else {
          messages.unshift({ role: 'system', content: `Balas hanya dalam format JSON valid.${example}` });
        }
      }

      // Beri ruang token cukup besar agar proses reasoning model tidak memotong output JSON
      const safeMaxTokens = Math.max(maxOutputTokens * 3, 2048);

      const payload = {
        model: modelName,
        messages,
        temperature,
        max_tokens: safeMaxTokens,
      };

      const res = await client.chat.completions.create(payload, { signal: ac.signal });
      const choice = res && res.choices && res.choices[0];
      const text = choice && choice.message && typeof choice.message.content === 'string' ? choice.message.content.trim() : '';

      if (!text) {
        const reason = (choice && choice.finish_reason) || 'unknown';
        throw new AppError('AI_EMPTY_RESPONSE', 'AI tidak memberikan jawaban untuk permintaan ini.', 502, { reason });
      }
      if (choice.finish_reason === 'length') {
        throw new AppError('AI_BAD_OUTPUT', 'Jawaban AI terpotong. Coba lagi.', 502, { reason: choice.finish_reason });
      }
      return { text };
    } catch (err) {
      const mapped = mapGeminiError(err, ac.signal.aborted);
      if (!(err instanceof AppError)) console.error(`[groq] ${mapped.code} (${err && err.name}: ${String(err && err.message).slice(0, 160)})`);
      throw mapped;
    } finally {
      clearTimeout(timer);
    }
  }

  return { isConfigured: configured, model: modelName, generate };
}