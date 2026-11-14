// Data resmi kasus MYS-001 di sisi server. SUMBER KEBENARAN untuk seluruh identitas AI.
//
// Bukti, tantangan, dan hubungan diimpor dari data frontend (src/data/cases/theLastDrop.js) agar
// tidak ada dua salinan angka yang bisa berbeda. Saat server dinyalakan, verifyFacts() memeriksa
// bahwa angka resmi konsisten secara aritmetika dan dengan data frontend.
//
// Bagian SOLUTION bersifat terlindungi: hanya dipakai ASTRA (setelah pemain mengirim kesimpulan)
// dan tidak pernah dimasukkan ke konteks RENNTZY, REI, atau NOPAL.
import { theLastDrop as C } from '../../src/data/cases/theLastDrop.js';

export const CASE_DEF = C;
export const CASE_ID = C.id;

export const FACTS = Object.freeze({
  normal: 1200,
  investigationDay: 1560,
  increase: 360,
  extraSessions: 2,
  litersPerSession: 180,
  attendance: 420,
});

// Angka besar yang sah muncul dalam kasus; AI tidak boleh menyebut angka besar lain tentang kasus.
export const OFFICIAL_BIG_NUMBERS = Object.freeze([1200, 1560, 360, 180, 420]);

export function verifyFacts() {
  const inc = FACTS.investigationDay - FACTS.normal;
  const sessions = FACTS.extraSessions * FACTS.litersPerSession;
  if (inc !== FACTS.increase) {
    throw new Error(`Fakta tidak konsisten: ${FACTS.investigationDay} - ${FACTS.normal} = ${inc}, bukan ${FACTS.increase}`);
  }
  if (sessions !== FACTS.increase) {
    throw new Error(`Fakta tidak konsisten: ${FACTS.extraSessions} x ${FACTS.litersPerSession} = ${sessions}`);
  }
  const nf = C.resolution.numberFill;
  if (nf.increase !== FACTS.increase || nf.sessions !== FACTS.extraSessions || nf.perSession !== FACTS.litersPerSession) {
    throw new Error('Data frontend (numberFill) tidak cocok dengan fakta resmi server.');
  }
  if (C.challenges[0].steps[0].answer !== FACTS.increase) {
    throw new Error('Jawaban tantangan m1 tidak cocok dengan fakta resmi.');
  }
  return true;
}
verifyFacts();

export const EVIDENCE = C.evidence;
export const EVIDENCE_IDS = C.evidenceOrder;
export const CORE_EVIDENCE = C.coreEvidence;
export const CHALLENGES = Object.fromEntries(C.challenges.map((c) => [c.id, c]));
export const CHALLENGE_IDS = C.challenges.map((c) => c.id);
export const CONNECTIONS = Object.fromEntries(C.connections.map((c) => [c.id, c]));
export const CONNECTION_IDS = C.connections.map((c) => c.id);
export const KEY_CONNECTION_IDS = C.connections.filter((c) => c.key).map((c) => c.id);
export const LOCATION_IDS = Object.keys(C.locations);

// Lokasi umum tempat sebuah bukti ditemukan (dipakai untuk petunjuk tingkat 2, tanpa isi bukti).
export function evidenceLocationName(evId) {
  for (const loc of Object.values(C.locations)) {
    if (loc.objects.some((o) => o.evidence === evId)) return loc.name;
  }
  if (evId === 'E5') return C.locations.hallway.name; // lewat wawancara
  return null;
}

// Catatan guru untuk NOPAL per langkah tantangan: konsep & kekeliruan umum, TANPA jawaban akhir.
export const TUTOR_NOTES = Object.freeze({
  'm1-1': {
    concepts: ['Selisih dua jumlah dicari dengan pengurangan: jumlah yang lebih besar dikurangi yang lebih kecil.', 'Membaca tabel: cocokkan baris dengan kolom.'],
    pitfalls: ['Menjumlahkan kedua angka padahal yang ditanya selisih.', 'Menjawab dengan salah satu angka dalam tabel.'],
    grade: 'VII',
  },
  'm2-1': {
    concepts: ['Perkalian adalah penjumlahan berulang.', 'Banyak kelompok x isi tiap kelompok = jumlah seluruhnya.'],
    pitfalls: ['Menjumlahkan banyak sesi dengan liter per sesi.', 'Lupa bahwa ada lebih dari satu sesi.'],
    grade: 'VII',
  },
  'm2-2': {
    concepts: ['Membandingkan dua hasil hitungan dari dua sumber berbeda.', 'Dua angka yang sama dari sumber berbeda memperkuat dugaan.'],
    pitfalls: ['Menganggap angka yang sama sebagai kebetulan.', 'Menyimpulkan ada kebocoran tanpa bukti.'],
    grade: 'VII',
  },
  's1-1': {
    concepts: ['Siklus air: air tidak hilang dari bumi.', 'Air bersih yang layak dipakai jumlahnya terbatas.'],
    pitfalls: ['Mengira air hilang selamanya jika dipakai.', 'Mengira menghemat air otomatis menghasilkan listrik.'],
    grade: 'VII',
  },
  's1-2': {
    concepts: ['Penguapan lebih cepat saat suhu tinggi sehingga menyiram pagi/sore lebih hemat.', 'Menutup keran, menampung air hujan, melaporkan kebocoran.'],
    pitfalls: ['Menyiram saat siang terik.', 'Membiarkan keran menyala saat tidak dipakai.'],
    grade: 'VII',
  },
  'i1-1': {
    concepts: ['Informasi utama adalah hal terpenting yang disampaikan penutur, biasanya jawaban atas apa, siapa, kapan, mengapa.'],
    pitfalls: ['Memilih detail kecil sebagai informasi utama.', 'Memilih pernyataan yang tidak disebut dalam teks.'],
    grade: 'VII',
  },
  'i1-2': {
    concepts: ['Fakta yang memberi penjelasan lain melemahkan suatu hipotesis.', 'Tidak semua kalimat dalam kesaksian relevan.'],
    pitfalls: ['Menganggap semua kalimat mendukung hipotesis.', 'Tidak memisahkan fakta relevan dan tidak relevan.'],
    grade: 'VII',
  },
});

// ---------- BAGIAN TERLINDUNGI ----------
const correctOption = C.resolution.options.find((o) => o.correct);
export const SOLUTION = Object.freeze({
  optionId: correctOption.id,
  optionText: correctOption.text,
  headline: C.resolution.solution.headline,
  story: C.resolution.solution.story,
  requiredEvidence: C.resolution.requiredEvidence,
  numberFill: C.resolution.numberFill,
  reasoningChecks: C.resolution.reasoningChecks,
  minReasonLength: C.resolution.minReasonLength,
  // Bukti yang membantu menyingkirkan dugaan lain (bocor / meteran rusak / murid bertambah).
  contrastEvidence: ['E1', 'E2', 'E4'],
});

// Ringkasan publik premis kasus (aman untuk semua identitas AI).
export function caseBrief() {
  return `Kasus ${C.id} "${C.title}". ${C.synopsis} Tempat: ${C.place}.`;
}
