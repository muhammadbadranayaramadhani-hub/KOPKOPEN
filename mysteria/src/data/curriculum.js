// Cakupan pendidikan SMA/MA Kelas X–XII (Kurikulum Merdeka). Dipakai bersama oleh frontend dan backend.
// Catatan: ketersediaan mata pelajaran berbeda-beda per sekolah (terutama mapel pilihan Fase F), jadi daftar ini
// hanya pilihan di dalam game, bukan klaim tentang kurikulum resmi sekolah tertentu.

export const GRADES = [
  { id: 'X', label: 'Kelas X', fase: 'E' },
  { id: 'XI', label: 'Kelas XI', fase: 'F' },
  { id: 'XII', label: 'Kelas XII', fase: 'F' },
];

export const DIFFICULTIES = [
  { id: 'mudah', label: 'Mudah', desc: 'Pemahaman dasar dan konsep fundamental.' },
  { id: 'menengah', label: 'Menengah', desc: 'Penerapan, analisis, dan pemecahan masalah.' },
  { id: 'hots', label: 'HOTS', desc: 'Penalaran tingkat tinggi: evaluasi, logika, dan masalah kompleks.' },
];

const ALL = ['X', 'XI', 'XII'];
export const SUBJECTS = [
  { id: 'indonesia', label: 'Bahasa Indonesia', group: 'umum', grades: ALL },
  { id: 'inggris', label: 'Bahasa Inggris', group: 'umum', grades: ALL },
  { id: 'matematika', label: 'Matematika', group: 'umum', grades: ALL, numeric: true },
  { id: 'pancasila', label: 'Pendidikan Pancasila', group: 'umum', grades: ALL },
  { id: 'sejarah', label: 'Sejarah', group: 'umum', grades: ALL },
  { id: 'pjok', label: 'PJOK', group: 'umum', grades: ALL },
  { id: 'seni', label: 'Seni dan Budaya', group: 'umum', grades: ALL },
  { id: 'fisika', label: 'Fisika', group: 'lainnya', grades: ALL, numeric: true },
  { id: 'kimia', label: 'Kimia', group: 'lainnya', grades: ALL, numeric: true },
  { id: 'biologi', label: 'Biologi', group: 'lainnya', grades: ALL },
  { id: 'ekonomi', label: 'Ekonomi', group: 'lainnya', grades: ALL, numeric: true },
  { id: 'geografi', label: 'Geografi', group: 'lainnya', grades: ALL },
  { id: 'sosiologi', label: 'Sosiologi', group: 'lainnya', grades: ALL },
  { id: 'antropologi', label: 'Antropologi', group: 'lainnya', grades: ['XI', 'XII'] },
  { id: 'informatika', label: 'Informatika', group: 'lainnya', grades: ALL },
];

export const GRADE_IDS = GRADES.map((g) => g.id);
export const DIFFICULTY_IDS = DIFFICULTIES.map((d) => d.id);
export const SUBJECT_IDS = SUBJECTS.map((s) => s.id);
export const NUMERIC_SUBJECT_IDS = SUBJECTS.filter((s) => s.numeric).map((s) => s.id);
export const DEFAULT_LEARNER = Object.freeze({ grade: 'X', subject: 'matematika', difficulty: 'menengah' });

export const subjectsFor = (grade) => SUBJECTS.filter((s) => s.grades.includes(grade));
export const findGrade = (id) => GRADES.find((g) => g.id === id);
export const findSubject = (id) => SUBJECTS.find((s) => s.id === id);
export const findDifficulty = (id) => DIFFICULTIES.find((d) => d.id === id);

// Merapikan profil belajar dari data simpanan; nilai tak dikenal diganti bawaan.
export function normalizeLearner(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const grade = GRADE_IDS.includes(r.grade) ? r.grade : DEFAULT_LEARNER.grade;
  let subject = SUBJECT_IDS.includes(r.subject) ? r.subject : DEFAULT_LEARNER.subject;
  if (!findSubject(subject).grades.includes(grade)) subject = DEFAULT_LEARNER.subject;
  const difficulty = DIFFICULTY_IDS.includes(r.difficulty) ? r.difficulty : DEFAULT_LEARNER.difficulty;
  return { grade, subject, difficulty };
}

// Topik contoh per mapel (bahan ide untuk NYX). Model diminta memilih yang sesuai kelas dan mengakui bila ragu.
export const TOPIC_HINTS = {
  matematika: ['fungsi dan grafik', 'eksponen dan logaritma', 'barisan dan deret', 'trigonometri', 'statistika', 'peluang', 'matriks', 'program linear', 'limit dan turunan'],
  fisika: ['gerak lurus', 'hukum Newton', 'usaha dan energi', 'momentum dan impuls', 'fluida', 'suhu dan kalor', 'gelombang', 'listrik dinamis'],
  kimia: ['stoikiometri', 'struktur atom', 'ikatan kimia', 'larutan asam basa', 'termokimia', 'laju reaksi', 'redoks'],
  biologi: ['keanekaragaman hayati', 'sel', 'sistem pencernaan', 'sistem peredaran darah', 'genetika', 'ekosistem', 'bioteknologi'],
  ekonomi: ['permintaan dan penawaran', 'elastisitas', 'inflasi', 'akuntansi dasar', 'pasar', 'APBN dan APBD'],
  geografi: ['peta dan penginderaan jauh', 'litosfer', 'hidrosfer dan siklus air', 'mitigasi bencana', 'dinamika penduduk'],
  sosiologi: ['interaksi sosial', 'kelompok sosial', 'konflik dan integrasi', 'perubahan sosial', 'penelitian sosial'],
  antropologi: ['kebudayaan', 'etnografi', 'keragaman budaya Indonesia', 'perubahan budaya'],
  sejarah: ['kerajaan Hindu-Buddha dan Islam di Nusantara', 'kolonialisme', 'pergerakan nasional', 'proklamasi dan revolusi', 'sumber sejarah'],
  pancasila: ['nilai Pancasila', 'UUD 1945', 'hak dan kewajiban warga negara', 'Bhinneka Tunggal Ika', 'demokrasi'],
  indonesia: ['teks argumentasi', 'teks eksposisi', 'teks laporan hasil observasi', 'kalimat efektif', 'karya ilmiah', 'puisi dan cerpen'],
  inggris: ['reading comprehension', 'descriptive text', 'recount text', 'narrative text', 'analytical exposition', 'conditional sentences'],
  informatika: ['algoritma dan pemrograman', 'berpikir komputasional', 'jaringan komputer', 'keamanan digital', 'data dan analisis data', 'kecerdasan artifisial'],
  seni: ['unsur seni rupa', 'seni musik', 'seni teater', 'seni tari', 'apresiasi karya seni'],
  pjok: ['kebugaran jasmani', 'permainan bola', 'gizi dan pola hidup sehat', 'cedera dan P3K', 'senam'],
};
