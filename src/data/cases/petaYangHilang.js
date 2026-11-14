// =====================================================================
// KASUS MYS-003 — PETA YANG HILANG (JENJANG SMA)
// DATA KONSISTEN:
//   Tahun pembuatan peta : 1924
//   Kode arsip peta      : ARP-1924
//   Skala peta kuno      : 1 : 500 (1 cm di peta = 500 cm = 5 meter)
//   Jarak gerbang-taman  : 14 cm di peta = 70 meter di lapangan
// =====================================================================

const MAP_EVIDENCE = {
  E1: {
    id: 'E1',
    code: 'BKT-01',
    title: 'Buku Log Lemari Arsip',
    summary: 'Dari 12 gulungan peta kuno, gulungan berkode ARP-1924 (skala 1 : 500) tidak ada di rak sejak Kamis sore.',
    table: {
      headers: ['Kode Arsip', 'Nama Dokumen', 'Skala / Tahun', 'Status Rak'],
      rows: [
        ['ARP-1920', 'Denah Awal Gedung Utama', '1 : 200 (1920)', 'Ada di rak'],
        ['ARP-1924', 'Peta Wilayah & Taman Akademi', '1 : 500 (1924)', 'Tidak ada di rak'],
        ['ARP-1930', 'Peta Saluran Air Lama', '1 : 400 (1930)', 'Ada di rak'],
      ],
    },
  },
  E2: {
    id: 'E2',
    code: 'BKT-02',
    title: 'Pemeriksaan Kunci & Jendela',
    summary: 'Silinder kunci lemari arsip tidak rusak dan grendel jendela taman terkunci rapat dari dalam dengan lapisan debu utuh.',
  },
  E3: {
    id: 'E3',
    code: 'BKT-03',
    title: 'Slip Peminjaman Restorasi & Pemetaan',
    summary: 'Lembar izin resmi peminjaman dokumen ARP-1924 oleh Klub Sejarah & Geografi untuk pemetaan ulang tata ruang taman.',
    table: {
      headers: ['Keterangan', 'Isi Dokumen'],
      rows: [
        ['Kode Dokumen', 'ARP-1924 (Peta Wilayah & Taman 1924, Skala 1 : 500)'],
        ['Peminjam', 'Sari (Koordinator Pameran Sejarah & Geografi)'],
        ['Tujuan', 'Digitalisasi Spasial & Pameran Sejarah Akademi'],
      ],
    },
  },
  E4: {
    id: 'E4',
    code: 'BKT-04',
    title: 'Daftar Periksa Keamanan Malam',
    summary: 'Patroli malam tidak mencatat adanya penyusup masuk atau pintu yang terbuka paksa.',
  },
  E5: {
    id: 'E5',
    code: 'BKT-05',
    title: 'Kesaksian Sari',
    summary: 'Sari membenarkan peta ARP-1924 disimpan aman di meja kaca ruang pameran untuk mengukur ulang koordinat pohon tua dari peta berskala 1 : 500.',
  },
};

export const petaYangHilang = {
  id: 'MYS-003',
  title: 'Peta yang Hilang',
  tagline: 'Sebuah peta lama lenyap dari ruang arsip.',
  difficulty: 'Menengah',
  duration: '10–15 menit',
  subjects: ['Geografi', 'Sejarah', 'Bahasa Indonesia'],
  place: 'Lorong Akademi, Ruang Perawatan & Taman',
  synopsis:
    'Peta kuno akademi tahun 1924 berskala 1 : 500 menghilang dari rak penyimpanan. Pak Darmo khawatir sumber sejarah primer itu dicuri penyusup. Tugasmu: telusuri jejak dokumen, analisis skala peta, dan buktikan ke mana peta itu pergi.',

  evidence: MAP_EVIDENCE,
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
      intro: 'Lemari arsip kaca di sudut lorong tampak memiliki satu ruang kosong pada rak gulungan peta bersejarah.',
      objects: [
        {
          id: 'darmo',
          name: 'Pak Darmo',
          kind: 'npc',
          icon: 'UserRound',
          x: 74,
          y: 69,
          description: 'Pak Darmo memeriksa gembok lemari arsip dengan senter kecil.',
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
          description: 'Sari membawa tabung pelindung arsip dan penggaris skala kartografi.',
          requires: { collected: ['E3'] },
          lockText: 'Sari sedang sibuk menata papan pameran. Periksa Taman Akademi dulu untuk mencari bukti peminjaman.',
          script: 'interview-sari',
          actionLabel: 'Mulai wawancara',
        },
        {
          id: 'archive-log',
          name: 'Buku Log Lemari Arsip',
          kind: 'document',
          icon: 'FileText',
          x: 14,
          y: 48,
          description: 'Buku catatan inventaris arsip kartografi dan dokumen sejarah akademi.',
          details: [
            'Total koleksi peta kuno: 12 gulungan.',
            'Gulungan kode ARP-1924 (Peta Wilayah & Taman Akademi 1924, skala 1 : 500) tercatat tidak berada di rak.',
          ],
          table: MAP_EVIDENCE.E1.table,
          evidence: 'E1',
        },
      ],
    },

    maintenance: {
      id: 'maintenance',
      name: 'Ruang Perawatan',
      bg: 'maintenance',
      icon: 'Wrench',
      intro: 'Meja kerja Pak Darmo menyimpan kunci cadangan serta laporan keamanan bangunan.',
      objects: [
        {
          id: 'lock-report',
          name: 'Catatan Pemeriksaan Kunci',
          kind: 'object',
          icon: 'Gauge',
          x: 30,
          y: 40,
          description: 'Hasil pemeriksaan silinder kunci lemari arsip dan grendel jendela.',
          details: [
            'Lubang kunci lemari arsip bersih tanpa goresan congkelan.',
            'Grendel jendela masih tertutup lapisan debu tebal yang tidak tersentuh.',
          ],
          evidence: 'E2',
        },
        {
          id: 'patrol-list',
          name: 'Daftar Periksa Keamanan Malam',
          kind: 'document',
          icon: 'ClipboardCheck',
          x: 86,
          y: 36,
          description: 'Laporan keliling penjaga malam akademi.',
          details: [
            'Seluruh pintu gerbang terkunci sejak pukul 21.00.',
            'Tidak ditemukan jejak kaki asing di sekitar lorong maupun taman.',
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
      requires: { solved: ['g1'] },
      lockText: 'Pintu taman dikunci. Selesaikan dulu Tantangan Geografi: Analisis Skala Peta.',
      intro: 'Di meja kayu rumah kaca taman, tampak beberapa salinan denah tata ruang lama sedang dikeringkan.',
      objects: [
        {
          id: 'loan-slip',
          name: 'Slip Peminjaman Restorasi',
          kind: 'document',
          icon: 'StickyNote',
          x: 30,
          y: 68,
          description: 'Formulir peminjaman resmi bertanda tangan Wakil Kepala Sekolah yang terselip di map meja taman.',
          details: [
            'Dokumen dipinjam: ARP-1924 (Peta Wilayah & Taman Akademi 1924, skala 1 : 500).',
            'Peminjam: Sari, untuk kegiatan pemetaan ulang tata guna lahan dan vegetasi bersejarah akademi.',
          ],
          table: MAP_EVIDENCE.E3.table,
          evidence: 'E3',
        },
      ],
    },
  },

  scripts: {
    briefing: {
      id: 'briefing',
      chapter: 'Kasus MYS-003 — Pengarahan',
      start: 'b1',
      onEnd: 'toGame',
      nodes: {
        b1: {
          bg: 'archive',
          speaker: 'nara',
          expr: 'neutral',
          text: 'Kasus ketiga terbuka: MYS-003. Peta kuno akademi tahun 1924 tidak ada di lemari arsip.',
          next: 'b2',
        },
        b2: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'worried',
          cast: ['nara', 'darmo'],
          text: 'Peta itu adalah sumber sejarah primer akademi kita sejak 1924, Nak. Saya takut ada pencuri yang mengambilnya semalam!',
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
          text: 'Ada perkembangan soal peta 1924 itu?',
          choices: [
            { text: 'Apakah ada tanda pintu atau lemari dibobol?', next: 'd1' },
            { text: 'Terima kasih, Pak.', next: 'dEnd' },
          ],
        },
        d1: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'thinking',
          text: 'Anehnya tidak ada sama sekali. Gemboknya mulus, jendela juga berdebu utuh. Laporannya saya taruh di Ruang Perawatan.',
          next: 'd0',
        },
        dEnd: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'happy',
          text: 'Semoga peta bersejarah itu segera ditemukan dalam keadaan utuh.',
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
          text: 'Kamu mencari peta ARP-1924, ya?',
          choices: [
            { text: 'Aku menemukan slip peminjaman atas namamu di taman. Peta aslinya ada di mana?', next: 's1' },
            { text: 'Terima kasih, Sari.', next: 'sEnd' },
          ],
        },
        s1: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'happy',
          text: 'Peta aslinya aman di dalam tabung kaca meja pameran! Kami meminjamnya dengan izin resmi untuk membandingkan tata ruang taman tahun 1924 dengan kondisi sekarang.',
          effects: [{ type: 'collect', id: 'E5' }],
          next: 's0',
        },
        sEnd: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'happy',
          text: 'Nanti setelah selesai disalin, langsung kami kembalikan ke lemari arsip!',
          end: true,
        },
      },
    },

    epilogue: {
      id: 'epilogue',
      chapter: 'Kasus MYS-003 — Epilog',
      start: 'e1',
      onEnd: 'toResult',
      nodes: {
        e1: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Misteri terpecahkan, {player}! Peta ARP-1924 tidak dicuri, melainkan dipinjam secara resmi untuk restorasi dan pameran sejarah.',
          next: 'e2',
        },
        e2: {
          bg: 'garden',
          speaker: 'darmo',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Lega sekali mendengarnya! Lain kali slip peminjamannya ditempel di pintu lemari arsip supaya saya tidak panik.',
          end: true,
        },
      },
    },
  },

  challenges: [
    {
      id: 'g1',
      subject: 'geografi',
      title: 'Analisis Skala Peta',
      icon: 'FlaskConical',
      unlock: { collected: ['E1'] },
      lockText: 'Periksa Buku Log Lemari Arsip di Lorong Akademi.',
      scenario: 'Peta ARP-1924 memiliki skala 1 : 500. Jarak gerbang utama ke taman pada peta tersebut terukur 14 cm.',
      evidenceRef: 'E1',
      unlocksText: 'Pintu Taman Akademi terbuka.',
      steps: [
        {
          id: 'g1-1',
          type: 'numeric',
          prompt: 'Jika skala peta adalah 1 : 500 dan jarak gerbang ke taman pada peta adalah 14 cm, berapa meter jarak sebenarnya di lapangan?',
          unit: 'meter',
          answer: 70,
          hints: [
            'Skala 1 : 500 berarti 1 cm pada peta mewakili 500 cm (atau 5 meter) jarak sebenarnya.',
            'Kalikan 14 cm dengan 500 cm = 7.000 cm, lalu ubah ke meter (dibagi 100).',
          ],
          wrongDefault: 'Belum tepat. Kalikan jarak peta (14 cm) dengan penyebut skala (500), lalu konversi dari cm ke meter.',
          explain: 'Jarak sebenarnya = 14 cm × 500 = 7.000 cm = 70 meter.',
          link: 'Perhitungan spasial tepat! Sekarang periksa Taman Akademi untuk mencari jejak peminjaman peta tersebut.',
        },
      ],
    },
    {
      id: 'h1',
      subject: 'sejarah',
      title: 'Kritik Sumber Primer',
      icon: 'BookText',
      unlock: { collected: ['E3'] },
      lockText: 'Temukan Slip Peminjaman Restorasi di Taman Akademi.',
      scenario: 'Evaluasi kedudukan Peta ARP-1924 dan Slip Peminjaman dalam penelitian sejarah akademi.',
      evidenceRef: 'E3',
      steps: [
        {
          id: 'h1-1',
          type: 'mc',
          prompt: 'Dalam metodologi sejarah, Peta Wilayah & Taman Akademi yang dibuat langsung pada tahun 1924 dikategorikan sebagai sumber apa?',
          options: [
            { id: 'a', text: 'Sumber primer, karena dibuat sezaman dengan peristiwa atau kondisi wilayah tahun 1924.', correct: true, why: '' },
            { id: 'b', text: 'Sumber sekunder, karena ditulis ulang oleh siswa pada masa kini.', correct: false, why: 'Peta ARP-1924 adalah dokumen asli tahun 1924, bukan salinan masa kini.' },
            { id: 'c', text: 'Sumber lisan, karena diceritakan secara turun-temurun.', correct: false, why: 'Peta merupakan dokumen visual/tertulis, bukan tradisi lisan.' },
            { id: 'd', text: 'Fiksi sejarah, karena hanya berisi perkiraan seniman.', correct: false, why: 'Peta berskala 1 : 500 merupakan dokumen teknis resmi akademi.' },
          ],
          hints: [
            'Sumber yang berasal langsung dari waktu terjadinya peristiwa disebut sumber utama/primer.',
            'Perhatikan tahun pembuatan peta pada kode ARP-1924.',
          ],
          explain: 'Sumber primer adalah bukti atau dokumen asli yang dihasilkan pada kurun waktu yang sedang diteliti (tahun 1924).',
          link: 'Karena merupakan sumber primer yang bernilai tinggi, peta ARP-1924 memang memerlukan izin khusus untuk direstorasi.',
        },
      ],
    },
    {
      id: 'i1',
      subject: 'bahasa',
      title: 'Memilah Fakta Kesaksian',
      icon: 'BookText',
      unlock: { collected: ['E5'] },
      lockText: 'Wawancarai Sari di Lorong Akademi.',
      scenario: 'Kelompokkan pernyataan berikut terhadap dugaan bahwa peta telah dicuri penyusup.',
      evidenceRef: 'E5',
      steps: [
        {
          id: 'i1-1',
          type: 'classify',
          prompt: 'Hipotesis: "Peta ARP-1924 dicuri penyusup dari luar sekolah." Kelompokkan setiap fakta berikut.',
          categories: [
            { id: 'mendukung', label: 'Mendukung dugaan pencurian' },
            { id: 'melemahkan', label: 'Melemahkan dugaan pencurian' },
            { id: 'tidak', label: 'Tidak berkaitan' },
          ],
          items: [
            { id: 'k1', text: 'Terdapat slip peminjaman resmi bertanda tangan Wakil Kepala Sekolah.', answer: 'melemahkan', nudge: 'Peminjaman resmi berarti dokumen diambil secara sah.' },
            { id: 'k2', text: 'Gembok lemari utuh dan debu pada grendel jendela tidak tersentuh.', answer: 'melemahkan', nudge: 'Pencuri biasanya meninggalkan bekas paksaan.' },
            { id: 'k3', text: 'Sari menggunakan penggaris skala untuk membaca detail gambar.', answer: 'tidak', nudge: 'Alat ukur tidak membuktikan ada tidaknya pencurian.' },
          ],
          hints: [
            'Fakta yang membuktikan izin resmi atau tidak adanya pembobolan akan melemahkan dugaan pencurian.',
          ],
          explain: 'Slip peminjaman resmi dan kondisi kunci/jendela yang utuh membuktikan tidak terjadi pencurian.',
          link: 'Semua bukti mengarah pada peminjaman resmi yang sah.',
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
        { id: 'a', text: 'Dokumen ARP-1924 yang hilang dari rak tercatat dipinjam secara resmi pada slip restorasi.', correct: true, why: '' },
        { id: 'b', text: 'Peta ARP-1924 hilang karena dibuang ke taman.', correct: false, why: 'Slip menunjukkan peminjaman resmi, bukan pembuangan.' },
      ],
      reasons: [
        { id: 'r1', text: 'Karena kode dokumen ARP-1924 pada buku log sama persis dengan kode pada slip peminjaman resmi.', correct: true, why: '' },
        { id: 'r2', text: 'Karena kedua kertas berwarna sama.', correct: false, why: 'Kecocokan kode arsip dan isi yang membuktikannya.' },
      ],
      insight: 'Peta ARP-1924 dipinjam secara sah dengan izin tertulis.',
    },
    {
      id: 'C2',
      pair: ['E2', 'E4'],
      key: true,
      statements: [
        { id: 'a', text: 'Kunci lemari utuh dan patroli malam aman menyingkirkan dugaan pencurian oleh penyusup.', correct: true, why: '' },
        { id: 'b', text: 'Penyusup masuk lewat jendela taman yang rusak.', correct: false, why: 'Grendel jendela terkunci rapat dan berdebu utuh.' },
      ],
      reasons: [
        { id: 'r1', text: 'Karena tidak ada bekas congkelan kunci maupun tanda penyusup pada laporan keamanan malam.', correct: true, why: '' },
        { id: 'r2', text: 'Karena Pak Darmo membawa senter.', correct: false, why: 'Alat yang dibawa bukan bukti.' },
      ],
      insight: 'Tidak ada tanda pembobolan atau penyusupan.',
    },
  ],
  keyConnectionsNeeded: 2,

  objectives: [
    { id: 'o1', text: 'Periksa Buku Log Lemari Arsip', where: 'Lorong Akademi', done: { collected: ['E1'] } },
    { id: 'o2', text: 'Periksa Catatan Kunci & Keamanan Malam', where: 'Ruang Perawatan', done: { collected: ['E2', 'E4'] } },
    { id: 'o3', text: 'Selesaikan tantangan Geografi: Analisis Skala Peta', where: 'Tantangan', done: { solved: ['g1'] }, available: { collected: ['E1'] } },
    { id: 'o4', text: 'Temukan Slip Peminjaman di Taman', where: 'Taman Akademi', done: { collected: ['E3'] }, available: { solved: ['g1'] } },
    { id: 'o5', text: 'Selesaikan tantangan Sejarah: Kritik Sumber Primer', where: 'Tantangan', done: { solved: ['h1'] }, available: { collected: ['E3'] } },
    { id: 'o6', text: 'Wawancarai Sari tentang peta ARP-1924', where: 'Lorong Akademi', done: { collected: ['E5'] }, available: { collected: ['E3'] } },
    { id: 'o7', text: 'Selesaikan tantangan Bahasa: Memilah Fakta Kesaksian', where: 'Tantangan', done: { solved: ['i1'] }, available: { collected: ['E5'] } },
    { id: 'o8', text: 'Buktikan 2 hubungan inti di Papan Bukti', where: 'Papan Bukti', done: { connections: 2 }, available: { collected: ['E1', 'E3'] } },
    { id: 'o9', text: 'Susun kesimpulan akhir kasus', where: 'Kesimpulan', done: { finalSolved: true }, available: { ready: true } },
  ],

  resolution: {
    question: 'Apa yang sebenarnya terjadi pada Peta Kuno ARP-1924?',
    options: [
      { id: 'stolen', text: 'Dicuri oleh penyusup yang masuk lewat jendela taman.', correct: false, why: 'Kunci lemari dan debu pada grendel jendela masih utuh, serta tidak ada tanda penyusup.' },
      { id: 'borrowed', text: 'Dipinjam secara resmi oleh Sari untuk restorasi dan pemetaan ulang tata ruang akademi.', correct: true, why: '' },
    ],
    requiredEvidence: ['E1', 'E3'],
    numberFill: { increase: 70, sessions: 14, perSession: 5 },
    minReasonLength: 15,
    reasoningChecks: [
      { id: 'k1', label: 'menyebut peminjaman resmi atau restorasi', pattern: /pinjam|restorasi|pameran|izin/i },
      { id: 'k2', label: 'menyebut tidak ada pembobolan atau pencurian', pattern: /kunci|utuh|bukan curi|pencuri|jendela/i },
    ],
    solution: {
      headline: 'Peta ARP-1924 dipinjam secara resmi untuk restorasi dan pemetaan sejarah, bukan dicuri.',
      story: [
        'Peta Wilayah & Taman Akademi 1924 (ARP-1924, skala 1 : 500) dipinjam dengan izin resmi Wakil Kepala Sekolah oleh Sari untuk pemetaan ulang tata ruang dan vegetasi bersejarah.',
        'Pemeriksaan kunci lemari, grendel jendela, dan log keamanan malam membuktikan tidak pernah terjadi pembobolan atau pencurian.',
      ],
    },
  },

  concepts: [
    { subject: 'Geografi', icon: 'FlaskConical', text: 'Menghitung jarak sebenarnya menggunakan skala numerik peta (Skala 1 : 500 berarti jarak sebenarnya = jarak peta × 500).' },
    { subject: 'Sejarah', icon: 'BookText', text: 'Kritik sumber primer: dokumen asli tahun 1924 merupakan sumber sejarah sezaman yang memerlukan pelestarian khusus.' },
    { subject: 'Bahasa Indonesia', icon: 'BookText', text: 'Menyusun kesimpulan berdasarkan bukti dokumenter dan memilah fakta yang melemahkan prasangka awal.' },
  ],

  encouragement: 'Ketelitianmu menganalisis peta berskala, sumber primer, dan bukti dokumen membuat seluruh kasus di arsip terselesaikan!',
};

export default petaYangHilang;