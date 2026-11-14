// EvidenceEngine — pengumpulan bukti, uji hubungan di papan, dan evaluasi kesimpulan.

export function hasEvidence(cs, id) {
  return cs.collected.includes(id);
}

export function collectEvidence(cs, id) {
  if (cs.collected.includes(id)) return cs;
  return { ...cs, collected: [...cs.collected, id] };
}

// ---------- Papan bukti ----------

const GENERIC = {
  statements: [
    {
      id: 'g1',
      text: 'Kedua bukti saling menjelaskan angka yang sama.',
      correct: false,
      why: 'Setelah dicermati, angka pada kedua bukti ini tidak saling menjelaskan.',
    },
    {
      id: 'g2',
      text: 'Kedua bukti menunjukkan sebab dan akibat yang sama.',
      correct: false,
      why: 'Belum ada sebab dan akibat yang bisa dibuktikan dari kedua bukti ini saja.',
    },
    {
      id: 'g3',
      text: 'Tidak ada hubungan langsung yang bisa dibuktikan dari kedua bukti ini.',
      correct: true,
      why: '',
    },
  ],
  reasons: [
    {
      id: 'gr1',
      text: 'Karena keduanya ditemukan pada hari yang sama.',
      correct: false,
      why: 'Hari yang sama bukan bukti hubungan.',
    },
    {
      id: 'gr2',
      text: 'Karena isi kedua bukti membahas hal yang berbeda dan tidak ada angka yang saling cocok.',
      correct: true,
      why: '',
    },
  ],
  insight: 'Tidak semua bukti saling berhubungan. Mengenali bukti yang tidak terkait juga bagian dari penalaran.',
};

export function pairKey(a, b) {
  return [a, b].sort().join('|');
}

export function findConnection(caseDef, a, b) {
  const key = pairKey(a, b);
  const def = caseDef.connections.find((c) => pairKey(c.pair[0], c.pair[1]) === key);
  return def || null;
}

// Mengembalikan definisi uji untuk sepasang bukti (nyata atau generik).
export function getPairTest(caseDef, a, b) {
  const def = findConnection(caseDef, a, b);
  if (def) return { ...def, generic: false };
  return { id: `G-${pairKey(a, b)}`, pair: [a, b], key: false, generic: true, ...GENERIC };
}

export function isConnectionDone(cs, connId) {
  return !!(cs.connections[connId] && cs.connections[connId].done);
}

export function keyConnectionsDone(caseDef, cs) {
  return caseDef.connections.filter((c) => c.key && isConnectionDone(cs, c.id)).length;
}

export function checkConnection(test, statementId, reasonId) {
  const st = test.statements.find((s) => s.id === statementId);
  const re = test.reasons.find((r) => r.id === reasonId);
  if (!st || !re) {
    return { success: false, incomplete: true, message: 'Pilih hubungan dan alasanmu terlebih dahulu.' };
  }
  const messages = [];
  if (!st.correct) messages.push(`Hubungan: ${st.why}`);
  if (!re.correct) messages.push(`Alasan: ${re.why}`);
  if (st.correct && re.correct) {
    return { success: true, message: test.insight, statementOk: true, reasonOk: true };
  }
  if (st.correct && !re.correct) {
    messages.unshift('Hubungannya sudah tepat, tetapi alasanmu belum didukung bukti.');
  }
  return { success: false, message: messages.join(' '), statementOk: st.correct, reasonOk: re.correct };
}

// Menyimpan hasil uji. Pasangan generik tidak disimpan sebagai hubungan.
export function recordConnectionAttempt(cs, test, success) {
  if (test.generic) {
    return success ? cs : { ...cs, stats: bumpMistake(cs) };
  }
  const prev = cs.connections[test.id] || { attempts: 0, done: false };
  if (prev.done) return cs;
  return {
    ...cs,
    stats: success ? cs.stats : bumpMistake(cs),
    boardMistakes: (cs.boardMistakes || 0) + (success ? 0 : 1),
    connections: {
      ...cs.connections,
      [test.id]: { attempts: prev.attempts + 1, done: success },
    },
  };
}

function bumpMistake(cs) {
  const s = cs.stats || { mistakes: 0, hints: 0 };
  return { ...s, mistakes: s.mistakes + 1 };
}

// ---------- Kesimpulan akhir ----------

// answer: { optionId, evidence: [ids], increase, sessions, perSession, reasoning }
export function evaluateConclusion(caseDef, answer) {
  const r = caseDef.resolution;
  const opt = r.options.find((o) => o.id === answer.optionId);
  if (!opt) return { ok: false, stage: 'cause', message: 'Pilih penjelasan yang menurutmu paling masuk akal.' };
  if (!opt.correct) {
    return {
      ok: false,
      stage: 'cause',
      message: `Kesimpulan ini belum didukung bukti. ${opt.why}`,
    };
  }
  const chosen = answer.evidence || [];
  const missingCore = r.requiredEvidence.filter((id) => !chosen.includes(id));
  if (missingCore.length) {
    const codes = missingCore.map((id) => caseDef.evidence[id].code).join(', ');
    return {
      ok: false,
      stage: 'evidence',
      message: `Penjelasanmu tepat, tetapi buktimu belum cukup. Pilih bukti yang menghubungkan kenaikan pemakaian air dengan penyebabnya (belum ada: ${codes}).`,
    };
  }
  if (chosen.length < 3) {
    return {
      ok: false,
      stage: 'evidence',
      message: 'Penjelasan yang kuat juga menyingkirkan dugaan lain. Tambahkan setidaknya satu bukti lagi.',
    };
  }
  const nf = r.numberFill;
  const bad = [];
  if (parseFloatSafe(answer.increase) !== nf.increase) bad.push('kenaikan pemakaian air');
  if (parseFloatSafe(answer.sessions) !== nf.sessions) bad.push('jumlah sesi tambahan');
  if (parseFloatSafe(answer.perSession) !== nf.perSession) bad.push('air per sesi');
  if (bad.length) {
    return {
      ok: false,
      stage: 'numbers',
      message: `Hubungan angkanya belum tepat: periksa ${bad.join(', ')}. Cek lagi BKT-01 dan BKT-03.`,
    };
  }
  if (String(answer.reasoning || '').trim().length < r.minReasonLength) {
    return {
      ok: false,
      stage: 'reasoning',
      message: `Tuliskan alasanmu dengan kalimatmu sendiri (minimal ${r.minReasonLength} karakter).`,
    };
  }
  const checks = r.reasoningChecks.map((c) => ({
    id: c.id,
    label: c.label,
    hit: c.pattern.test(answer.reasoning),
  }));
  return { ok: true, stage: 'done', message: '', checks };
}

function parseFloatSafe(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(/\./g, '').replace(',', '.');
  return Number(s);
}
