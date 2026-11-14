// ProgressEngine — penyimpanan lokal, poin pengetahuan, pangkat, lencana, hasil kasus.
import { keyConnectionsDone } from './EvidenceEngine.js';

export const SAVE_KEY = 'mysteria.save.v1';

export const RANKS = [
  { min: 0, name: 'Calon Penyelidik' },
  { min: 30, name: 'Penyelidik Magang' },
  { min: 70, name: 'Penyelidik Arsip' },
  { min: 150, name: 'Penyelidik Senior' },
  { min: 300, name: 'Penjaga Arsip' },
];

export const BADGES = {
  'first-case': { name: 'Kasus Pertama', icon: 'Award', desc: 'Menyelesaikan kasus pertamamu.' },
  'eagle-eye': { name: 'Mata Elang', icon: 'Eye', desc: 'Mengumpulkan semua bukti, termasuk yang opsional.' },
  'sharp-mind': { name: 'Penalar Tajam', icon: 'Brain', desc: 'Membuktikan semua hubungan inti tanpa salah.' },
  'careful-count': { name: 'Hitung Cermat', icon: 'Calculator', desc: 'Menjawab semua soal matematika tanpa salah dan tanpa petunjuk.' },
  'water-guardian': { name: 'Penjaga Air', icon: 'Droplets', desc: 'Menyelesaikan tantangan IPA tanpa memperlihatkan jawaban.' },
  'close-reader': { name: 'Pembaca Cermat', icon: 'BookText', desc: 'Menyelesaikan tantangan bahasa tanpa memperlihatkan jawaban.' },
  independent: { name: 'Mandiri', icon: 'Lightbulb', desc: 'Menyelesaikan kasus tanpa meminta petunjuk.' },
};

export function defaultSettings() {
  return { textSpeed: 'normal', textSize: 'normal', motion: 'auto' };
}

export function defaultSave() {
  return {
    version: 1,
    player: { name: '' },
    started: false,
    introDone: false,
    settings: defaultSettings(),
    story: null, // { scriptId, nodeId, visited: [] }
    current: null, // state kasus yang sedang berjalan
    profile: { cases: {}, badges: [] },
  };
}

function storage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadSave() {
  const st = storage();
  if (!st) return defaultSave();
  try {
    const raw = st.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return defaultSave();
    const base = defaultSave();
    return {
      ...base,
      ...data,
      settings: { ...base.settings, ...(data.settings || {}) },
      profile: { cases: {}, badges: [], ...(data.profile || {}) },
    };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save) {
  const st = storage();
  if (!st) return false;
  try {
    st.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

// Mulai penyelidikan baru: hapus progres, pertahankan pengaturan.
export function freshSave(prev) {
  const base = defaultSave();
  if (prev && prev.settings) base.settings = prev.settings;
  base.started = true;
  return base;
}

export function hasProgress(save) {
  return !!(save.started && (save.story || save.current || save.introDone));
}

export function newCaseState(caseDef) {
  return {
    caseId: caseDef.id,
    phase: 'briefing', // briefing | investigate | epilogue | done
    location: caseDef.startLocation,
    view: 'scene',
    flags: {},
    collected: [],
    inspected: [],
    challenges: {},
    connections: {},
    boardMistakes: 0,
    notes: {},
    seenChallenges: [],
    stats: { mistakes: 0, hints: 0 },
    final: { wrong: 0, solved: false, points: 0 },
  };
}

// ---------- Poin & pangkat ----------

export function casePoints(caseDef, cs) {
  if (!cs) return 0;
  let p = cs.collected.length * 2;
  for (const st of Object.values(cs.challenges)) {
    for (const s of st.steps) p += s.points || 0;
  }
  for (const c of caseDef.connections) {
    if (cs.connections[c.id] && cs.connections[c.id].done) p += c.key ? 5 : 3;
  }
  p += cs.final ? cs.final.points || 0 : 0;
  return p;
}

export function totalKnowledge(save, cases) {
  let total = 0;
  const ids = new Set(Object.keys(save.profile.cases));
  if (save.current) ids.add(save.current.caseId);
  for (const id of ids) {
    const best = (save.profile.cases[id] && save.profile.cases[id].bestPoints) || 0;
    const live = save.current && save.current.caseId === id && cases[id] ? casePoints(cases[id], save.current) : 0;
    total += Math.max(best, live);
  }
  return total;
}

export function rankFor(points) {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (points >= r.min) idx = i;
  });
  const next = RANKS[idx + 1] || null;
  const base = RANKS[idx].min;
  return {
    index: idx,
    name: RANKS[idx].name,
    next,
    progress: next ? (points - base) / (next.min - base) : 1,
  };
}

// ---------- Hasil kasus ----------

export function finalPoints(wrong) {
  return Math.max(8, 20 - 5 * wrong);
}

export function totalMistakes(cs) {
  return (cs.stats ? cs.stats.mistakes : 0) + (cs.final ? cs.final.wrong : 0);
}

export function computeStars(cs) {
  const m = totalMistakes(cs);
  const h = cs.stats ? cs.stats.hints : 0;
  if (m <= 3 && h <= 2) return 3;
  if (m <= 8) return 2;
  return 1;
}

export function computeBadges(caseDef, cs) {
  const out = ['first-case'];
  if (caseDef.evidenceOrder.every((id) => cs.collected.includes(id))) out.push('eagle-eye');
  const allKey = keyConnectionsDone(caseDef, cs) === caseDef.connections.filter((c) => c.key).length;
  if (allKey && (cs.boardMistakes || 0) === 0) out.push('sharp-mind');
  const clean = (chId) => {
    const st = cs.challenges[chId];
    return !!st && st.steps.every((s) => s.solved && s.wrong === 0 && s.hints === 0 && !s.revealed);
  };
  if (clean('m1') && clean('m2')) out.push('careful-count');
  const noReveal = (chId) => {
    const st = cs.challenges[chId];
    return !!st && st.steps.every((s) => s.solved && !s.revealed);
  };
  if (noReveal('s1')) out.push('water-guardian');
  if (noReveal('i1')) out.push('close-reader');
  if ((cs.stats ? cs.stats.hints : 0) === 0) out.push('independent');
  return out;
}

export function buildResult(caseDef, cs, checks) {
  const stats = cs.stats || { mistakes: 0, hints: 0 };
  const stepsAll = Object.values(cs.challenges).flatMap((c) => c.steps);
  return {
    points: casePoints(caseDef, cs),
    stars: computeStars(cs),
    badges: computeBadges(caseDef, cs),
    evidence: cs.collected.length,
    evidenceTotal: caseDef.evidenceOrder.length,
    connections: caseDef.connections.filter((c) => cs.connections[c.id] && cs.connections[c.id].done).length,
    connectionsTotal: caseDef.connections.length,
    stepsSolved: stepsAll.filter((s) => s.solved).length,
    stepsTotal: caseDef.challenges.reduce((n, c) => n + c.steps.length, 0),
    mistakes: totalMistakes(cs),
    hints: stats.hints,
    finalAttempts: (cs.final ? cs.final.wrong : 0) + 1,
    hypothesis: cs.flags.hypothesis || null,
    reasoning: cs.final ? cs.final.reasoning || '' : '',
    reasoningChecks: checks || [],
  };
}

// Menyimpan hasil ke profil (poin terbaik + lencana + status). Mengembalikan save baru.
export function finalizeCase(save, caseDef, result) {
  const prev = save.profile.cases[caseDef.id] || {};
  const best = Math.max(prev.bestPoints || 0, result.points);
  const badges = Array.from(new Set([...(save.profile.badges || []), ...result.badges]));
  return {
    ...save,
    profile: {
      badges,
      cases: {
        ...save.profile.cases,
        [caseDef.id]: {
          status: 'completed',
          bestPoints: best,
          bestStars: Math.max(prev.bestStars || 0, result.stars),
          result,
          completedAt: Date.now(),
        },
      },
    },
  };
}

export function caseStatus(save, caseId) {
  const rec = save.profile.cases[caseId];
  if (rec && rec.status === 'completed') return 'completed';
  if (save.current && save.current.caseId === caseId) return 'inProgress';
  if (save.introDone) return 'available';
  return 'locked';
}
