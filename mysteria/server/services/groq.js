import { AppError } from '../errors.js';

// Penyedia AI alternatif: Groq (API kompatibel OpenAI). Memakai fetch bawaan Node, tanpa SDK tambahan.
// Antarmukanya sama dengan createGemini: { isConfigured, model, generate({system, contents, json, schema, temperature, maxOutputTokens}) }.
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export function mapGroqError(status, bodyText = '', aborted = false) {
  if (aborted) return new AppError('AI_TIMEOUT', 'Layanan AI terlalu lama merespons.', 504);
  if (status === 429) return new AppError('AI_RATE_LIMITED', 'Batas penggunaan layanan AI tercapai. Coba lagi sebentar lagi.', 429);
  if (status === 401 || status === 403) return new AppError('AI_AUTH_FAILED', 'Server tidak dapat mengakses layanan AI (periksa konfigurasi kunci API).', 502);
  if (status === 404 || /model_not_found|does not exist|decommissioned|no longer supported/i.test(bodyText)) return new AppError('AI_MODEL_NOT_FOUND', 'Model AI yang dikonfigurasi tidak tersedia.', 502);
  if (/json_validate_failed|failed to generate json/i.test(bodyText)) return new AppError('AI_BAD_OUTPUT', 'AI gagal menyusun jawaban dalam format yang benar. Coba lagi.', 502, { reason: 'json_validate_failed' });
  if (status === 400 || status === 422) return new AppError('AI_BAD_REQUEST', 'Layanan AI menolak permintaan ini.', 502);
  return new AppError('AI_UNAVAILABLE', 'Layanan AI sedang tidak tersedia.', 503);
}

// Skema gaya Gemini (tipe huruf besar) -> petunjuk JSON ringkas untuk prompt (json_object tidak menegakkan skema).
export function schemaHint(schema) {
  if (!schema || !schema.properties) return '';
  const req = new Set(schema.required || []);
  const typeOf = (p) => (p.type === 'ARRAY' ? `array of ${p.items && p.items.type ? String(p.items.type).toLowerCase() : 'value'}` : String(p.type || 'string').toLowerCase());
  const lines = Object.entries(schema.properties).map(([k, p]) => `- "${k}": ${typeOf(p)}${req.has(k) ? ' (wajib)' : ' (opsional)'}`);
  return `\n\nFORMAT KELUARAN: balas dengan SATU objek JSON valid saja (tanpa teks lain, tanpa markdown) dengan bidang:\n${lines.join('\n')}`;
}

export function toMessages(system, contents) {
  const msgs = [{ role: 'system', content: system }];
  for (const c of contents || []) {
    msgs.push({ role: c.role === 'model' ? 'assistant' : 'user', content: (c.parts || []).map((p) => p.text || '').join('') });
  }
  return msgs;
}

const isReasoningModel = (m) => /gpt-oss|qwen3|deepseek-r1|muse/i.test(m);

export function createGroq(config, { fetchImpl = globalThis.fetch } = {}) {
  const configured = Boolean(config.groqApiKey);
  const model = config.groqModel;
  return {
    isConfigured: configured,
    model,
    provider: 'groq',
    async generate({ system, contents, json = false, schema, temperature = 0.6, maxOutputTokens = 500 }) {
      if (!configured) throw new AppError('AI_NOT_CONFIGURED', 'Layanan AI belum dikonfigurasi di server (GROQ_API_KEY belum diisi).', 503);
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), config.timeoutMs);
      const reasoning = isReasoningModel(model);
      const body = {
        model,
        messages: toMessages(json ? system + schemaHint(schema) : system, contents),
        temperature,
        // Model "berpikir" menghitung token penalaran dalam batas output; beri ruang agar jawaban tidak terpotong.
        max_completion_tokens: reasoning ? maxOutputTokens + 1500 : maxOutputTokens,
      };
      if (json) body.response_format = { type: 'json_object' };
      if (reasoning && /gpt-oss/i.test(model)) { body.reasoning_effort = 'low'; body.include_reasoning = false; }
      let res;
      try {
        res = await fetchImpl(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.groqApiKey}` }, body: JSON.stringify(body), signal: ac.signal });
      } catch (err) {
        throw ac.signal.aborted || (err && err.name === 'AbortError') ? mapGroqError(0, '', true) : new AppError('AI_UNAVAILABLE', 'Tidak dapat menghubungi layanan AI.', 503);
      } finally {
        clearTimeout(timer);
      }
      const raw = await res.text().catch(() => '');
      if (!res.ok) {
        let why = '';
        try { const j = JSON.parse(raw); why = (j.error && (j.error.message || j.error.code)) || ''; } catch { /* abaikan */ }
        console.warn(`[mysteria] Groq HTTP ${res.status}${why ? `: ${String(why).slice(0, 300)}` : ''}`);
        throw mapGroqError(res.status, raw);
      }
      let data;
      try { data = JSON.parse(raw); } catch { throw new AppError('AI_BAD_OUTPUT', 'Jawaban layanan AI tidak dapat dibaca.', 502); }
      const choice = data && data.choices && data.choices[0];
      const text = choice && choice.message && typeof choice.message.content === 'string' ? choice.message.content.trim() : '';
      if (!text) throw new AppError('AI_EMPTY_RESPONSE', 'Layanan AI tidak memberi jawaban. Coba lagi.', 502);
      if (choice.finish_reason === 'length') throw new AppError('AI_BAD_OUTPUT', 'Jawaban AI terpotong. Coba lagi.', 502, { reason: 'length' });
      return { text };
    },
  };
}
