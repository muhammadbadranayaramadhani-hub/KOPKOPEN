import { theLastDrop } from './theLastDrop.js';

// Kasus yang bisa dimainkan. Tambahkan kasus baru di sini.
export const CASES = {
  [theLastDrop.id]: theLastDrop,
};

// Daftar tampilan Arsip Kasus, termasuk map yang masih terkunci (teaser).
export const CASE_LIST = [
  { id: theLastDrop.id, playable: true },
  {
    id: 'MYS-002',
    playable: false,
    title: 'Kode di Balik Lonceng',
    tagline: 'Lonceng akademi berbunyi pada jam yang salah.',
    subjects: ['Matematika', 'IPS'],
  },
  {
    id: 'MYS-003',
    playable: false,
    title: 'Peta yang Hilang',
    tagline: 'Sebuah peta lama lenyap dari ruang arsip.',
    subjects: ['IPS', 'Bahasa Indonesia'],
  },
];

export function getCase(id) {
  return CASES[id] || null;
}

export function getScript(caseId, scriptId, introScript) {
  if (scriptId === 'intro') return introScript;
  const c = CASES[caseId];
  return c ? c.scripts[scriptId] || null : null;
}
