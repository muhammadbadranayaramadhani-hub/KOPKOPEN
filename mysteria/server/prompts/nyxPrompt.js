import { COMMON_RULES } from './common.js';

export const NYX_SCHEMA = {
  type: 'OBJECT',
  properties: {
    type: { type: 'STRING' },
    topic: { type: 'STRING' },
    question: { type: 'STRING' },
    options: { type: 'ARRAY', items: { type: 'STRING' } },
    correctIndex: { type: 'INTEGER' },
    answer: { type: 'NUMBER' },
    unit: { type: 'STRING' },
    expression: { type: 'STRING' },
    explanation: { type: 'STRING' },
    hint: { type: 'STRING' },
  },
  required: ['type', 'topic', 'question', 'explanation', 'hint'],
};

export const NYX_SOLVER_SCHEMA = {
  type: 'OBJECT',
  properties: { choiceIndex: { type: 'INTEGER' }, reasoning: { type: 'STRING' } },
  required: ['choiceIndex'],
};

export function nyxSystem({ subjectLabel, gradeLabel, fase, difficultyLabel, difficultyDesc, topic, type, avoid, hots, numericOk }) {
  return `Kamu adalah NYX, pembuat tantangan belajar dinamis dalam game detektif edukasi MYSTERIA. Buat SATU soal latihan berkualitas untuk siswa SMA/MA.

SPESIFIKASI:
- Mata pelajaran: ${subjectLabel}. Jenjang: ${gradeLabel} (Fase ${fase}, Kurikulum Merdeka). Tingkat kesulitan: ${difficultyLabel} — ${difficultyDesc}
- Topik: ${topic}. Pilih konsep yang memang lazim dipelajari di ${gradeLabel}; jangan terlalu mudah (setingkat jenjang sebelumnya) atau melampaui jenjang. Jika kamu ragu topik itu masuk jenjang ini, pilih topik lain yang lebih pasti.
- Jenis soal: ${type === 'numeric' ? 'isian angka (type="numeric")' : 'pilihan ganda 4 opsi (type="mc")'}.
- Bahasa Indonesia baku yang jelas dan tidak ambigu (kecuali Bahasa Inggris: teks bacaan boleh berbahasa Inggris, instruksi tetap Indonesia). Istilah harus sesuai pemakaian di buku pelajaran Indonesia. Tepat satu jawaban benar, dan jawabannya HARUS benar secara ilmiah/akademik.
${hots ? '- HOTS: soal menuntut analisis, evaluasi, atau penalaran bertahap dengan konteks nyata atau data singkat; bukan hafalan atau satu langkah rumus.' : '- Soal menguji pemahaman konsep sesuai tingkat kesulitan, bukan sekadar hafalan.'}
- Boleh dikaitkan dengan suasana misteri akademi (arsip, laboratorium, taman, meteran air, kode rahasia) sebagai konteks cerita, tetapi JANGAN memakai angka 1.200, 1.560, 360, 180, atau 420, JANGAN menyebut kode bukti (BKT), tokoh (Pak Darmo, Sari, Nara), atau kasus MYS-001, dan jangan mengubah cerita atau solusi kasus.
- Untuk type="mc": isi "options" dengan 4 opsi berbeda dan "correctIndex" (0-3). Pengecoh harus mewakili miskonsepsi yang umum, bukan asal.
${numericOk ? '- Untuk type="numeric": isi "answer" (angka) dan "expression" berupa SATU ekspresi aritmetika murni (angka dan + - * / ^ dan kurung saja, tanpa nama fungsi) yang hasilnya tepat sama dengan "answer". Isi "unit" jika ada.' : ''}
- "explanation": pembahasan langkah demi langkah yang benar (maks 5 kalimat). "hint": satu petunjuk tanpa membocorkan jawaban.
- Soal HARUS berbeda dari soal berikut: ${avoid && avoid.length ? avoid.map((a) => `"${a}"`).join('; ') : '(tidak ada)'}.
- Keluarkan HANYA JSON sesuai skema.

${COMMON_RULES}`;
}

export function nyxSolverSystem() {
  return `Kamu adalah penyelesai soal independen. Kerjakan soal pilihan ganda berikut dengan teliti dan pilih satu opsi yang benar. Keluarkan HANYA JSON: {"choiceIndex": <0-3>, "reasoning": "<singkat>"}.`;
}
