import { AppError } from '../errors.js';
import { requireBody, cleanText, sanitizeHistory, toContents, classifyMessage, oneOf } from '../services/validation.js';
import { sanitizeProgress, characterContext, checkSpoilers, checkCharacterNumbers } from '../services/contextManager.js';
import { generateGuarded, requireAi } from '../services/guard.js';
import { sanitizeLearner, learnerContext } from '../services/learner.js';
import { reiSystem } from '../prompts/reiPrompt.js';
import { REI_CHARACTERS, REI_CHARACTER_IDS, isCharacterAvailable } from '../data/characters.js';

export async function runInterrogate(body, { ai }) {
  const b = requireBody(body);
  const id = oneOf(b.characterId, REI_CHARACTER_IDS, 'characterId');
  const ch = REI_CHARACTERS[id];
  const progress = sanitizeProgress(b.progress);
  const learner = sanitizeLearner(b.learner);
  if (!isCharacterAvailable(ch, progress)) throw new AppError('CHARACTER_LOCKED', `${ch.name} belum bisa diwawancarai. Temukan buktinya dulu.`, 403);
  const message = cleanText(b.message, { field: 'Pertanyaan' });
  const history = sanitizeHistory(b.history);
  requireAi(ai);

  const flags = classifyMessage(message);
  const context = `${characterContext(ch)}\n\n${learnerContext(learner)}\nPemain adalah siswa SMA; bicaralah wajar sesuai karaktermu dan jangan menggurui.`;
  const fallbackLine = ch.fallback[Math.abs(message.length) % ch.fallback.length];
  const out = await generateGuarded({
    ai,
    build: (warning) => ({
      system: reiSystem({ character: ch, context, injection: flags.injection, extra: warning }),
      contents: toContents(history, message, { tag: 'player_message' }),
      temperature: 0.7,
      maxOutputTokens: 250,
    }),
    check: (t) => [
      ...checkCharacterNumbers(t, ch, progress),
      // Angka yang memang pengetahuan karakter dikecualikan; sisanya (penyiraman terselubung, kesimpulan) tetap dijaga.
      ...checkSpoilers(t, progress, { skip: ['increase-value', 'liters-per-session'] }).filter((v) => !(ch.id === 'sari' && v.id === 'watering-terms')),
      ...(/\b(sebagai|saya adalah)\s+(ai|model bahasa|asisten)/i.test(t) ? [{ id: 'out-of-character', label: 'keluar dari karakter' }] : []),
    ],
    safeReply: () => fallbackLine,
  });
  return { reply: out.text, character: { id: ch.id, name: ch.name }, source: out.source, guarded: out.guarded, flagged: flags.injection || flags.spoilerRequest };
}
