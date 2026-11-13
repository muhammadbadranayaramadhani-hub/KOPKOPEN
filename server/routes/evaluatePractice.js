import { invalid, AppError } from '../errors.js';
import { requireBody, oneOf, cleanText, escapeForPrompt, parseJsonLoose, scoreField, listField, strField, safeEval, approxEqual, isPlainObject, LIMITS } from '../services/validation.js';
import { requireAi } from '../services/guard.js';
import { sanitizeLearner, learnerContext } from '../services/learner.js';
import { astraPracticeSystem, ASTRA_PRACTICE_SCHEMA } from '../prompts/astraPrompt.js';
import { parseNumberAlternatives, matchesNumericAnswer } from '../../src/engines/PuzzleEngine.js';

// ASTRA untuk latihan NYX. Benar/salah ditentukan kode; AI menilai alasan dengan rubrik.
// Catatan: soal dikirim klien (latihan tidak memengaruhi progres kasus), jadi kunci dihitung ulang dari ekspresi bila ada.
export async function runEvaluatePractice(b, { ai }) {
  const learner = sanitizeLearner(b.learner);
  const c = b.challenge;
  if (!isPlainObject(c)) throw invalid('challenge wajib dikirim.');
  const type = oneOf(c.type, ['mc', 'numeric'], 'challenge.type');
  const question = strField(c.question, 'challenge.question', { max: 600, min: 10 });
  const explanation = strField(c.explanation, 'challenge.explanation', { max: 800 });
  const topic = typeof c.topic === 'string' ? c.topic.slice(0, 80) : '';
  const explanationStudent = cleanText(b.studentExplanation ?? '', { field: 'Penjelasan', max: LIMITS.reasoning, allowEmpty: true });
  let correct;
  let keyText;
  let answerText;
  let optionsText = '';
  if (type === 'mc') {
    const options = listField(c.options, 'challenge.options', { min: 4, max: 4, itemMax: 200 });
    if (!Number.isInteger(c.correctIndex) || c.correctIndex < 0 || c.correctIndex > 3) throw invalid('challenge.correctIndex tidak valid.');
    const idx = Number(b.studentAnswer);
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) throw invalid('Jawaban pilihan ganda tidak valid.');
    correct = idx === c.correctIndex;
    keyText = options[c.correctIndex];
    answerText = options[idx];
    optionsText = options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n');
  } else {
    let key = c.answer;
    if (typeof c.expression === 'string' && c.expression) {
      try { key = safeEval(c.expression); } catch { throw invalid('challenge.expression tidak valid.'); }
      if (typeof c.answer === 'number' && !approxEqual(key, c.answer, 1e-6)) throw invalid('Kunci jawaban tidak konsisten.');
    }
    if (typeof key !== 'number' || !Number.isFinite(key)) throw invalid('Kunci jawaban numerik tidak valid.');
    if (!parseNumberAlternatives(String(b.studentAnswer ?? '')).length) throw invalid('Jawaban harus berupa angka.');
    correct = matchesNumericAnswer(String(b.studentAnswer ?? ''), key);
    keyText = String(key) + (c.unit ? ` ${String(c.unit).slice(0, 20)}` : '');
    answerText = String(b.studentAnswer).slice(0, 40);
  }
  requireAi(ai);

  const context = [
    learnerContext(learner),
    `=== SOAL LATIHAN ===\nTopik: ${topic || '-'}\nTipe: ${type}\n${question}${optionsText ? `\n${optionsText}` : ''}`,
    `=== KUNCI (dari sistem) ===\nJawaban benar: ${keyText}\nPembahasan: ${explanation}`,
    `=== JAWABAN SISWA ===\nJawaban: ${escapeForPrompt(answerText)}\nPenilaian sistem (kode): ${correct ? 'BENAR' : 'SALAH'}\n<student_explanation>${escapeForPrompt(explanationStudent) || '(siswa tidak menulis alasan)'}</student_explanation>`,
  ].join('\n\n');

  let lastErr;
  for (let i = 0; i < 2; i++) {
    const { text } = await ai.generate({
      system: astraPracticeSystem({ context, hots: learner.difficulty === 'hots' }),
      contents: [{ role: 'user', parts: [{ text: 'Nilai jawaban dan penjelasan siswa sekarang.' }] }],
      json: true, schema: ASTRA_PRACTICE_SCHEMA, temperature: 0.3, maxOutputTokens: 700,
    });
    try {
      const j = parseJsonLoose(text);
      return {
        correct,
        reasoningScore: scoreField(j.reasoningScore, 'reasoningScore'),
        conceptScore: scoreField(j.conceptScore, 'conceptScore'),
        misconceptions: listField(j.misconceptions, 'misconceptions', { min: 0, max: 3 }),
        whyCorrectOrNot: strField(j.whyCorrectOrNot, 'whyCorrectOrNot', { max: 600 }),
        feedback: strField(j.feedback, 'feedback', { max: 500 }),
        nextStep: strField(j.nextStep, 'nextStep', { max: 250 }),
        hadExplanation: Boolean(explanationStudent),
        source: 'ai',
      };
    } catch (e) { lastErr = e; }
  }
  throw new AppError('AI_BAD_OUTPUT', `Evaluasi AI tidak valid (${lastErr && lastErr.message}). Coba lagi.`, 502);
}
