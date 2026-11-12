// StoryEngine — logika dialog visual novel (murni, tanpa React).

export function fillTemplate(text, vars = {}) {
  return String(text || '').replace(/\{(\w+)\}/g, (m, k) =>
    vars[k] !== undefined && vars[k] !== '' ? vars[k] : k === 'player' ? 'Penyelidik' : m,
  );
}

export function getNode(script, nodeId) {
  return script && script.nodes ? script.nodes[nodeId] || null : null;
}

// Mengikuti node "branch" sampai menemukan node yang bisa ditampilkan.
export function resolveNode(script, nodeId, flags = {}) {
  let id = nodeId;
  for (let guard = 0; guard < 20; guard++) {
    const node = getNode(script, id);
    if (!node) return { id: null, node: null };
    if (!node.branch) return { id, node };
    const value = flags[node.branch.flag];
    id = node.branch.map[value] || node.branch.default;
  }
  return { id: null, node: null };
}

// Node berikutnya setelah node saat ini. choiceIndex dipakai bila ada pilihan.
export function nextNodeId(node, choiceIndex) {
  if (!node) return null;
  if (node.choices && node.choices.length) {
    const c = node.choices[choiceIndex];
    return c ? c.next : null;
  }
  if (node.end || !node.next) return null;
  return node.next;
}

export function nodeEffects(node, choiceIndex) {
  const out = [];
  if (node && node.effects) out.push(...node.effects);
  if (node && node.choices && node.choices[choiceIndex] && node.choices[choiceIndex].effects) {
    out.push(...node.choices[choiceIndex].effects);
  }
  return out;
}

// Jalur terpanjang yang tersisa dari sebuah node (dipakai untuk indikator progres).
export function remainingDepth(script, nodeId, flags = {}, seen = new Set()) {
  const { id, node } = resolveNode(script, nodeId, flags);
  if (!node || seen.has(id)) return 0;
  const nextSeen = new Set(seen).add(id);
  let targets = [];
  if (node.choices && node.choices.length) targets = node.choices.map((c) => c.next);
  else if (node.next && !node.end) targets = [node.next];
  let best = 0;
  for (const t of targets) best = Math.max(best, remainingDepth(script, t, flags, nextSeen));
  return 1 + best;
}

// Progres 0..1 berdasarkan jumlah node yang sudah dilihat dan sisa jalur terpanjang.
export function progressFor(script, visitedCount, nodeId, flags = {}) {
  const remaining = remainingDepth(script, nodeId, flags);
  const total = Math.max(1, visitedCount - 1 + remaining);
  return { current: Math.min(visitedCount, total), total };
}

export function startNodeId(script) {
  return script.start;
}
