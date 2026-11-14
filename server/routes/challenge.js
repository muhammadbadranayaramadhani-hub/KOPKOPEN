import { AppError } from '../errors.js';
import {
  requireBody,
  cleanText,
  oneOf,
  boundedInt,
  parseJsonLoose,
  strField,
  listField,
  safeEval,
  approxEqual,
  numbersIn,
  LIMITS
} from '../services/validation.js';

import { requireAi } from '../services/guard.js';
import {
  nyxSystem,
  nyxSolverSystem,
  NYX_SCHEMA,
  NYX_SOLVER_SCHEMA
} from '../prompts/nyxPrompt.js';

import { OFFICIAL_BIG_NUMBERS } from '../data/case001.js';
import { sanitizeLearner, learnerLabels } from '../services/learner.js';
import { NUMERIC_SUBJECT_IDS, TOPIC_HINTS } from '../../src/data/curriculum.js';
import { randomUUID } from 'node:crypto';

export function validateChallenge(j, { type, fallbackTopic = 'Latihan Umum' }) {
  if (!j || typeof j !== 'object') {
    throw new AppError('AI_BAD_OUTPUT', 'Format JSON soal tidak valid.', 502);
  }

  const t = j.type ? oneOf(j.type, ['numeric', 'mc'], 'type') : type;

  if (t !== type) {
    throw new AppError('AI_BAD_OUTPUT', 'Jenis soal tidak sesuai permintaan.', 502);
  }

  const rawTopic =
    typeof j.topic === 'string' && j.topic.trim() ? j.topic.trim() : fallbackTopic;

  const out = {
    type: t,
    topic: strField(rawTopic, 'topic', { max: 80 }),
    question: strField(j.question, 'question', { max: 500, min: 15 }),
    explanation: strField(j.explanation || 'Lihat langkah penyelesaian pada rumus terkait.', 'explanation', { max: 600 }),
    hint: strField(j.hint || 'Perhatikan informasi yang diketahui pada soal.', 'hint', { max: 250 })
  };

  if (t === 'mc') {
    const options = listField(j.options, 'options', {
      min: 4,
      max: 4,
      itemMax: 160
    });

    if (new Set(options.map((o) => o.toLowerCase())).size !== 4) {
      throw new AppError('AI_BAD_OUTPUT', 'Opsi tidak unik.', 502);
    }

    const idx = typeof j.correctIndex === 'string' ? Number.parseInt(j.correctIndex, 10) : j.correctIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
      throw new AppError('AI_BAD_OUTPUT', 'correctIndex tidak valid.', 502);
    }

    out.options = options;
    out.correctIndex = idx;
  } else {
    const numAns = typeof j.answer === 'string' ? Number(j.answer.trim()) : j.answer;
    if (typeof numAns !== 'number' || !Number.isFinite(numAns)) {
      throw new AppError('AI_BAD_OUTPUT', 'answer bukan angka.', 502);
    }

    let v;

    try {
      v = safeEval(String(j.expression ?? numAns));
    } catch (e) {
      throw new AppError('AI_BAD_OUTPUT', `expression tidak valid (${e.message}).`, 502);
    }

    if (!approxEqual(v, numAns, 1e-6)) {
      throw new AppError('AI_BAD_OUTPUT', 'answer tidak sama dengan hasil expression.', 502);
    }

    out.answer = v;
    out.unit = typeof j.unit === 'string' ? j.unit.slice(0, 20) : '';
    out.expression = String(j.expression ?? numAns);
  }

  const text = [
    out.question,
    out.explanation,
    out.hint,
    ...(out.options || [])
  ].join(' ');

  if (numbersIn(text).some((n) => OFFICIAL_BIG_NUMBERS.includes(n))) {
    throw new AppError('AI_BAD_OUTPUT', 'Soal memakai angka resmi kasus.', 502);
  }

  if (/MYS-001|bukti\s+E\d|Pak Darmo|Sari\b/i.test(text)) {
    throw new AppError('AI_BAD_OUTPUT', 'Soal menyinggung kasus resmi.', 502);
  }

  return out;
}

export async function runGenerateChallenge(body, { ai }) {
  const b = requireBody(body);
  const learner = sanitizeLearner(b.learner);

  const { grade, subject, difficulty } = learnerLabels(learner);
  const numericOk = NUMERIC_SUBJECT_IDS.includes(learner.subject);

  const type = oneOf(
    b.type,
    ['numeric', 'mc'],
    'type',
    numericOk ? 'numeric' : 'mc'
  );

  if (type === 'numeric' && !numericOk) {
    throw new AppError(
      'INVALID_REQUEST',
      `Soal isian angka tidak tersedia untuk ${subject.label}.`,
      400
    );
  }

  const hints = TOPIC_HINTS[learner.subject] || [subject.label];

  const topic =
    typeof b.topic === 'string' && b.topic.trim()
      ? cleanText(b.topic, { field: 'Topik', max: LIMITS.topic })
      : hints[Math.floor(Math.random() * hints.length)];

  const avoid = Array.isArray(b.avoid)
    ? b.avoid
        .slice(-5)
        .filter((x) => typeof x === 'string')
        .map((x) => x.slice(0, 120))
    : [];

  requireAi(ai);

  let lastErr;

  for (let i = 0; i < 3; i++) {
    try {
      const { text } = await ai.generate({
        system: nyxSystem({
          subjectLabel: subject.label,
          gradeLabel: grade.label,
          fase: grade.fase,
          difficultyLabel: difficulty.label,
          difficultyDesc: difficulty.desc,
          topic: topic.replace(/[<>"]/g, ''),
          type,
          avoid,
          hots: learner.difficulty === 'hots',
          numericOk
        }),
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Buat satu soal sekarang.' }]
          }
        ],
        json: true,
        schema: NYX_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 1600
      });

      const ch = validateChallenge(parseJsonLoose(text), {
        type,
        fallbackTopic: topic
      });

      if (
        avoid.some(
          (a) =>
            a &&
            ch.question.toLowerCase().startsWith(a.toLowerCase().slice(0, 40))
        )
      ) {
        throw new AppError('AI_BAD_OUTPUT', 'Soal duplikat.', 502);
      }

      if (type === 'mc') {
        const s = await ai.generate({
          system: nyxSolverSystem(),
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Soal: ${ch.question}\n${ch.options
                    .map((o, k) => `${k}. ${o}`)
                    .join('\n')}`
                }
              ]
            }
          ],
          json: true,
          schema: NYX_SOLVER_SCHEMA,
          temperature: 0,
          maxOutputTokens: 300
        });

        if (parseJsonLoose(s.text).choiceIndex !== ch.correctIndex) {
          throw new AppError(
            'AI_BAD_OUTPUT',
            'Kunci jawaban tidak lolos verifikasi.',
            502
          );
        }
      }

      return {
        challenge: {
          id: `nyx-${randomUUID().slice(0, 8)}`,
          subject: learner.subject,
          grade: learner.grade,
          difficulty: learner.difficulty,
          ...ch
        },
        source: 'ai',
        verified: true
      };
    } catch (e) {
      lastErr = e;

      if (!(e instanceof AppError) || !['AI_BAD_OUTPUT'].includes(e.code)) {
        throw e;
      }
    }
  }

  throw new AppError(
    'AI_BAD_OUTPUT',
    `Soal baru belum lolos pemeriksaan. Coba lagi. (${lastErr && lastErr.message})`,
    502
  );
}