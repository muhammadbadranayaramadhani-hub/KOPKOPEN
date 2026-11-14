import { invalid } from '../errors.js';
import { requireBody, cleanText, boundedInt, oneOf, sanitizeHistory, toContents, classifyMessage, escapeForPrompt } from '../services/validation.js';
import { sanitizeProgress, companionContext, checkSpoilers } from '../services/contextManager.js';
import { generateGuarded, requireAi } from '../services/guard.js';
import { sanitizeLearner, learnerContext } from '../services/learner.js';
import { renntzySystem } from '../prompts/renntzyPrompt.js';
import { CASE_DEF, EVIDENCE } from '../data/case001.js';
import { currentObjective } from '../../src/engines/InvestigationEngine.js';
import { toGameState } from '../services/contextManager.js';

const MODES = ['chat', 'hint', 'explain-evidence', 'review'];
const DEFAULT_MSG = {
  hint: 'Bisakah kamu memberi petunjuk untuk langkah selanjutnya?',
  review: 'Tolong bantu aku meninjau apa yang sudah kutemukan sejauh ini.',
  'explain-evidence': 'Tolong jelaskan bukti ini.',
};

export async function runCompanion(body, { ai }) {
  const b = requireBody(body);
  const mode = oneOf(b.mode, MODES, 'mode', 'chat');
  const progress = sanitizeProgress(b.progress);
  const learner = sanitizeLearner(b.learner);
  const hintLevel = boundedInt(b.hintLevel, { min: 0, max: 3, fallback: mode === 'hint' ? 1 : 0, field: 'hintLevel' });
  const history = sanitizeHistory(b.history);
  const raw = b.message === undefined || b.message === null || b.message === '' ? DEFAULT_MSG[mode] : b.message;
  if (!raw) throw invalid('Pesan wajib diisi.');
  const message = cleanText(raw, { field: 'Pesan' });
  const focus = typeof b.evidenceId === 'string' && EVIDENCE[b.evidenceId] ? b.evidenceId : null;
  if (mode === 'explain-evidence' && (!focus || !progress.collected.includes(focus))) {
    throw invalid('Bukti yang dijelaskan harus sudah kamu temukan.');
  }
  requireAi(ai);

  const flags = classifyMessage(message);
  const context = `${learnerContext(learner)}\n\n${companionContext(progress, { hintLevel, focusEvidence: focus })}`;
  const obj = currentObjective(CASE_DEF, toGameState(progress));
  const safeReply = () => `Aku tidak bisa memberi jawaban langsung, tapi aku bisa membimbingmu. ${obj ? `Tujuanmu sekarang: ${obj.text} (${obj.where}).` : 'Coba tinjau lagi bukti yang sudah kamu kumpulkan.'} Apa yang menurutmu paling mencolok dari bukti yang ada?`;

  const out = await generateGuarded({
    ai,
    build: (warning) => ({
      system: renntzySystem({ context, hintLevel, mode, injection: flags.injection, spoilerRequest: flags.spoilerRequest, extra: warning }),
      contents: toContents(history, message),
      temperature: 0.6,
      maxOutputTokens: 400,
    }),
    check: (t) => checkSpoilers(t, progress),
    safeReply,
  });
  return { reply: out.text, hintLevel, source: out.source, guarded: out.guarded, flagged: flags.injection || flags.spoilerRequest };
}
