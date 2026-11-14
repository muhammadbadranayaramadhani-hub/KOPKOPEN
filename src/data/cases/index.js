import { theLastDrop } from './theLastDrop.js';
import { kodeDiBalikLonceng } from './KodeDiBalikLonceng.js';
import { petaYangHilang } from './petaYangHilang.js';

export const CASES = {
  [theLastDrop.id]: theLastDrop,
  [kodeDiBalikLonceng.id]: kodeDiBalikLonceng,
  [petaYangHilang.id]: petaYangHilang,
};

// requires: ID kasus sebelumnya yang harus berstatus 'completed'
export const CASE_LIST = [
  { id: theLastDrop.id, playable: true, requires: null },
  { id: kodeDiBalikLonceng.id, playable: true, requires: 'MYS-001' },
  { id: petaYangHilang.id, playable: true, requires: 'MYS-002' },
];

export function getCase(id) {
  return CASES[id] || null;
}

export function getScript(caseId, scriptId, introScript) {
  if (scriptId === 'intro') return introScript;
  const c = CASES[caseId];
  return c ? c.scripts[scriptId] || null : null;
}