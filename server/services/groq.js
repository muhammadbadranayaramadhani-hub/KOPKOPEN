import { AppError } from '../errors.js';
const RATE_LIMIT_MESSAGES_MINUTE = [
  'Yah, AI nya masih sibuk. Tunggu sebentar yaa.',
];

const RATE_LIMIT_MESSAGES_DAILY = [
  'Yah, AI nya sudah lelah. Coba lagi besok.',
];

function pickRandomMessage(list) {
  return list[Math.floor(Math.random() * list.length)];
}
export function mapGroqError(err, aborted = false) {
  if (err instanceof AppError) return err;

  const msg = String(err?.message || err?.statusText || '');
  const status = Number(
    err?.status || err?.statusCode || err?.code
  ) || 0;

  if (
    aborted ||
    err?.name === 'AbortError' ||
    err?.name === 'APIConnectionTimeoutError' ||
    /aborted|timed? ?out|timeout/i.test(msg)
  ) {
    return new AppError(
      'AI_TIMEOUT',
      'Layanan AI terlalu lama merespons.',
      504
    );
  }

 if (status === 429 || /rate limit|quota|too many requests/i.test(msg)) {
    const isDaily = /per day|tpd|rpd|daily/i.test(msg);
    const chosenMsg = isDaily
      ? pickRandomMessage(RATE_LIMIT_MESSAGES_DAILY)
      : pickRandomMessage(RATE_LIMIT_MESSAGES_MINUTE);

    return new AppError(
      'AI_RATE_LIMITED',
      chosenMsg,
      429
    );
  }

  if (status === 401 || status === 403) {
    return new AppError(
      'AI_AUTH_FAILED',
      'Server tidak dapat mengakses Groq. Periksa konfigurasi kunci API.',
      502
    );
  }

  if (status === 404) {
    return new AppError(
      'AI_MODEL_NOT_FOUND',
      'Model Groq yang dikonfigurasi tidak tersedia.',
      502
    );
  }

  if (status === 400) {
    return new AppError(
      'AI_BAD_REQUEST',
      `Groq menolak format permintaan ini. (${msg.slice(0, 120)})`,
      502
    );
  }

  return new AppError(
    'AI_UNAVAILABLE',
    'Layanan AI Groq sedang tidak tersedia.',
    503
  );
}

export function createGroq(
  config,
  { sdkLoader = () => import('groq-sdk') } = {}
) {
  const configured = Boolean(config.apiKey);
  let clientPromise = null;

  function getClient() {
    if (!clientPromise) {
      clientPromise = sdkLoader()
        .then((mod) => {
          const Groq = mod.default || mod.Groq;

          return new Groq({
            apiKey: config.apiKey,
            timeout: config.timeoutMs,
            maxRetries: 0,
          });
        })
        .catch((err) => {
          clientPromise = null;
          throw err;
        });
    }

    return clientPromise;
  }

  async function generate({
    system,
    contents = [],
    json = false,
    temperature = 0.8,
    maxOutputTokens = 1500,
  }) {
    if (!configured) {
      throw new AppError(
        'AI_NOT_CONFIGURED',
        'Layanan AI belum dikonfigurasi di server (GROQ_API_KEY belum diisi).',
        503
      );
    }

    try {
      const client = await getClient();
      const messages = [];

      const jsonRule =
        '\n\nFORMAT OUTPUT WAJIB: keluarkan hanya satu objek JSON valid tanpa teks pengantar, tanpa penjelasan tambahan di luar JSON, dan tanpa blok markdown ```json.';

      if (system) {
        messages.push({
          role: 'system',
          content: json ? `${system}${jsonRule}` : system,
        });
      } else if (json) {
        messages.push({
          role: 'system',
          content: jsonRule.trim(),
        });
      }

      for (const item of contents) {
        const role = item.role === 'model' ? 'assistant' : item.role;

        if (role !== 'user' && role !== 'assistant') continue;

        const content = Array.isArray(item.parts)
          ? item.parts.map((part) => part?.text || '').join('\n')
          : '';

        if (content.trim()) {
          messages.push({ role, content });
        }
      }

      if (!messages.length) {
        throw new AppError(
          'AI_BAD_REQUEST',
          'Pesan untuk AI kosong.',
          400
        );
      }

      const request = {
        model: config.model,
        messages,
        temperature,
        max_completion_tokens: maxOutputTokens,
      };

      const response = await client.chat.completions.create(request);

      const choice = response?.choices?.[0];
      const text = choice?.message?.content;

      if (typeof text !== 'string' || !text.trim()) {
        throw new AppError(
          'AI_EMPTY_RESPONSE',
          'AI tidak memberikan jawaban untuk permintaan ini.',
          502,
          { reason: choice?.finish_reason || 'unknown' }
        );
      }

      if (choice.finish_reason === 'length') {
        throw new AppError(
          'AI_BAD_OUTPUT',
          'Jawaban AI terpotong. Coba lagi.',
          502,
          { reason: choice.finish_reason }
        );
      }

      return {
        text: text.trim(),
      };
    } catch (err) {
      const mapped = mapGroqError(err);

      if (!(err instanceof AppError)) {
        console.error(
          `[groq] ${mapped.code} (${err?.name}: ${String(
            err?.message || ''
          ).slice(0, 160)})`
        );
      }

      throw mapped;
    }
  }

  return {
    isConfigured: configured,
    model: config.model,
    generate,
  };
}