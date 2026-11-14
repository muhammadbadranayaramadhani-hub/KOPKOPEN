import {
  CASE_DEF, EVIDENCE, EVIDENCE_IDS, CORE_EVIDENCE, CHALLENGE_IDS, CHALLENGES, CONNECTIONS, CONNECTION_IDS,
  KEY_CONNECTION_IDS, LOCATION_IDS, TUTOR_NOTES, evidenceLocationName, caseBrief,
} from '../data/case001.js';
import { currentObjective, readyForResolution } from '../../src/engines/InvestigationEngine.js';
import { escapeForPrompt, idList, isPlainObject, numbersIn } from './validation.js';
import { invalid } from '../errors.js';

// Pengelola konteks terpusat. Prinsip:
//  * Hanya ID yang dikenal yang diterima dari klien; isi bukti selalu diambil dari data server.
//  * Setiap identitas hanya menerima konteks yang diperlukan (bukti yang SUDAH ditemukan pemain).
//  * Solusi resmi (SOLUTION) tidak pernah masuk ke konteks RENNTZY / REI / NOPAL.

// ---------- Progres pemain ----------
export function sanitizeProgress(raw, { required = true } = {}) {
  if (raw === undefined || raw === null) {
    if (required) throw invalid('Data progres penyelidikan wajib dikirim.');
    raw = {};
  }
  if (!isPlainObject(raw)) throw invalid('Data progres tidak valid.');
  const collected = idList(raw.collected, EVIDENCE_IDS, 'collected');
  const solved = idList(raw.solved, CHALLENGE_IDS, 'solved');
  const connections = idList(raw.connections, CONNECTION_IDS, 'connections');
  const location = LOCATION_IDS.includes(raw.location) ? raw.location : null;
  const hypothesis = ['leak', 'usage', 'data'].includes(raw.hypothesis) ? raw.hypothesis : null;
  // Klaim "kasus selesai" hanya diterima bila konsisten dengan aturan permainan.
  const consistent =
    CORE_EVIDENCE.every((id) => collected.includes(id)) &&
    CHALLENGE_IDS.every((id) => solved.includes(id)) &&
    KEY_CONNECTION_IDS.every((id) => connections.includes(id));
  return { location, collected, solved, connections, hypothesis, caseSolved: raw.caseSolved === true && consistent };
}

export function toGameState(p) {
  return {
    collected: [...p.collected],
    inspected: [],
    challenges: Object.fromEntries(p.solved.map((id) => [id, { done: true, steps: [] }])),
    connections: Object.fromEntries(p.connections.map((id) => [id, { done: true }])),
    final: { solved: p.caseSolved },
    boardMistakes: 0,
  };
}

// ---------- Teks bukti ----------
export function describeEvidence(id) {
  const e = EVIDENCE[id];
  const lines = [`[${e.code}] ${e.title} (sumber: ${e.source})`, `Deskripsi: ${e.description}`];
  if (e.data) lines.push(...e.data.map((d) => `- ${d.label}: ${d.value}`));
  if (e.table) {
    lines.push(`Tabel: ${e.table.headers.join(' | ')}`);
    e.table.rows.forEach((r) => lines.push(`  ${r.join(' | ')}`));
  }
  if (e.quote) lines.push(`Kutipan: "${e.quote}"`);
  if (e.note) lines.push(`Catatan: ${e.note}`);
  return lines.join('\n');
}

const HYPOTHESIS_LABEL = { leak: 'ada pipa bocor', usage: 'ada kegiatan yang memakai banyak air', data: 'belum menduga, ingin melihat data dulu' };

// ---------- Konteks RENNTZY ----------
export function companionContext(progress, { hintLevel = 0, focusEvidence = null } = {}) {
  const state = toGameState(progress);
  const loc = progress.location ? CASE_DEF.locations[progress.location].name : 'belum diketahui';
  const parts = [`=== KONTEKS KASUS ===\n${caseBrief()}\nLokasi pemain sekarang: ${loc}.`];

  parts.push('=== BUKTI YANG SUDAH DITEMUKAN PEMAIN (satu-satunya bukti yang boleh dibahas) ===');
  if (!progress.collected.length) parts.push('(belum ada bukti)');
  for (const id of progress.collected) parts.push(describeEvidence(id));

  if (focusEvidence && progress.collected.includes(focusEvidence)) {
    parts.push(`=== BUKTI YANG DIMINTA DIJELASKAN ===\n${EVIDENCE[focusEvidence].code}`);
  }

  const done = progress.connections.filter((id) => CONNECTIONS[id]);
  if (done.length) {
    parts.push('=== HUBUNGAN ANTAR BUKTI YANG SUDAH DIBUKTIKAN PEMAIN ===');
    for (const id of done) {
      const c = CONNECTIONS[id];
      parts.push(`- ${EVIDENCE[c.pair[0]].code} dan ${EVIDENCE[c.pair[1]].code}: ${c.insight}`);
    }
  }
  if (progress.solved.length) {
    parts.push(`=== TANTANGAN YANG SUDAH DISELESAIKAN ===\n${progress.solved.map((id) => CHALLENGES[id].title).join(', ')}`);
  }
  if (progress.hypothesis) parts.push(`Dugaan awal pemain (HIPOTESIS, bukan fakta): ${HYPOTHESIS_LABEL[progress.hypothesis]}.`);

  const obj = currentObjective(CASE_DEF, state);
  parts.push(`=== TAHAP PENYELIDIKAN (dihitung sistem permainan) ===\nTujuan saat ini: ${obj ? `${obj.text} (${obj.where})` : 'semua tujuan utama terpenuhi'}.`);
  if (readyForResolution(CASE_DEF, state)) parts.push('Pemain sudah punya cukup bahan untuk menyusun kesimpulan sendiri.');

  if (hintLevel >= 2) {
    const missing = EVIDENCE_IDS.filter((id) => !progress.collected.includes(id) && CORE_EVIDENCE.includes(id));
    if (missing.length) {
      parts.push(`Bukti inti yang belum ditemukan (sebutkan hanya KODE dan lokasi umum, jangan isinya): ${missing.map((id) => `${EVIDENCE[id].code} (${evidenceLocationName(id) || 'lokasi lain'})`).join('; ')}.`);
    }
  }
  return parts.join('\n');
}

// ---------- Konteks REI ----------
export function characterContext(ch) {
  return [
    `=== KONTEKS KASUS ===\n${caseBrief()}`,
    `=== PROFIL KARAKTER ===\nNama: ${ch.name}\nPeran: ${ch.role}\nKepribadian: ${ch.personality}\nGaya bicara: ${ch.speech}`,
    `=== YANG KAMU TAHU (satu-satunya sumber fakta) ===\n${ch.knows.map((k) => `- ${k}`).join('\n')}`,
    `=== YANG TIDAK KAMU TAHU ===\n${ch.doesNotKnow.map((k) => `- ${k}`).join('\n')}`,
  ].join('\n');
}

// ---------- Konteks NOPAL ----------
export function tutorContext({ challenge, step, verdict, studentAnswerText, canReveal }) {
  const notes = TUTOR_NOTES[step.id] || { concepts: [], pitfalls: [] };
  const parts = [`=== SOAL YANG SEDANG DIKERJAKAN ===\nTantangan: ${challenge.title} (${challenge.subject}).\nPertanyaan: ${step.prompt}`];
  if (step.quote) parts.push(`Teks yang dibaca siswa: "${step.quote}"`);
  if (step.table) parts.push(`Tabel yang dilihat siswa: ${step.table.headers.join(' | ')}\n${step.table.rows.map((r) => r.join(' | ')).join('\n')}`);
  if (step.options) parts.push(`Pilihan jawaban yang dilihat siswa:\n${step.options.map((o) => `- ${o.text}`).join('\n')}`);
  if (step.items) parts.push(`Pernyataan yang harus dikelompokkan:\n${step.items.map((o, i) => `${i + 1}. ${o.text}`).join('\n')}`);
  parts.push(`=== CATATAN KONSEP (pakai sebagai bahan, jangan dibacakan mentah) ===\nKonsep: ${notes.concepts.join(' ')}\nKekeliruan umum: ${notes.pitfalls.join(' ')}`);
  if (studentAnswerText) {
    parts.push(`=== JAWABAN SISWA ===\nJawaban: ${escapeForPrompt(studentAnswerText)}\nPenilaian sistem (ditentukan kode, bukan oleh kamu): ${verdict.correct ? 'BENAR' : 'SALAH'}.${verdict.correct ? '' : `\nUmpan balik resmi permainan: ${verdict.message}`}`);
  }
  if (verdict && verdict.correct) {
    parts.push(`Pembahasan resmi: ${step.explain}\nKaitan dengan kasus: ${step.link}`);
  } else if (canReveal) {
    parts.push(`Siswa sudah memakai semua petunjuk dan boleh diperlihatkan jalannya. Pembahasan resmi: ${step.explain}`);
  } else {
    parts.push('JANGAN menyebutkan jawaban akhir soal ini. Bantu siswa menemukan sendiri lewat pertanyaan penuntun dan konsep.');
  }
  return parts.join('\n');
}

// ---------- Guard spoiler deterministik ----------
// Aturan ini dijalankan pada KELUARAN AI. Tidak bergantung pada kepatuhan model terhadap prompt.
export const SPOILER_RULES = [
  {
    id: 'watering-terms',
    label: 'kegiatan penyiraman / Klub Kebun',
    pattern: /(penyiraman|menyiram|disiram|siram|klub\s+kebun|pekan\s+kebun)/i,
    allowed: (p) => p.caseSolved || ['E3', 'E5', 'E6'].some((id) => p.collected.includes(id)),
  },
  {
    id: 'liters-per-session',
    label: 'angka 180 liter per sesi',
    pattern: /\b180\b/,
    allowed: (p) => p.caseSolved || ['E3', 'E5'].some((id) => p.collected.includes(id)),
  },
  {
    id: 'increase-value',
    label: 'hasil selisih 360 liter',
    pattern: /\b360\b/,
    allowed: (p) => p.caseSolved || p.solved.includes('m1'),
  },
  {
    id: 'sessions-math',
    label: 'hubungan 2 sesi x 180 = 360',
    pattern: /\b(2|dua)\s*(sesi|kali)\b[^.\n]{0,45}\b180\b|\b2\s*[×x*]\s*180\b|\b180\s*[×x*]\s*2\b/i,
    allowed: (p) => p.caseSolved || p.connections.includes('C1'),
  },
  {
    id: 'conclusion-statement',
    label: 'kesimpulan akhir kasus',
    pattern: /(penyebab(nya)?|jawaban(nya)?|kesimpulan(nya)?)[^.\n]{0,70}(penyiraman|siram|bukan\s+(karena\s+)?(ada\s+)?(kebocoran|bocor))|bukan\s+(karena\s+)?(ada\s+)?(kebocoran|bocor)(?!\s*(saja|ya\?))/i,
    allowed: (p) => p.caseSolved,
  },
];

export function checkSpoilers(text, progress, { skip = [] } = {}) {
  return SPOILER_RULES.filter((r) => !skip.includes(r.id) && r.pattern.test(text) && !r.allowed(progress)).map((r) => ({ id: r.id, label: r.label }));
}

// Guard angka untuk REI: angka besar hanya boleh yang termasuk pengetahuan karakter.
export function checkCharacterNumbers(text, character, progress) {
  const allowed = character.allowedBigNumbers(progress);
  const bad = numbersIn(text).filter((n) => n >= 100 && !allowed.includes(n));
  return bad.length ? [{ id: 'unknown-number', label: `angka di luar pengetahuan karakter (${[...new Set(bad)].slice(0, 3).join(', ')})` }] : [];
}

