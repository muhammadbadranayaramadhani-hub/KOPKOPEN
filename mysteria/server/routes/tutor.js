import { invalid } from '../errors.js';
import { requireBody, cleanText, boundedInt, oneOf, sanitizeHistory, toContents, classifyMessage, numbersIn, safeEval, approxEqual, parseJsonLoose, strField, listField, LIMITS, isPlainObject } from '../services/validation.js';
import { sanitizeProgress, tutorContext, checkSpoilers } from '../services/contextManager.js';
import { generateGuarded, requireAi } from '../services/guard.js';
import { sanitizeLearner, learnerContext, learnerLabels } from '../services/learner.js';
import { NUMERIC_SUBJECT_IDS } from '../../src/data/curriculum.js';
import { nopalSystem, NOPAL_PRACTICE_SCHEMA } from '../prompts/nopalPrompt.js';
import { CHALLENGES, CHALLENGE_IDS, OFFICIAL_BIG_NUMBERS } from '../data/case001.js';
import { evaluateStep, parseNumber } from '../../src/engines/PuzzleEngine.js';

const MODES = ['ask', 'explain', 'analyze-answer', 'practice'];

// Ubah jawaban siswa (apa pun jenis soalnya) menjadi teks singkat yang aman untuk prompt.
function answerText(step, answer) {
  if (answer === undefined || answer === null) return '';
  try {
    if (step.type === 'numeric') return String(answer).slice(0, 40);
    if (step.type === 'mc') return (step.options.find((o) => o.id === answer) || {}).text || '';
    if (step.type === 'multi') return (Array.isArray(answer) ? answer : []).map((id) => (step.options.find((o) => o.id === id) || {}).text).filter(Boolean).join('; ').slice(0, 300);
    if (step.type === 'classify' && isPlainObject(answer)) {
      return step.items.map((it, i) => `${i + 1}: ${typeof answer[it.id] === 'string' ? answer[it.id].slice(0, 20) : '-'}`).join(', ');
    }
  } catch { /* abaikan */ }
  return '';
}

// Apakah teks membocorkan jawaban akhir langkah ini?
function leaksAnswer(text, step) {
  if (step.type === 'numeric') return numbersIn(text).some((n) => Math.abs(n - step.answer) < 1e-9);
  if (step.type === 'mc') {
    const c = step.options.find((o) => o.correct);
    const key = c && c.text.toLowerCase().slice(0, 28);
    return Boolean(key && text.toLowerCase().includes(key));
  }
  return false;
}

export async function runTutor(body, { ai }) {
  const b = requireBody(body);
  const mode = oneOf(b.mode, MODES, 'mode', 'ask');
  const challengeId = oneOf(b.challengeId, CHALLENGE_IDS, 'challengeId');
  const challenge = CHALLENGES[challengeId];
  const stepId = typeof b.stepId === 'string' ? b.stepId : challenge.steps[0].id;
  const step = challenge.steps.find((s) => s.id === stepId);
  if (!step) throw invalid('stepId tidak dikenal untuk tantangan ini.');
  const progress = sanitizeProgress(b.progress, { required: false });
  const learner = sanitizeLearner(b.learner);
  const hintsUsed = boundedInt(b.hintsUsed, { min: 0, max: 10, fallback: 0, field: 'hintsUsed' });
  const history = sanitizeHistory(b.history);
  const message = cleanText(b.message ?? '', { field: 'Pertanyaan', allowEmpty: mode !== 'ask' })
    || { explain: 'Tolong jelaskan konsep untuk soal ini.', 'analyze-answer': 'Tolong periksa jawabanku.', practice: 'Beri aku soal latihan serupa.' }[mode];
  requireAi(ai);

  // Penilaian jawaban SELALU dilakukan kode, bukan AI.
  const hasAnswer = mode === 'analyze-answer' && b.answer !== undefined && b.answer !== null && b.answer !== '';
  if (mode === 'analyze-answer' && !hasAnswer) throw invalid('Jawaban siswa wajib dikirim untuk dianalisis.');
  const verdict = hasAnswer ? evaluateStep(step, b.answer) : { correct: false, message: '' };
  const canReveal = hintsUsed >= (step.hints ? step.hints.length : 3);
  const flags = classifyMessage(message);
  const subject = learnerLabels(learner).subject.label;
  const context = `${learnerContext(learner)}\n\n${tutorContext({ challenge, step, verdict, studentAnswerText: hasAnswer ? answerText(step, b.answer) : '', canReveal })}`;
  const allowFinal = verdict.correct || canReveal;

  if (mode === 'practice') return runPractice({ ai, subject, numeric: NUMERIC_SUBJECT_IDS.includes(learner.subject), context, message });

  const out = await generateGuarded({
    ai,
    build: (warning) => ({
      system: nopalSystem({ context, mode, subject, injection: flags.injection, extra: warning }),
      contents: toContents(history, message, { tag: 'student_message' }),
      temperature: 0.5,
      maxOutputTokens: 500,
    }),
    check: (t) => [
      ...(allowFinal ? [] : leaksAnswer(t, step) ? [{ id: 'final-answer', label: 'menyebut jawaban akhir soal' }] : []),
      ...checkSpoilers(t, progress, { skip: ['watering-terms', 'liters-per-session', 'increase-value', 'sessions-math'] }),
    ],
    safeReply: () => {
      const h = step.hints && step.hints[Math.min(hintsUsed, step.hints.length - 1)];
      return `Aku belum bisa menyebut jawabannya langsung. ${(typeof h === 'string' ? h : h && h.text) || 'Coba baca ulang soalnya, lalu tulis apa yang diketahui dan yang ditanyakan.'}`;
    },
  });
  return { reply: out.text, mode, correct: hasAnswer ? verdict.correct : null, source: out.source, guarded: out.guarded };
}

// Latihan baru: soal dibuat AI, tetapi jawabannya diverifikasi ulang oleh kode (safeEval).
async function runPractice({ ai, subject, numeric, context, message }) {
  if (!numeric) {
    const out = await generateGuarded({
      ai,
      build: (w) => ({ system: nopalSystem({ context, mode: 'practice', subject, extra: w }), contents: toContents([], message, { tag: 'student_message' }), temperature: 0.7, maxOutputTokens: 500 }),
      check: () => [],
      safeReply: () => 'Coba buat contoh sendiri dari konsep tadi.',
    });
    return { reply: out.text, mode: 'practice', source: out.source, guarded: out.guarded };
  }
  let lastErr;
  for (let i = 0; i < 2; i++) {
    const { text } = await ai.generate({
      system: nopalSystem({ context, mode: 'practice', subject, extra: '\nKeluarkan HANYA JSON: problem, expression (aritmetika murni), answer, steps. Jangan memakai angka 1.200, 1.560, 360, 180, atau 420.' }),
      contents: toContents([], message, { tag: 'student_message' }),
      json: true, schema: NOPAL_PRACTICE_SCHEMA, temperature: 0.8, maxOutputTokens: 600,
    });
    try {
      const j = parseJsonLoose(text);
      const problem = strField(j.problem, 'problem', { max: 400 });
      const steps = listField(j.steps, 'steps', { min: 1, max: 5, itemMax: 220 });
      const value = safeEval(j.expression);
      if (typeof j.answer !== 'number' || !approxEqual(value, j.answer)) throw new Error('jawaban tidak cocok dengan ekspresi');
      const all = [problem, ...steps].join(' ');
      if (numbersIn(all).some((n) => OFFICIAL_BIG_NUMBERS.includes(n))) throw new Error('memakai angka resmi kasus');
      return { reply: `${problem}\n\nLangkah penyelesaian:\n${steps.map((s, k) => `${k + 1}. ${s}`).join('\n')}\n\nJawaban: ${value}`, mode: 'practice', practice: { problem, answer: value }, source: 'ai', guarded: i > 0 };
    } catch (e) { lastErr = e; }
  }
  const { AppError } = await import('../errors.js');
  throw new AppError('AI_BAD_OUTPUT', `Soal latihan tidak lolos verifikasi (${lastErr && lastErr.message}).`, 502);
}
