// PuzzleEngine — evaluasi tantangan pengetahuan (mc, numeric, multi, classify).

// Menerima "1.560", "1560 liter", "360 L", "1,5" -> angka.
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return NaN;
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/liter|litre|l\b/g, '').replace(/\s+/g, '');
  if (!s) return NaN;
  // Titik dipakai sebagai pemisah ribuan (gaya Indonesia): 1.560 -> 1560.
  // Angka berawalan 0 (0.125) pasti desimal, bukan ribuan.
  if (/^[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

// Semua pembacaan yang masuk akal dari ketikan pemain: "1.500" bisa berarti 1500 (ribuan) atau 1,5 (desimal).
export function parseNumberAlternatives(raw) {
  const out = [];
  const primary = parseNumber(raw);
  if (!Number.isNaN(primary)) out.push(primary);
  const s = String(raw ?? '').trim().toLowerCase().replace(/liter|litre|l\b/g, '').replace(/\s+/g, '').replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(s) && !out.includes(Number(s))) out.push(Number(s));
  return out;
}

// Selisih relatif kecil dianggap benar (mis. 0.3333 untuk 1/3), dengan batas bawah mutlak 1e-6.
export function isCloseEnough(value, key, rel = 1e-3) {
  return Number.isFinite(value) && Number.isFinite(key) && Math.abs(value - key) <= Math.max(1e-6, Math.abs(key) * rel);
}

export function matchesNumericAnswer(raw, key, rel = 1e-3) {
  return parseNumberAlternatives(raw).some((n) => isCloseEnough(n, key, rel));
}

const ok = (message = '') => ({ correct: true, message });
const no = (message) => ({ correct: false, message });

export function evaluateStep(step, answer) {
  switch (step.type) {
    case 'numeric': {
      const n = parseNumber(answer);
      if (Number.isNaN(n)) return no('Tulis jawabanmu dalam bentuk angka, misalnya 250.');
      const tol = step.tolerance || 0;
      if (Math.abs(n - step.answer) <= tol) return ok();
      const specific = step.wrong && step.wrong[String(n)];
      return no(specific || step.wrongDefault || 'Belum tepat. Coba periksa lagi.');
    }
    case 'mc': {
      const opt = step.options.find((o) => o.id === answer);
      if (!opt) return no('Pilih salah satu jawaban dulu.');
      return opt.correct ? ok() : no(opt.why || 'Belum tepat. Coba pikirkan lagi.');
    }
    case 'multi': {
      const chosen = Array.isArray(answer) ? answer : [];
      if (!chosen.length) return no('Pilih setidaknya satu jawaban.');
      const wrongChosen = step.options.filter((o) => chosen.includes(o.id) && !o.correct);
      const missing = step.options.filter((o) => !chosen.includes(o.id) && o.correct);
      if (!wrongChosen.length && !missing.length) return ok();
      const parts = [];
      wrongChosen.slice(0, 2).forEach((o) => parts.push(o.why));
      if (wrongChosen.length > 2) parts.push(`Masih ada ${wrongChosen.length - 2} pilihan lain yang kurang tepat.`);
      if (missing.length) parts.push('Masih ada pilihan benar yang belum kamu pilih.');
      return no(parts.join(' '));
    }
    case 'classify': {
      const map = answer || {};
      if (step.items.some((it) => !map[it.id])) return no('Kelompokkan semua pernyataan lebih dulu.');
      const bad = step.items.filter((it) => map[it.id] !== it.answer);
      if (!bad.length) return ok();
      const nums = bad.map((b) => step.items.indexOf(b) + 1);
      return {
        correct: false,
        message: `Pernyataan nomor ${nums.join(', ')} belum tepat. ${bad[0].nudge || ''}`.trim(),
        wrongIds: bad.map((b) => b.id),
      };
    }
    default:
      return no('Jenis soal tidak dikenal.');
  }
}

// Jawaban yang ditampilkan jika pemain meminta bantuan penuh.
export function revealAnswerText(step) {
  switch (step.type) {
    case 'numeric':
      return `Jawabannya: ${step.answer}${step.unit ? ' ' + step.unit : ''}.`;
    case 'mc':
      return `Jawabannya: ${step.options.find((o) => o.correct).text}`;
    case 'multi':
      return `Jawabannya: ${step.options.filter((o) => o.correct).map((o) => o.text).join('; ')}.`;
    case 'classify': {
      const cat = (id) => step.categories.find((c) => c.id === id).label;
      return step.items.map((it, i) => `${i + 1}. ${cat(it.answer)}`).join(' | ');
    }
    default:
      return '';
  }
}

// Poin pengetahuan untuk satu langkah.
export function stepPoints({ wrong = 0, hints = 0, revealed = false }) {
  if (revealed) return 2;
  return Math.max(4, 10 - 2 * wrong - 2 * hints);
}

export function emptyStepState() {
  return { wrong: 0, hints: 0, solved: false, revealed: false, points: 0 };
}

export function emptyChallengeState(challenge) {
  return { step: 0, done: false, steps: challenge.steps.map(emptyStepState) };
}

export function getChallenge(caseDef, id) {
  return caseDef.challenges.find((c) => c.id === id) || null;
}

// Mutasi murni: mengembalikan state kasus baru.
export function recordStepResult(cs, challenge, stepIdx, { correct, revealed = false }) {
  const prev = cs.challenges[challenge.id] || emptyChallengeState(challenge);
  const steps = prev.steps.map((s) => ({ ...s }));
  const st = steps[stepIdx];
  let mistakes = cs.stats ? cs.stats.mistakes : 0;
  if (revealed) {
    st.solved = true;
    st.revealed = true;
    st.points = stepPoints(st);
  } else if (correct) {
    st.solved = true;
    st.points = stepPoints(st);
  } else {
    st.wrong += 1;
    mistakes += 1;
  }
  const allDone = steps.every((s) => s.solved);
  const nextStep = st.solved && !allDone ? Math.min(stepIdx + 1, steps.length - 1) : prev.step;
  return {
    ...cs,
    stats: { ...(cs.stats || {}), mistakes, hints: cs.stats ? cs.stats.hints : 0 },
    challenges: {
      ...cs.challenges,
      [challenge.id]: { step: allDone ? stepIdx : nextStep, done: allDone, steps },
    },
  };
}

export function recordHint(cs, challenge, stepIdx) {
  const prev = cs.challenges[challenge.id] || emptyChallengeState(challenge);
  const step = challenge.steps[stepIdx];
  const steps = prev.steps.map((s) => ({ ...s }));
  if (steps[stepIdx].hints >= step.hints.length) return cs;
  steps[stepIdx].hints += 1;
  return {
    ...cs,
    stats: { ...(cs.stats || {}), mistakes: cs.stats ? cs.stats.mistakes : 0, hints: (cs.stats ? cs.stats.hints : 0) + 1 },
    challenges: { ...cs.challenges, [challenge.id]: { ...prev, steps } },
  };
}
