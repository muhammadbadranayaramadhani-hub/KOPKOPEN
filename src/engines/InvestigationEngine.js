// InvestigationEngine — aturan lokasi, hotspot, tujuan, dan kesiapan kesimpulan.
import { keyConnectionsDone } from './EvidenceEngine.js';

// Bahasa syarat: { collected, inspected, solved, connections, finalSolved, ready }
export function isMet(req, caseDef, cs) {
  if (!req) return true;
  if (req.collected && !req.collected.every((id) => cs.collected.includes(id))) return false;
  if (req.inspected && !req.inspected.every((id) => cs.inspected.includes(id))) return false;
  if (req.solved && !req.solved.every((id) => cs.challenges[id] && cs.challenges[id].done)) return false;
  if (req.connections != null && keyConnectionsDone(caseDef, cs) < req.connections) return false;
  if (req.finalSolved && !(cs.final && cs.final.solved)) return false;
  if (req.ready && !readyForResolution(caseDef, cs)) return false;
  return true;
}

export function locationUnlocked(caseDef, cs, locId) {
  const loc = caseDef.locations[locId];
  return !!loc && isMet(loc.requires, caseDef, cs);
}

// Status tiap hotspot. hidden=true berarti belum boleh dirender sama sekali.
export function objectState(obj, caseDef, cs) {
  const met = isMet(obj.requires, caseDef, cs);
  return {
    hidden: !!obj.hidden && !met,
    locked: !met,
    inspected: cs.inspected.includes(obj.id),
    collected: !!obj.evidence && cs.collected.includes(obj.evidence),
  };
}

export function visibleObjects(caseDef, cs, locId) {
  const loc = caseDef.locations[locId];
  return loc.objects
    .map((obj) => ({ obj, state: objectState(obj, caseDef, cs) }))
    .filter((o) => !o.state.hidden);
}

// Menandai benda sudah diperiksa. Mengembalikan state baru dan daftar benda yang terbuka.
export function inspectObject(caseDef, cs, obj) {
  if (obj.requires && !isMet(obj.requires, caseDef, cs)) return { cs, revealed: [] };
  const already = cs.inspected.includes(obj.id);
  const next = already ? cs : { ...cs, inspected: [...cs.inspected, obj.id] };
  const revealed = !already && obj.reveals ? obj.reveals : [];
  return { cs: next, revealed };
}

export function findObject(caseDef, objId) {
  for (const loc of Object.values(caseDef.locations)) {
    const o = loc.objects.find((x) => x.id === objId);
    if (o) return { obj: o, location: loc };
  }
  return null;
}

// ---------- Tantangan ----------

export function challengeAvailable(challenge, caseDef, cs) {
  return isMet(challenge.unlock, caseDef, cs);
}

export function challengeStatus(challenge, caseDef, cs) {
  const st = cs.challenges[challenge.id];
  if (st && st.done) return 'done';
  return challengeAvailable(challenge, caseDef, cs) ? 'available' : 'locked';
}

export function newChallengeIds(caseDef, cs, seenIds = []) {
  return caseDef.challenges
    .filter((c) => challengeStatus(c, caseDef, cs) === 'available' && !seenIds.includes(c.id))
    .map((c) => c.id);
}

// ---------- Tujuan ----------

export function objectiveList(caseDef, cs) {
  let currentAssigned = false;
  return caseDef.objectives.map((o) => {
    const done = isMet(o.done, caseDef, cs);
    const available = isMet(o.available, caseDef, cs);
    let status = done ? 'done' : available ? 'active' : 'locked';
    let current = false;
    if (status === 'active' && !o.optional && !currentAssigned) {
      current = true;
      currentAssigned = true;
    }
    return { ...o, status, current };
  });
}

export function currentObjective(caseDef, cs) {
  return objectiveList(caseDef, cs).find((o) => o.current) || null;
}

// ---------- Kesiapan kesimpulan ----------

export function readyForResolution(caseDef, cs) {
  const evidenceOk = caseDef.coreEvidence.every((id) => cs.collected.includes(id));
  const challengesOk = caseDef.challenges.every((c) => cs.challenges[c.id] && cs.challenges[c.id].done);
  const boardOk = keyConnectionsDone(caseDef, cs) >= caseDef.keyConnectionsNeeded;
  return evidenceOk && challengesOk && boardOk;
}

// Daftar hal yang masih kurang (untuk pesan pemain).
export function missingForResolution(caseDef, cs) {
  const out = [];
  const missEv = caseDef.coreEvidence.filter((id) => !cs.collected.includes(id));
  if (missEv.length) out.push(`${missEv.length} bukti inti belum terkumpul`);
  const missCh = caseDef.challenges.filter((c) => !(cs.challenges[c.id] && cs.challenges[c.id].done));
  if (missCh.length) out.push(`${missCh.length} tantangan belum selesai`);
  const kd = keyConnectionsDone(caseDef, cs);
  if (kd < caseDef.keyConnectionsNeeded) out.push(`hubungan di Papan Bukti ${kd}/${caseDef.keyConnectionsNeeded}`);
  return out;
}
