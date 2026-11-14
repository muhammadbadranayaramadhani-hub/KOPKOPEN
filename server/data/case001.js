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
  if (inc !== FACTS.increase) throw new Error(`Fakta tidak konsisten: ${FACTS.investigationDay} - ${FACTS.normal} = ${inc}, bukan ${FACTS.increase}`);
  if (sessions !== FACTS.increase) throw new Error(`Fakta tidak konsisten: ${FACTS.extraSessions} x ${FACTS.litersPerSession} = ${sessions}`);
  const nf = C.resolution.numberFill;
  if (nf.increase !== FACTS.increase || nf.sessions !== FACTS.extraSessions || nf.perSession !== FACTS.litersPerSession) {
    throw new Error('Data frontend (numberFill) tidak cocok dengan fakta resmi server.');
  }
  if (C.challenges[0].steps[0].answer !== FACTS.increase) throw new Error('Jawaban tantangan m1 tidak cocok dengan fakta resmi.');
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
    concepts: [
      'Analisis kuantitatif: bedakan nilai aktual, nilai acuan, dan perubahan absolut.',
      'Perubahan absolut diperoleh dari nilai aktual dikurangi nilai acuan.',
      'Persentase perubahan dihitung dengan membandingkan perubahan absolut terhadap nilai acuan.',
      'Pada kasus ini, perubahan absolut 360 liter setara dengan kenaikan 30% dari pemakaian normal 1.200 liter.'
    ],
    pitfalls: [
      'Menganggap nilai aktual sebagai besar kenaikan.',
      'Menggunakan nilai aktual sebagai penyebut persentase, bukan nilai acuan.',
      'Mencampuradukkan perubahan absolut dengan perubahan relatif.'
    ],
    grade: 'X–XII'
  },
  'm2-1': {
    concepts: [
      'Pemodelan matematika: total volume merupakan hasil kali frekuensi kegiatan dan volume setiap kegiatan.',
      'Representasikan informasi dalam model V = n × v.',
      'Periksa konsistensi satuan sebelum melakukan operasi hitung.'
    ],
    pitfalls: [
      'Menjumlahkan frekuensi dengan volume per kegiatan.',
      'Menggunakan volume satu sesi sebagai total seluruh sesi.',
      'Mengabaikan satuan dalam interpretasi hasil.'
    ],
    grade: 'X–XII'
  },
  'm2-2': {
    concepts: [
      'Validasi hipotesis kuantitatif dengan membandingkan hasil dari dua sumber data independen.',
      'Kesesuaian nilai numerik dapat mendukung suatu penjelasan, tetapi tetap perlu ditinjau bersama bukti kontekstual.',
      'Bedakan korelasi atau kesesuaian angka dari bukti sebab-akibat.'
    ],
    pitfalls: [
      'Menganggap kesamaan angka sebagai bukti tunggal yang mutlak.',
      'Menyimpulkan kebocoran tanpa bukti pendukung.',
      'Mengabaikan kemungkinan penjelasan alternatif yang sesuai dengan data.'
    ],
    grade: 'X–XII'
  },
  's1-1': {
    concepts: [
      'Siklus hidrologi melibatkan evaporasi, kondensasi, presipitasi, infiltrasi, dan aliran permukaan.',
      'Air bersirkulasi secara alami, tetapi ketersediaan air tawar yang mudah diakses dan layak digunakan terbatas.',
      'Pengelolaan sumber daya air perlu mempertimbangkan ketersediaan, kualitas, dan kebutuhan.'
    ],
    pitfalls: [
      'Menganggap seluruh air di bumi tersedia sebagai air bersih siap pakai.',
      'Menyamakan keberadaan air dengan ketersediaan air tawar.',
      'Mengabaikan dampak penggunaan berlebihan terhadap sumber air setempat.'
    ],
    grade: 'X–XII'
  },
  's1-2': {
    concepts: [
      'Evaporasi dipengaruhi oleh suhu, luas permukaan, kelembapan, dan pergerakan udara.',
      'Penyiraman pagi atau sore dapat mengurangi kehilangan air akibat evaporasi pada kondisi tertentu.',
      'Konservasi air mencakup pengurangan pemborosan, pemanfaatan air hujan, dan pemeliharaan infrastruktur.'
    ],
    pitfalls: [
      'Menganggap seluruh air yang disiram akan diserap tanaman.',
      'Mengabaikan pengaruh kondisi lingkungan terhadap evaporasi.',
      'Menganggap penghematan hanya dilakukan dengan mengurangi frekuensi penyiraman.'
    ],
    grade: 'X–XII'
  },
  'i1-1': {
    concepts: [
      'Analisis teks: identifikasi gagasan utama, informasi pendukung, dan detail yang tidak relevan.',
      'Simpulkan isi kesaksian dengan memperhatikan siapa, apa, kapan, dan alasan suatu peristiwa.',
      'Kesimpulan harus sesuai dengan informasi eksplisit dalam teks dan tidak menambahkan asumsi.'
    ],
    pitfalls: [
      'Menganggap detail menarik sebagai gagasan utama.',
      'Menambahkan informasi yang tidak dinyatakan oleh narasumber.',
      'Mengabaikan konteks waktu dan alasan dalam kesaksian.'
    ],
    grade: 'X–XII'
  },
  'i1-2': {
    concepts: [
      'Evaluasi hipotesis dilakukan dengan mengelompokkan bukti berdasarkan relevansinya.',
      'Bukti dapat mendukung, melemahkan, atau tidak berkaitan dengan hipotesis.',
      'Penjelasan alternatif yang konsisten dengan data dapat melemahkan kebutuhan terhadap hipotesis awal.',
      'Kekuatan kesimpulan bergantung pada kualitas dan keterkaitan bukti, bukan banyaknya pernyataan.'
    ],
    pitfalls: [
      'Menganggap semua informasi dalam kesaksian relevan.',
      'Menganggap tidak adanya bukti sebagai bukti mutlak bahwa suatu peristiwa tidak terjadi.',
      'Tidak membedakan bukti langsung dan informasi yang hanya bersifat kontekstual.'
    ],
    grade: 'X–XII'
  }
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
