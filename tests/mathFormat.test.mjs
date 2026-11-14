import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMathText, mathToPlain } from '../src/utils/mathFormat.js';

const plain = (s) => mathToPlain(parseMathText(s));
const maths = (s) => parseMathText(s).filter((n) => n.t === 'math');

test('soal turunan: pecahan K(t) tampil sebagai pecahan bertumpuk', () => {
  const q = 'Konsentrasi zat (dalam mg/L) setelah t menit dirumuskan oleh fungsi K(t) = (2t^2 + 8t) / (t + 2). Detektif ingin tahu laju pada menit ke-2 (t = 2). Berapakah laju dalam mg/L per menit?';
  const nodes = parseMathText(q);
  const m = maths(q);
  assert.equal(m.length, 2);
  assert.equal(m[0].display, true);
  assert.equal(m[0].c.some((n) => n.t === 'frac'), true);
  assert.equal(mathToPlain(m[0].c), 'K(t) = (2t² + 8t) ÷ (t + 2)');
  assert.equal(mathToPlain(m[1].c), 't = 2');
  assert.equal(m[1].display, false);
  const all = mathToPlain(nodes);
  assert.ok(all.includes('(dalam mg/L)'), 'satuan mg/L tidak dijadikan pecahan');
  assert.ok(!all.includes('^'), 'tidak ada ^ mentah');
  assert.ok(all.includes('Detektif ingin tahu'));
  assert.ok(!all.includes('). Detektif'), 'titik setelah rumus tampilan dibuang');
});

test('LaTeX dibersihkan', () => {
  assert.equal(plain('Hitung $\\frac{x^2+1}{x-3}$ untuk x = 2.'), 'Hitung (x² + 1) ÷ (x − 3) untuk x = 2.');
  assert.equal(plain('Nilai \\(\\sqrt{16} \\times 3\\) adalah'), 'Nilai √(16) × 3 adalah');
  assert.ok(!plain('$$\\frac{1}{2}mv^{2}$$').includes('\\'));
  assert.equal(plain('$\\le \\pi$').trim(), '≤ π');
});

test('pangkat dan indeks di teks biasa', () => {
  assert.equal(plain('Luas 25 m^2 dan 10^-3 kg'), 'Luas 25 m² dan 10⁻³ kg');
  assert.equal(plain('Energi E_k = 5 J'), 'Energi E_k = 5 J');
  assert.equal(plain('x^(n+1)'), 'x^(n + 1)');
});

test('satuan dan teks biasa tidak berubah', () => {
  for (const s of ['Kecepatan 20 m/s ke utara', 'Debit 5 L/menit dan km/jam', 'Halo dunia, ini kalimat biasa.', 'snake_case_word tetap']) {
    assert.equal(plain(s), s);
  }
  assert.equal(parseMathText('Halo').length, 1);
});

test('persamaan sederhana dengan satuan berhenti sebelum satuan', () => {
  assert.equal(plain('Jika v = 20 m/s maka'), 'Jika v = 20 m/s maka');
  assert.equal(maths('Jika x = 5 maka y')[0].raw, 'x = 5');
});

test('simbol perkalian dan pertidaksamaan', () => {
  assert.equal(plain('f(x) = 3*x - 2'), 'f(x) = 3·x − 2');
  assert.equal(plain('Syarat x >= 2'), 'Syarat x ≥ 2');
  assert.equal(plain('2 * 3'), '2 × 3');
});
