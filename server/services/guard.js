import { AppError } from '../errors.js';

// Menghasilkan teks AI lalu memeriksanya dengan aturan deterministik (kode, bukan prompt).
//  - Jika ada pelanggaran: minta ulang sekali dengan peringatan.
//  - Jika masih melanggar: kembalikan jawaban aman TETAP (bukan karangan AI), ditandai source:'guard'.
//  - Kegagalan layanan AI (timeout, kunci tidak ada, dll.) dilempar apa adanya; tidak pernah dipalsukan.
export async function generateGuarded({ ai, build, check, safeReply, attempts = 2, log = () => {} }) {
  let warning = '';
  let lastViolations = [];
  for (let i = 0; i < attempts; i++) {
    const { text } = await ai.generate(build(warning));
    const violations = check(text);
    if (!violations.length) return { text, source: 'ai', guarded: i > 0 };
    lastViolations = violations;
    log(violations);
    warning = `\n\nPERINGATAN SISTEM: jawaban sebelumnya melanggar aturan (${violations.map((v) => v.label).join('; ')}). Tulis ulang tanpa hal tersebut.`;
  }
  return { text: safeReply(lastViolations), source: 'guard', guarded: true, blocked: lastViolations.map((v) => v.id) };
}

export function requireAi(ai) {
  if (!ai || !ai.isConfigured) {
    throw new AppError('AI_NOT_CONFIGURED', 'Layanan AI belum dikonfigurasi di server (GROQ_API_KEY belum diisi).', 503);
  }
}
