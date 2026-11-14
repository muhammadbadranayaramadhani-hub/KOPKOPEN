// =====================================================================
// KASUS MYS-002 — KODE DI BALIK LONCENG (JENJANG SMA)
// DATA ANGKA (konsisten):
//   Jadwal resmi lonceng pagi : 07.00
//   Lonceng berbunyi          : 06.36
//   Selisih waktu             : 24 menit lebih awal
//   Roda gigi pengatur        : 3 takik x 8 menit/takik = 24 menit
//   Periode bandul menara     : 10 ayunan dalam 20 sekon -> T = 2 sekon
// =====================================================================

const BELL_EVIDENCE = {
  E1: {
    id: 'E1',
    code: 'BKT-01',
    title: 'Jadwal Lonceng Akademi',
    summary: 'Jadwal resmi lonceng pagi pukul 07.00, namun pada hari Jumat berbunyi pukul 06.36 (selisih 24 menit lebih awal).',
    table: {
      headers: ['Keterangan', 'Waktu', 'Selisih dari Jadwal'],
      rows: [
        ['Jadwal Resmi Lonceng Pagi', '07.00', '0 menit'],
        ['Bunyi Lonceng Hari Jumat', '06.36', '24 menit lebih awal'],
      ],
    },
  },
  E2: {
    id: 'E2',
    code: 'BKT-02',
    title: 'Catatan Mekanik & Bandul Menara',
    summary: 'Bandul berayun stabil 10 kali dalam 20 sekon (T = 2 sekon), tetapi tuas kalibrasi berada pada posisi +3 takik.',
  },
  E3: {
    id: 'E3',
    code: 'BKT-03',
    title: 'Prasasti Jam Matahari Taman (1924)',
    summary: 'Prasasti peninggalan pendiri akademi mencatat bahwa setiap 1 takik tuas menggeser waktu sebesar 8 menit untuk menyelaraskan waktu matahari lokal.',
    table: {
      headers: ['Pengaturan Tuas', 'Geseran Waktu'],
      rows: [
        ['1 takik', '8 menit'],
        ['3 takik', '24 menit'],
      ],
    },
  },
  E4: {
    id: 'E4',
    code: 'BKT-04',
    title: 'Daftar Periksa Menara Lonceng',
    summary: 'Pegas utama, panjang tali bandul, dan roda gigi penarik lonceng dalam kondisi normal tanpa kerusakan mekanis.',
  },
  E5: {
    id: 'E5',
    code: 'BKT-05',
    title: 'Kesaksian Sari (Panitia Festival Sejarah)',
    summary: 'Sari mengaku panitia menggeser tuas 3 takik (24 menit) untuk simulasi pembukaan Festival Sejarah Akademi sesuai waktu matahari lokal.',
  },
};

export const kodeDiBalikLonceng = {
  id: 'MYS-002',
  title: 'Kode di Balik Lonceng',
  tagline: 'Lonceng akademi berbunyi pada jam yang salah.',
  difficulty: 'Menengah',
  duration: '10–15 menit',
  subjects: ['Matematika', 'Fisika', 'Sejarah'],
  place: 'Lorong Akademi, Ruang Perawatan & Taman',
  synopsis:
    'Lonceng akademi berbunyi 24 menit lebih awal dari jadwal resmi sehingga mengacaukan jam pelajaran. Petugas menduga bandul mekanik menara rusak. Tugasmu: analisis periode gerak bandul, perhitungan waktu, dan prasasti sejarahnya.',

  evidence: BELL_EVIDENCE,
  evidenceOrder: ['E1', 'E2', 'E3', 'E4', 'E5'],
  coreEvidence: ['E1', 'E2', 'E3', 'E4', 'E5'],

  startLocation: 'hallway',
  locationOrder: ['hallway', 'maintenance', 'garden'],

  locations: {
    hallway: {
      id: 'hallway',
      name: 'Lorong Akademi',
      bg: 'hallway',
      icon: 'MapPin',
      intro: 'Siswa-siswa tampak kebingungan membandingkan jam dinding lorong dengan bunyi lonceng menara pagi tadi.',
      objects: [
        {
          id: 'darmo',
          name: 'Pak Darmo',
          kind: 'npc',
          icon: 'UserRound',
          x: 74,
          y: 69,
          description: 'Pak Darmo memegang stopwatch dan kunci ruang mekanik lonceng dengan wajah bingung.',
          script: 'interview-darmo',
          actionLabel: 'Mulai wawancara',
        },
        {
          id: 'sari',
          name: 'Sari',
          kind: 'npc',
          icon: 'UserRound',
          x: 27,
          y: 71,
          description: 'Sari membawa arsip sejarah akademi dan jadwal Festival Sejarah.',
          requires: { collected: ['E3'] },
          lockText: 'Sari sedang sibuk menyiapkan pameran sejarah. Periksa Taman Akademi dulu untuk mencari petunjuk.',
          script: 'interview-sari',
          actionLabel: 'Mulai wawancara',
        },
        {
          id: 'bell-schedule',
          name: 'Papan Jadwal Lonceng',
          kind: 'document',
          icon: 'Megaphone',
          x: 14,
          y: 48,
          description: 'Jadwal resmi lonceng akademi yang ditempel di samping jam dinding lorong.',
          details: [
            'Lonceng masuk pagi seharusnya berbunyi pukul 07.00.',
            'Catatan piket: hari Jumat lonceng berbunyi pukul 06.36.',
          ],
          table: BELL_EVIDENCE.E1.table,
          evidence: 'E1',
        },
      ],
    },

    maintenance: {
      id: 'maintenance',
      name: 'Ruang Perawatan',
      bg: 'maintenance',
      icon: 'Wrench',
      intro: 'Panel kendali roda gigi dan bandul lonceng menara terhubung ke ruangan ini.',
      objects: [
        {
          id: 'gearbox',
          name: 'Tuas Kalibrasi & Bandul',
          kind: 'object',
          icon: 'Gauge',
          x: 30,
          y: 40,
          description: 'Tuas logam dengan skala angka takik penggeser waktu serta indikator ayunan bandul.',
          details: [
            'Posisi tuas saat ini berada di angka +3 takik (bukan posisi standar 0).',
            'Pengukuran bandul: melakukan 10 getaran lengkap dalam waktu 20 sekon (periode standar T = 2 sekon).',
          ],
          evidence: 'E2',
        },
        {
          id: 'checklist',
          name: 'Daftar Periksa Menara',
          kind: 'document',
          icon: 'ClipboardCheck',
          x: 86,
          y: 36,
          description: 'Laporan pemeriksaan rutin komponen mekanik menara lonceng.',
          details: [
            'Pegas utama: Normal.',
            'Panjang lengan bandul: Tidak berubah (periode tetap 2 sekon).',
            'Kesimpulan: Tidak ada kerusakan mekanis pada mesin jam.',
          ],
          evidence: 'E4',
        },
      ],
    },

    garden: {
      id: 'garden',
      name: 'Taman Akademi',
      bg: 'garden',
      icon: 'Sprout',
      requires: { solved: ['m1'] },
      lockText: 'Pintu taman dikunci. Hitung dulu berapa menit selisih bunyi lonceng pada Tantangan Matematika.',
      intro: 'Di tengah taman berdiri jam matahari kuno (sundial) peninggalan pendiri akademi tahun 1924.',
      objects: [
        {
          id: 'sundial',
          name: 'Prasasti Jam Matahari',
          kind: 'document',
          icon: 'CalendarDays',
          x: 30,
          y: 68,
          description: 'Prasasti batu di kaki jam matahari dengan ukiran aturan konversi waktu lonceng.',
          details: [
            'Setiap 1 takik pada tuas lonceng menggeser waktu bunyi sebesar 8 menit.',
            'Digunakan pada era kolonial untuk menyelaraskan waktu lonceng dengan bayangan matahari sejati.',
          ],
          table: BELL_EVIDENCE.E3.table,
          evidence: 'E3',
        },
      ],
    },
  },

  scripts: {
    briefing: {
      id: 'briefing',
      chapter: 'Kasus MYS-002 — Pengarahan',
      start: 'b1',
      onEnd: 'toGame',
      nodes: {
        b1: {
          bg: 'archive',
          speaker: 'nara',
          expr: 'neutral',
          text: 'Kasus kedua terbuka: MYS-002. Lonceng akademi berbunyi pukul 06.36, padahal jadwal resminya pukul 07.00.',
          next: 'b2',
        },
        b2: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'worried',
          cast: ['nara', 'darmo'],
          text: 'Saya kira periode ayunan bandul menara berubah karena tua, Nak. Coba periksa jadwal di lorong dan ruang perawatan.',
          end: true,
        },
      },
    },

    'interview-darmo': {
      id: 'interview-darmo',
      chapter: 'Wawancara — Pak Darmo',
      interview: true,
      start: 'd0',
      onEnd: 'toGame',
      nodes: {
        d0: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'neutral',
          text: 'Sudah kamu hitung selisih waktu loncengnya?',
          choices: [
            { text: 'Bagaimana hasil pengukuran bandul di Ruang Perawatan?', next: 'd1' },
            { text: 'Terima kasih, Pak.', next: 'dEnd' },
          ],
        },
        d1: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'thinking',
          text: 'Bandul berayun 10 kali dalam 20 sekon—masih normal. Anehnya, tuas penggesernya berada di posisi +3 takik.',
          next: 'd0',
        },
        dEnd: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'happy',
          text: 'Kabari saya kalau kamu tahu arti 3 takik itu.',
          end: true,
        },
      },
    },

    'interview-sari': {
      id: 'interview-sari',
      chapter: 'Wawancara — Sari',
      interview: true,
      start: 's0',
      onEnd: 'toGame',
      nodes: {
        s0: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'surprised',
          text: 'Kamu menyelidiki soal lonceng pagi tadi?',
          choices: [
            { text: 'Aku membaca prasasti jam matahari (1 takik = 8 menit). Ada hubungannya dengan festival?', next: 's1' },
            { text: 'Terima kasih, Sari.', next: 'sEnd' },
          ],
        },
        s1: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'worried',
          text: 'Maaf! Panitia Festival Sejarah menggeser tuas 3 takik (24 menit) untuk simulasi waktu matahari lokal tahun 1924, lalu lupa mengembalikannya ke 0.',
          effects: [{ type: 'collect', id: 'E5' }],
          next: 's0',
        },
        sEnd: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'happy',
          text: 'Terima kasih sudah membantu meluruskan masalah ini!',
          end: true,
        },
      },
    },

    epilogue: {
      id: 'epilogue',
      chapter: 'Kasus MYS-002 — Epilog',
      start: 'e1',
      onEnd: 'toResult',
      nodes: {
        e1: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Tepat sekali, {player}! Selisih 24 menit cocok dengan 3 takik × 8 menit, dan periode bandul menara tetap normal 2 sekon.',
          next: 'e2',
        },
        e2: {
          bg: 'garden',
          speaker: 'darmo',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Syukurlah mesinnya sehat. Saya kembalikan tuasnya ke posisi 0 sekarang!',
          end: true,
        },
      },
    },
  },

challenges: [
    {
      id: 'm1',
      subject: 'matematika',
      title: 'Hitung Selisihnya',
      icon: 'Calculator',
      unlock: { collected: ['E1'] },
      lockText: 'Temukan Catatan Pemakaian Harian di Ruang Perawatan.',
      scenario:
        'Pak Darmo menunggu jawabanmu sebelum membuka pintu taman. Lihat tabel Laporan Konsumsi Air Harian di Jurnal.',
      evidenceRef: 'E1',
      unlocksText: 'Pak Darmo membuka kunci taman. Lokasi baru: Taman Akademi.',
      steps: [
        {
          id: 'm1-1',
          type: 'numeric',
          prompt:
            'Berapa liter lebih banyak pemakaian air pada hari penyelidikan (Rabu) dibandingkan pemakaian normal?',
          unit: 'liter',
          answer: 360,
          table: BELL_EVIDENCE.E1.table,
          hints: [
            'Kata "lebih banyak dari" berarti kamu perlu membandingkan dua angka. Angka mana yang dibandingkan?',
            'Membandingkan dua jumlah untuk tahu berapa bedanya dilakukan dengan pengurangan.',
            'Kurangi angka hari penyelidikan dengan angka normal. Misalnya 1.560 − 1.000 dulu, lalu kurangi 200 lagi.',
          ],
          wrong: {
            2760: 'Kamu menjumlahkan kedua angka. Padahal yang ditanya adalah selisih, yaitu seberapa besar kenaikannya.',
            1560: '1.560 liter adalah total pemakaian pada hari itu, bukan kenaikannya.',
            1200: '1.200 liter adalah pemakaian normal. Yang ditanya adalah berapa liter tambahannya.',
          },
          wrongDefault:
            'Belum tepat. Coba periksa lagi angka dalam tabel dan operasi hitung yang kamu pakai.',
          explain:
            'Selisih = 1.560 − 1.200 = 360 liter. Selisih (hasil pengurangan) menunjukkan seberapa besar suatu jumlah bertambah atau berkurang.',
          link:
            'Ada 360 liter air yang tidak biasa dipakai pada hari itu. Sekarang pertanyaannya: ke mana perginya air itu? Taman kini terbuka untuk diselidiki.',
        },
      ],
    },
    {
      id: 'f1',
      subject: 'fisika',
      title: 'Analisis Periode Bandul',
      icon: 'FlaskConical',
      unlock: { collected: ['E2'] },
      lockText: 'Periksa Tuas Kalibrasi & Bandul di Ruang Perawatan.',
      scenario: 'Pastikan mesin penggerak lonceng tidak mengalami perubahan periode ayunan.',
      evidenceRef: 'E2',
      steps: [
        {
          id: 'f1-1',
          type: 'numeric',
          prompt: 'Bandul menara lonceng melakukan 10 ayunan penuh dalam waktu 20 sekon. Berapa sekon periode (T) bandul tersebut?',
          unit: 'sekon',
          answer: 2,
          hints: [
            'Periode (T) adalah waktu yang dibutuhkan untuk melakukan 1 getaran penuh (T = t / n).',
            'Bagi waktu total (20 sekon) dengan jumlah ayunan (10 kali).',
          ],
          wrongDefault: 'Belum tepat. Gunakan rumus periode bandul T = waktu / jumlah ayunan.',
          explain: 'Periode bandul T = t / n = 20 sekon / 10 ayunan = 2 sekon, sesuai standar pabrik.',
          link: 'Periode bandul tepat 2 sekon, membuktikan mesin tidak melambat maupun mempercepat.',
        },
      ],
    },
    {
      id: 'm2',
      subject: 'matematika',
      title: 'Konversi Takik Roda Gigi',
      icon: 'Calculator',
      unlock: { collected: ['E3'] },
      lockText: 'Temukan Prasasti Jam Matahari di Taman Akademi.',
      scenario: 'Setiap 1 takik menggeser waktu 8 menit, dan tuas berada di posisi +3 takik.',
      evidenceRef: 'E3',
      steps: [
        {
          id: 'm2-1',
          type: 'numeric',
          prompt: 'Jika 1 takik menggeser waktu 8 menit, berapa menit total pergeseran untuk 3 takik?',
          unit: 'menit',
          answer: 24,
          hints: [
            'Kalikan jumlah takik dengan besar geseran per takik.',
            'Hitung 3 × 8.',
          ],
          wrongDefault: 'Belum tepat. Kalikan 3 takik dengan 8 menit.',
          explain: '3 takik × 8 menit = 24 menit, sama persis dengan selisih bunyi lonceng.',
          link: 'Angka 24 menit cocok sempurna dengan selisih lonceng!',
        },
      ],
    },
  ],

  connections: [
    {
      id: 'C1',
      pair: ['E1', 'E3'],
      key: true,
      statements: [
        { id: 'a', text: 'Selisih waktu lonceng (24 menit) sama dengan pergeseran 3 takik pada prasasti sejarah (3 × 8 menit).', correct: true, why: '' },
        { id: 'b', text: 'Lonceng berbunyi lebih awal karena baterai jam habis.', correct: false, why: 'Tidak ada bukti baterai habis.' },
      ],
      reasons: [
        { id: 'r1', text: 'Karena 60 − 36 = 24 menit dan 3 × 8 menit = 24 menit, angkanya sama persis.', correct: true, why: '' },
        { id: 'r2', text: 'Karena keduanya ditemukan pada hari yang sama.', correct: false, why: 'Kecocokan angka yang membuktikannya.' },
      ],
      insight: 'Selisih 24 menit berasal dari pengaturan 3 takik pada tuas lonceng.',
    },
    {
      id: 'C2',
      pair: ['E2', 'E4'],
      key: true,
      statements: [
        { id: 'a', text: 'Periode bandul tetap normal (T = 2 sekon) dan daftar periksa sehat, menandakan lonceng sengaja digeser bukan rusak.', correct: true, why: '' },
        { id: 'b', text: 'Pegas menara patah sehingga periode bandul berubah drastis.', correct: false, why: 'Daftar periksa menyatakan semua komponen normal.' },
      ],
    reasons: [
        { id: 'r1', text: 'Karena periode bandul T = 2 sekon tetap normal dan tuas terpasang rapi di skala +3.', correct: true, why: '' },
        { id: 'r2', text: 'Karena menara lonceng sudah tua.', correct: false, why: 'Usia menara bukan bukti.' },
      ],
      insight: 'Tidak ada kerusakan mekanis maupun perubahan periode bandul pada menara lonceng.',
    },
  ],
  keyConnectionsNeeded: 2,

  objectives: [
    { id: 'o1', text: 'Periksa Papan Jadwal Lonceng', where: 'Lorong Akademi', done: { collected: ['E1'] } },
    { id: 'o2', text: 'Periksa Tuas Kalibrasi & Daftar Periksa Menara', where: 'Ruang Perawatan', done: { collected: ['E2', 'E4'] } },
    { id: 'o3', text: 'Selesaikan tantangan Matematika: Hitung Selisih Waktu', where: 'Tantangan', done: { solved: ['m1'] }, available: { collected: ['E1'] } },
    { id: 'o4', text: 'Selesaikan tantangan Fisika: Analisis Periode Bandul', where: 'Tantangan', done: { solved: ['f1'] }, available: { collected: ['E2'] } },
    { id: 'o5', text: 'Periksa Prasasti Jam Matahari di Taman', where: 'Taman Akademi', done: { collected: ['E3'] }, available: { solved: ['m1'] } },
    { id: 'o6', text: 'Wawancarai Sari tentang Festival Sejarah', where: 'Lorong Akademi', done: { collected: ['E5'] }, available: { collected: ['E3'] } },
    { id: 'o7', text: 'Selesaikan tantangan Matematika: Konversi Takik Roda Gigi', where: 'Tantangan', done: { solved: ['m2'] }, available: { collected: ['E3'] } },
    { id: 'o8', text: 'Buktikan 2 hubungan inti di Papan Bukti', where: 'Papan Bukti', done: { connections: 2 }, available: { collected: ['E1', 'E3'] } },
    { id: 'o9', text: 'Susun kesimpulan akhir kasus', where: 'Kesimpulan', done: { finalSolved: true }, available: { ready: true } },
  ],

  resolution: {
    question: 'Apa penyebab lonceng akademi berbunyi 24 menit lebih awal?',
    options: [
      { id: 'broken', text: 'Pegas menara patah sehingga periode ayunan bandul berubah.', correct: false, why: 'Periode bandul tetap T = 2 sekon dan seluruh komponen mekanik normal.' },
      { id: 'festival', text: 'Tuas kalibrasi lonceng digeser 3 takik (24 menit) oleh panitia Festival Sejarah.', correct: true, why: '' },
    ],
    requiredEvidence: ['E1', 'E3'],
    numberFill: { increase: 24, sessions: 3, perSession: 8 },
    minReasonLength: 15,
    reasoningChecks: [
      { id: 'k1', label: 'menyebut angka 24 menit', pattern: /24/ },
      { id: 'k2', label: 'menyebut 3 takik atau 8 menit', pattern: /3|8|takik/i },
    ],
    solution: {
      headline: 'Lonceng digeser 3 takik (24 menit) untuk Festival Sejarah, bukan rusak.',
      story: [
        'Selisih antara pukul 06.36 dan 07.00 adalah 24 menit, sementara periode bandul menara tetap normal T = 2 sekon.',
        'Berdasarkan prasasti jam matahari tahun 1924, 1 takik = 8 menit, sehingga 3 takik = 24 menit. Panitia festival menggeser tuas tersebut untuk simulasi waktu matahari lokal.',
      ],
    },
  },

  concepts: [
    { subject: 'Matematika', icon: 'Calculator', text: 'Operasi satuan waktu (1 jam = 60 menit) dan perkalian kelipatan: 3 × 8 = 24 menit.' },
    { subject: 'Fisika', icon: 'FlaskConical', text: 'Periode getaran bandul sederhana (T = t / n = 20 / 10 = 2 sekon) tetap konstan selama panjang tali dan sistem mekanik tidak berubah.' },
    { subject: 'Sejarah', icon: 'BookText', text: 'Memahami penanda waktu historis (jam matahari tahun 1924) dari sumber prasasti peninggalan pendiri akademi.' },
  ],

  encouragement: 'Kamu berhasil membuktikan penyebabnya dengan perhitungan waktu dan analisis periode bandul yang presisi!',
};

export default kodeDiBalikLonceng;