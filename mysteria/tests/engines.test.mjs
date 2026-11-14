import test from 'node:test';
import assert from 'node:assert/strict';

import { theLastDrop as C } from '../src/data/cases/theLastDrop.js';
import { INTRO_SCRIPT } from '../src/data/intro.js';
import { CHARACTERS } from '../src/data/characters.js';
import * as Story from '../src/engines/StoryEngine.js';
import * as Puzzle from '../src/engines/PuzzleEngine.js';
import * as Evidence from '../src/engines/EvidenceEngine.js';
import * as Inv from '../src/engines/InvestigationEngine.js';
import * as Progress from '../src/engines/ProgressEngine.js';

const scripts = [INTRO_SCRIPT, ...Object.values(C.scripts)];

test('angka kasus konsisten', () => {
  assert.equal(1560 - 1200, 360);
  assert.equal(2 * 180, 360);
  assert.equal(C.challenges[0].steps[0].answer, 360);
  assert.equal(C.challenges[1].steps[0].answer, 360);
  assert.equal(C.resolution.numberFill.increase, 360);
  assert.equal(C.resolution.numberFill.sessions * C.resolution.numberFill.perSession, 360);
  const rows = C.evidence.E1.table.rows;
  assert.equal(rows[2][2], '1.560');
  assert.equal(rows[0][2], '1.200');
  assert.ok(C.evidence.E3.data.some((d) => d.value === '180 liter'));
  // tidak ada angka liter lain yang kontradiktif di seluruh data kasus
  const blob = JSON.stringify(C).replace(/\\n/g, ' ');
  const nums = new Set([...blob.matchAll(/(\d[\d.]*)\s*liter/g)].map((m) => m[1]));
  for (const n of nums) assert.ok(['1.560', '1.200', '360', '180', '0', '1'].includes(n), `angka liter tak terduga: ${n}`);
});

test('semua skrip cerita valid (target node ada, karakter dikenal)', () => {
  for (const s of scripts) {
    assert.ok(s.nodes[s.start], `${s.id}: start`);
    let hasEnd = false;
    for (const [id, n] of Object.entries(s.nodes)) {
      const targets = [];
      if (n.next) targets.push(n.next);
      if (n.choices) n.choices.forEach((c) => targets.push(c.next));
      if (n.branch) targets.push(...Object.values(n.branch.map), n.branch.default);
      targets.forEach((t) => assert.ok(s.nodes[t], `${s.id}.${id} -> ${t} tidak ada`));
      if (n.end) hasEnd = true;
      if (n.speaker && n.speaker !== 'narrator') assert.ok(CHARACTERS[n.speaker], `${s.id}.${id}: ${n.speaker}`);
      (n.cast || []).forEach((c) => assert.ok(CHARACTERS[c]));
      if (!n.branch && !n.end) assert.ok(n.next || n.choices, `${s.id}.${id} buntu`);
    }
    assert.ok(hasEnd, `${s.id} tanpa akhir`);
  }
});

test('StoryEngine: progres, cabang, templat', () => {
  assert.equal(Story.fillTemplate('Halo {player}', { player: 'Arsa' }), 'Halo Arsa');
  assert.equal(Story.fillTemplate('Halo {player}', {}), 'Halo Penyelidik');
  const ep = C.scripts.epilogue;
  assert.equal(Story.resolveNode(ep, 'e3', { hypothesis: 'leak' }).id, 'e3a');
  assert.equal(Story.resolveNode(ep, 'e3', { hypothesis: 'usage' }).id, 'e3b');
  assert.equal(Story.resolveNode(ep, 'e3', {}).id, 'e3c');
  const p0 = Story.progressFor(INTRO_SCRIPT, 1, 'n1');
  assert.ok(p0.total >= 12 && p0.current === 1);
  const pEnd = Story.progressFor(INTRO_SCRIPT, p0.total, 'n12');
  assert.equal(pEnd.current, pEnd.total);
  // lingkaran wawancara tidak membuat rekursi tak hingga
  assert.ok(Story.remainingDepth(C.scripts['interview-darmo'], 'd0') > 0);
});

test('PuzzleEngine: parse angka dan evaluasi', () => {
  assert.equal(Puzzle.parseNumber('1.560'), 1560);
  assert.equal(Puzzle.parseNumber('360 liter'), 360);
  assert.equal(Puzzle.parseNumber(' 360 L '), 360);
  assert.ok(Number.isNaN(Puzzle.parseNumber('abc')));
  const m1 = C.challenges[0].steps[0];
  assert.equal(Puzzle.evaluateStep(m1, '360').correct, true);
  const w = Puzzle.evaluateStep(m1, '2760');
  assert.equal(w.correct, false);
  assert.match(w.message, /menjumlahkan/);
  assert.equal(Puzzle.evaluateStep(m1, '').correct, false);
  assert.equal(Puzzle.evaluateStep(C.challenges[1].steps[0], '182').correct, false);
  assert.equal(Puzzle.evaluateStep(C.challenges[1].steps[0], '2 x 180'.replace(/.*/, '360')).correct, true);
});

test('setiap langkah tantangan bisa diselesaikan dan salah jawab tidak membocorkan jawaban', () => {
  for (const ch of C.challenges) {
    ch.steps.forEach((st) => {
      assert.ok(st.hints.length >= 3, `${st.id} butuh >= 3 petunjuk`);
      assert.ok(st.explain && st.link, `${st.id} penjelasan`);
      let right;
      if (st.type === 'numeric') right = String(st.answer);
      if (st.type === 'mc') right = st.options.find((o) => o.correct).id;
      if (st.type === 'multi') right = st.options.filter((o) => o.correct).map((o) => o.id);
      if (st.type === 'classify') right = Object.fromEntries(st.items.map((i) => [i.id, i.answer]));
      assert.equal(Puzzle.evaluateStep(st, right).correct, true, st.id);
      if (st.type === 'mc') {
        assert.equal(st.options.filter((o) => o.correct).length, 1);
        st.options.filter((o) => !o.correct).forEach((o) => assert.ok(o.why, `${st.id}/${o.id} perlu penjelasan`));
      }
      if (st.type === 'multi') {
        const partial = st.options.filter((o) => o.correct).slice(0, 2).map((o) => o.id);
        const r = Puzzle.evaluateStep(st, partial);
        assert.equal(r.correct, false);
        const wrongPick = [...right, st.options.find((o) => !o.correct).id];
        assert.equal(Puzzle.evaluateStep(st, wrongPick).correct, false);
      }
      if (st.type === 'classify') {
        const bad = { ...right, k1: 'mendukung' };
        const r = Puzzle.evaluateStep(st, bad);
        assert.equal(r.correct, false);
        assert.ok(!/melemahkan/i.test(r.message), 'umpan balik tidak boleh menyebut kategori benar');
      }
    });
  }
});

function playTo(cs) {
  return cs;
}

test('perjalanan pemain lengkap sampai kesimpulan benar', () => {
  let save = Progress.freshSave();
  let cs = Progress.newCaseState(C);

  // Garden terkunci di awal, lorong & ruang perawatan terbuka
  assert.equal(Inv.locationUnlocked(C, cs, 'garden'), false);
  assert.equal(Inv.locationUnlocked(C, cs, 'maintenance'), true);
  assert.equal(Inv.visibleObjects(C, cs, 'garden').some((o) => o.obj.id === 'schedule'), false);

  // Tantangan terkunci sebelum bukti
  assert.equal(Inv.challengeStatus(C.challenges[0], C, cs), 'locked');

  // Ruang perawatan: kumpulkan E1, E2, E4 (bukti hanya lewat objek yang punya evidence)
  for (const objId of ['records', 'meter', 'checklist']) {
    const { obj } = Inv.findObject(C, objId);
    cs = Inv.inspectObject(C, cs, obj).cs;
    cs = Evidence.collectEvidence(cs, obj.evidence);
  }
  assert.deepEqual(cs.collected.sort(), ['E1', 'E2', 'E4']);
  assert.equal(Inv.challengeStatus(C.challenges[0], C, cs), 'available');

  // m1: salah dulu, lalu hint, lalu benar
  const m1 = C.challenges[0];
  const bad = Puzzle.evaluateStep(m1.steps[0], '2760');
  cs = Puzzle.recordStepResult(cs, m1, 0, { correct: bad.correct });
  cs = Puzzle.recordHint(cs, m1, 0);
  cs = Puzzle.recordStepResult(cs, m1, 0, { correct: Puzzle.evaluateStep(m1.steps[0], '360').correct });
  assert.equal(cs.challenges.m1.done, true);
  assert.equal(cs.challenges.m1.steps[0].points, 6); // 10 - 2*1 salah - 2*1 petunjuk
  assert.equal(Inv.locationUnlocked(C, cs, 'garden'), true);

  // Taman: schedule tersembunyi sampai tanaman diperiksa
  const plants = Inv.findObject(C, 'plants').obj;
  const r = Inv.inspectObject(C, cs, plants);
  cs = r.cs;
  assert.deepEqual(r.revealed, ['schedule']);
  const sched = Inv.findObject(C, 'schedule').obj;
  assert.equal(Inv.visibleObjects(C, cs, 'garden').some((o) => o.obj.id === 'schedule'), true);
  cs = Inv.inspectObject(C, cs, sched).cs;
  cs = Evidence.collectEvidence(cs, 'E3');

  // Sari baru bisa diwawancarai setelah E3, lalu E5 lewat efek cerita
  const sari = Inv.findObject(C, 'sari').obj;
  assert.equal(Inv.objectState(sari, C, cs).locked, false);
  const sNode = C.scripts['interview-sari'].nodes.s1c;
  Story.nodeEffects(sNode, 0).filter((e) => e.type === 'collect').forEach((e) => (cs = Evidence.collectEvidence(cs, e.id)));
  assert.ok(cs.collected.includes('E5'));

  // Papan pengumuman (opsional) E6
  cs = Evidence.collectEvidence(cs, 'E6');

  // Tantangan lain
  for (const [id, answers] of [
    ['m2', ['360', 'c']],
    ['s1', ['b', ['a', 'b', 'c', 'd']]],
    ['i1', ['b', { k1: 'melemahkan', k2: 'melemahkan', k3: 'melemahkan', k4: 'tidak' }]],
  ]) {
    const ch = Puzzle.getChallenge(C, id);
    assert.equal(Inv.challengeStatus(ch, C, cs), 'available', id);
    answers.forEach((a, i) => {
      const ev = Puzzle.evaluateStep(ch.steps[i], a);
      assert.equal(ev.correct, true, `${id}/${i}`);
      cs = Puzzle.recordStepResult(cs, ch, i, { correct: true });
    });
    assert.equal(cs.challenges[id].done, true);
  }

  // Belum siap sebelum papan bukti
  assert.equal(Inv.readyForResolution(C, cs), false);
  assert.ok(Inv.missingForResolution(C, cs).length > 0);

  // Papan bukti: pasangan generik tidak dihitung; salah dulu lalu benar
  const gen = Evidence.getPairTest(C, 'E1', 'E5');
  assert.equal(gen.generic, true);
  assert.equal(Evidence.checkConnection(gen, 'g3', 'gr2').success, true);

  const c1 = Evidence.getPairTest(C, 'E3', 'E1');
  assert.equal(c1.id, 'C1');
  const wrong = Evidence.checkConnection(c1, 'c', 'r1');
  assert.equal(wrong.success, false);
  assert.match(wrong.message, /420/);
  cs = Evidence.recordConnectionAttempt(cs, c1, false);
  assert.equal(cs.boardMistakes, 1);
  const half = Evidence.checkConnection(c1, 'b', 'r1');
  assert.equal(half.success, false);
  assert.equal(half.statementOk, true);

  for (const def of C.connections) {
    const st = def.statements.find((s) => s.correct).id;
    const re = def.reasons.find((x) => x.correct).id;
    const res = Evidence.checkConnection(def, st, re);
    assert.equal(res.success, true, def.id);
    cs = Evidence.recordConnectionAttempt(cs, def, true);
  }
  assert.equal(Evidence.keyConnectionsDone(C, cs), 4);
  assert.equal(Inv.readyForResolution(C, cs), true);

  // Semua tujuan wajib selesai kecuali kesimpulan
  const objs = Inv.objectiveList(C, cs);
  assert.equal(objs.filter((o) => !o.optional && o.status !== 'done').map((o) => o.id).join(), 'o11');
  assert.equal(Inv.currentObjective(C, cs).id, 'o11');

  // Kesimpulan: salah penyebab tidak membocorkan, lalu cukup bukti, lalu benar
  const base = { evidence: ['E1', 'E3', 'E5'], increase: '360', sessions: '2', perSession: '180', reasoning: 'Selisih 360 liter sama dengan dua sesi siram, bukan bocor.' };
  const leak = Evidence.evaluateConclusion(C, { ...base, optionId: 'leak' });
  assert.equal(leak.ok, false);
  assert.equal(leak.stage, 'cause');
  assert.match(leak.message, /belum didukung bukti/);
  const lucky = Evidence.evaluateConclusion(C, { ...base, optionId: 'watering', evidence: ['E4'] });
  assert.equal(lucky.ok, false); // benar tapi tanpa bukti => ditolak
  assert.equal(lucky.stage, 'evidence');
  const badNum = Evidence.evaluateConclusion(C, { ...base, optionId: 'watering', increase: '300' });
  assert.equal(badNum.stage, 'numbers');
  const shortR = Evidence.evaluateConclusion(C, { ...base, optionId: 'watering', reasoning: 'karena' });
  assert.equal(shortR.stage, 'reasoning');
  const good = Evidence.evaluateConclusion(C, { ...base, optionId: 'watering' });
  assert.equal(good.ok, true);
  assert.ok(good.checks.every((c) => c.hit));

  // Penyelesaian & progres
  cs.final = { wrong: 1, solved: true, points: Progress.finalPoints(1), reasoning: base.reasoning };
  cs.flags.hypothesis = 'leak';
  const result = Progress.buildResult(C, cs, good.checks);
  save = Progress.finalizeCase(save, C, result);
  assert.equal(save.profile.cases['MYS-001'].status, 'completed');
  assert.ok(result.badges.includes('first-case'));
  assert.ok(result.badges.includes('eagle-eye'));
  assert.ok(!result.badges.includes('sharp-mind')); // ada kesalahan di papan
  assert.ok(!result.badges.includes('independent')); // memakai petunjuk
  assert.ok(result.stars >= 1 && result.stars <= 3);
  assert.ok(result.points > 80, `poin ${result.points}`);
  save.current = null;
  assert.ok(Progress.totalKnowledge(save, { 'MYS-001': C }) === result.points);
  assert.equal(Progress.caseStatus(save, 'MYS-001'), 'completed');
  playTo(cs);
});

test('rank dan penyimpanan', () => {
  assert.equal(Progress.rankFor(0).name, 'Calon Penyelidik');
  assert.equal(Progress.rankFor(30).name, 'Penyelidik Magang');
  assert.equal(Progress.rankFor(100).name, 'Penyelidik Arsip');
  assert.ok(Progress.rankFor(10).progress > 0 && Progress.rankFor(10).progress < 1);
  // tanpa localStorage (Node) tidak boleh melempar error
  assert.equal(Progress.persistSave(Progress.defaultSave()), false);
  assert.equal(Progress.loadSave().version, 1);
  const store = {};
  globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = v) };
  const s = Progress.defaultSave();
  s.player.name = 'Arsa';
  assert.equal(Progress.persistSave(s), true);
  assert.equal(Progress.loadSave().player.name, 'Arsa');
  store[Progress.SAVE_KEY] = '{rusak';
  assert.equal(Progress.loadSave().player.name, '');
  delete globalThis.localStorage;
});

test('hotspot: setiap objek punya interaksi yang valid', () => {
  for (const loc of Object.values(C.locations)) {
    assert.ok(loc.objects.length >= 4, `${loc.id} minimal 4 objek`);
    for (const o of loc.objects) {
      assert.ok(o.name && o.description && o.icon, o.id);
      assert.ok(o.x >= 5 && o.x <= 95 && o.y >= 5 && o.y <= 95, `${o.id} di luar panggung`);
      if (o.kind === 'npc') assert.ok(C.scripts[o.script], `${o.id} skrip`);
      if (o.evidence) assert.ok(C.evidence[o.evidence], `${o.id} bukti`);
      (o.reveals || []).forEach((r) => assert.ok(loc.objects.find((x) => x.id === r)));
    }
    // tidak ada dua hotspot yang menumpuk terlalu dekat
    for (const a of loc.objects) for (const b of loc.objects) {
      if (a.id < b.id) assert.ok(Math.hypot(a.x - b.x, (a.y - b.y) * 1.3) > 9, `${a.id}/${b.id} terlalu dekat`);
    }
  }
  const evidenceSources = Object.values(C.locations).flatMap((l) => l.objects.map((o) => o.evidence)).filter(Boolean);
  const viaStory = ['E5'];
  for (const id of C.evidenceOrder) assert.ok(evidenceSources.includes(id) || viaStory.includes(id), `${id} tak bisa didapat`);
});
