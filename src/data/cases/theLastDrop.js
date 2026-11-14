// =====================================================================
// KASUS MYS-001 — THE LAST DROP (JENJANG SMA)
// Seluruh konten kasus ada di file ini; logika permainan ada di /engines.
//
// DATA ANGKA (harus selalu konsisten):
//   Konsumsi normal            : 1.200 liter
//   Hari penyelidikan (Rabu)   : 1.560 liter
//   Selisih                    : 1.560 - 1.200 = 360 liter
//   Sesi tambahan x air/sesi   : 2 x 180 = 360 liter
//   Murid hadir                : 420 orang setiap hari
// =====================================================================
import { LAST_DROP_EVIDENCE } from '../evidence.js';

export const theLastDrop = {
  id: 'MYS-001',
  title: 'The Last Drop',
  tagline: 'Air akademi naik tiba-tiba. Ke mana perginya?',
  difficulty: 'Pemula',
  duration: '10–15 menit',
  subjects: ['Matematika', 'Biologi', 'Bahasa Indonesia'],
  place: 'Taman Akademi & Ruang Perawatan',
  synopsis:
    'Pemakaian air akademi naik tajam padahal jumlah murid dan kegiatan sekolah tidak berubah. Petugas curiga ada kebocoran. Tugasmu: cari buktinya — tetapi tidak semuanya seperti yang terlihat.',

  evidence: LAST_DROP_EVIDENCE,
  evidenceOrder: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'],
  coreEvidence: ['E1', 'E2', 'E3', 'E4', 'E5'],

  startLocation: 'hallway',
  locationOrder: ['hallway', 'maintenance', 'garden'],

  // ------------------------------------------------------------------
  // LOKASI & HOTSPOT  (x,y dalam persen dari panggung 4:3)
  // ------------------------------------------------------------------
  locations: {
    hallway: {
      id: 'hallway',
      name: 'Lorong Akademi',
      bg: 'hallway',
      icon: 'MapPin',
      intro:
        'Lorong panjang berlantai batu dengan lentera yang berpendar redup. Di sini murid dan petugas berpapasan setiap hari.',
      objects: [
        {
          id: 'darmo',
          name: 'Pak Darmo',
          kind: 'npc',
          icon: 'UserRound',
          x: 74,
          y: 69,
          description:
            'Petugas pemeliharaan akademi. Wajahnya tampak lelah dan khawatir. Ia membawa buku catatan lusuh.',
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
          description:
            'Sari, siswa SMA sekaligus ketua Klub Kebun. Ia sedang menggulung poster dengan gambar bunga.',
          requires: { collected: ['E3'] },
          lockText:
            'Sari sedang sibuk menata poster Klub Kebun. Kamu belum punya bahan pertanyaan yang kuat. Mungkin periksa Taman Akademi dulu.',
          script: 'interview-sari',
          actionLabel: 'Mulai wawancara',
        },
        {
          id: 'notice',
          name: 'Papan Pengumuman',
          kind: 'document',
          icon: 'Megaphone',
          x: 14,
          y: 48,
          description:
            'Papan gabus penuh kertas. Sebagian sudah menguning, tetapi satu pengumuman tampak baru dan dicetak tebal.',
          details: [
            'Judul: "Pekan Kebun Sekolah".',
            'Ditandatangani Wakil Kepala Sekolah.',
          ],
          evidence: 'E6',
        },
        {
          id: 'painting',
          name: 'Lukisan Tua',
          kind: 'object',
          icon: 'Image',
          x: 84,
          y: 45,
          background: true,
          description:
            'Lukisan seorang kepala akademi pertama, dengan bingkai emas yang mulai kusam. Matanya seolah mengikuti siapa pun yang lewat.',
          details: [
            'Di bingkainya terukir kalimat kecil: "Pengetahuan bersembunyi bagi yang tidak sabar."',
            'Tidak ada hubungannya dengan air, tetapi kamu merasa akademi ini menyimpan banyak rahasia lain.',
          ],
        },
      ],
    },

    maintenance: {
      id: 'maintenance',
      name: 'Ruang Perawatan',
      bg: 'maintenance',
      icon: 'Wrench',
      intro:
        'Ruangan sempit beraroma logam dan minyak. Pipa-pipa membentang di dinding, dan lampu meja berpendar hangat di atas tumpukan catatan.',
      objects: [
        {
          id: 'meter',
          name: 'Meteran Air Utama',
          kind: 'object',
          icon: 'Gauge',
          x: 30,
          y: 40,
          description:
            'Meteran besar berwajah bundar dengan angka berderet. Kamu bisa membacanya langsung, lalu membandingkannya dengan catatan.',
          details: [
            'Pembacaan total hari penyelidikan: 1.560 liter.',
            'Buku log malam: pada pukul 22.00–05.00, saat sekolah kosong, meteran tidak bergerak (0 liter).',
            'Segel meteran masih utuh. Label menyebut meteran dikalibrasi bulan lalu.',
          ],
          evidence: 'E2',
        },
        {
          id: 'records',
          name: 'Catatan Pemakaian Harian',
          kind: 'document',
          icon: 'FileText',
          x: 76,
          y: 61,
          description:
            'Setumpuk lembar catatan di meja Pak Darmo. Lembar paling atas berisi tabel pemakaian air tiga hari terakhir.',
          details: [
            'Pemakaian normal tercatat 1.200 liter per hari.',
            'Murid yang hadir sama setiap hari: 420 orang.',
          ],
          table: LAST_DROP_EVIDENCE.E1.table,
          evidence: 'E1',
        },
        {
          id: 'checklist',
          name: 'Daftar Periksa Perawatan',
          kind: 'document',
          icon: 'ClipboardCheck',
          x: 86,
          y: 36,
          description:
            'Papan klip yang tergantung di dinding. Tulisan tangan Pak Darmo rapi, dengan tanda centang di setiap baris.',
          details: LAST_DROP_EVIDENCE.E4.data.map((d) => `${d.label}: ${d.value}.`),
          note: LAST_DROP_EVIDENCE.E4.note,
          evidence: 'E4',
        },
        {
          id: 'calibration',
          name: 'Laporan Kalibrasi Meteran',
          kind: 'document',
          icon: 'FileCheck',
          x: 61,
          y: 66,
          background: true,
          description:
            'Map biru berisi laporan teknisi dari bulan lalu. Ada cap resmi di pojok kanan bawah.',
          details: [
            'Kesimpulan teknisi: meteran air bekerja dengan akurat.',
            'Informasi ini mendukung pembacaan meteranmu, tetapi bukan bukti baru tentang penyebab kenaikan.',
          ],
        },
        {
          id: 'pipes',
          name: 'Pipa Utama',
          kind: 'object',
          icon: 'Waves',
          x: 56,
          y: 19,
          background: true,
          description:
            'Pipa logam tebal yang membentang di langit-langit. Kamu menyentuhnya dengan hati-hati.',
          details: [
            'Permukaannya kering dan dingin. Tidak ada tetesan atau noda basah di bawahnya.',
            'Satu pipa kering belum membuktikan seluruh sistem aman, tetapi ini petunjuk yang patut dicatat.',
          ],
        },
        {
          id: 'toolshelf',
          name: 'Rak Peralatan',
          kind: 'object',
          icon: 'Hammer',
          x: 12,
          y: 56,
          background: true,
          description:
            'Rak berisi kunci pas, lem pipa, dan gulungan pita segel. Semuanya tertata rapi.',
          details: [
            'Tidak ada alat yang tampak baru dipakai.',
            'Barang-barang ini hanya latar suasana; tidak ada petunjuk penting di sini.',
          ],
        },
      ],
    },

    garden: {
      id: 'garden',
      name: 'Taman Akademi',
      bg: 'garden',
      icon: 'Sprout',
      requires: { solved: ['m1'] },
      lockText:
        'Pintu taman dikunci. Pak Darmo hanya mau membukanya jika kamu bisa menyebutkan berapa liter kenaikan pemakaian air. Selesaikan dulu Tantangan Matematika: Hitung Selisihnya.',
      intro:
        'Taman senja dengan rumah kaca kecil, petak bunga, dan bau tanah basah. Kunang-kunang mulai muncul di antara semak.',
      objects: [
        {
          id: 'plants',
          name: 'Tanaman di Petak Bunga',
          kind: 'object',
          icon: 'Sprout',
          x: 30,
          y: 68,
          description:
            'Bunga-bunga tampak segar dan tanahnya lembap, seolah baru saja disiram. Sebuah plang kecil bertuliskan "Dinilai juri — Pekan Kebun".',
          details: [
            'Tanahnya lembap, tetapi tidak ada genangan.',
            'Di balik semak di sisi kiri, kamu melihat ujung sebuah papan kecil yang tertutup daun.',
          ],
          reveals: ['schedule'],
          revealText: 'Papan Jadwal Siram muncul di sisi kiri taman.',
        },
        {
          id: 'schedule',
          name: 'Papan Jadwal Siram',
          kind: 'document',
          icon: 'CalendarDays',
          x: 13,
          y: 47,
          hidden: true,
          requires: { inspected: ['plants'] },
          description:
            'Papan kecil yang hampir tersembunyi di balik daun. Jadwal penyiraman hari Rabu ditulis dengan kapur.',
          details: LAST_DROP_EVIDENCE.E3.data.map((d) => `${d.label}: ${d.value}.`),
          table: LAST_DROP_EVIDENCE.E3.table,
          evidence: 'E3',
        },
        {
          id: 'hose',
          name: 'Selang Air',
          kind: 'object',
          icon: 'Cable',
          x: 18,
          y: 84,
          background: true,
          description: 'Selang hijau yang digulung rapi di dekat keran taman.',
          details: [
            'Sambungan selang kering dan tidak menetes.',
            'Dugaan bocor di sambungan ini tidak mendapat dukungan.',
          ],
        },
        {
          id: 'tank',
          name: 'Tangki Penyiram',
          kind: 'object',
          icon: 'Droplets',
          x: 78,
          y: 62,
          background: true,
          description:
            'Tangki penyiram berukuran besar dengan label tertulis di badannya.',
          details: [
            'Label: "Kapasitas 180 liter".',
            'Menurut Klub Kebun, satu sesi penyiraman memakai satu tangki penuh.',
          ],
        },
        {
          id: 'gardennote',
          name: 'Catatan Perawatan Taman',
          kind: 'document',
          icon: 'StickyNote',
          x: 50,
          y: 56,
          background: true,
          description:
            'Kertas kuning ditempel di pintu rumah kaca. Tulisan tangan yang sama dengan daftar periksa Pak Darmo.',
          details: [
            'Isi: "Rabu — tangki taman diisi untuk sesi tambahan Klub Kebun (pagi & sore). Keran dan sambungan: kering."',
            'Catatan ini hanya mengonfirmasi kegiatan; angka resminya ada di papan jadwal.',
          ],
        },
      ],
    },
  },

  // ------------------------------------------------------------------
  // SKRIP CERITA
  // ------------------------------------------------------------------
  scripts: {
    briefing: {
      id: 'briefing',
      chapter: 'Kasus MYS-001 — Pengarahan',
      start: 'b1',
      onEnd: 'toGame',
      nodes: {
        b1: {
          bg: 'archive',
          speaker: 'nara',
          expr: 'neutral',
          text: 'Map MYS-001 sudah terbuka. Pemakaian air akademi naik tajam, padahal jumlah murid dan kegiatan sekolah tidak berubah.',
          next: 'b2',
        },
        b2: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'worried',
          cast: ['nara', 'darmo'],
          text: 'Saya curiga ada pipa bocor di suatu tempat, Nak. Tapi sudah saya cari ke sana-sini, belum ketemu buktinya.',
          next: 'b3',
        },
        b3: {
          bg: 'hallway',
          speaker: 'nara',
          expr: 'thinking',
          cast: ['nara', 'darmo'],
          text: 'Tugasmu: cari tahu kenapa pemakaian air naik. Bocor? Atau ada penyebab lain? Jangan menebak. Buktikan.',
          next: 'b4',
        },
        b4: {
          bg: 'hallway',
          speaker: 'nara',
          expr: 'neutral',
          cast: ['nara', 'darmo'],
          text: 'Sebelum mulai, apa dugaan pertamamu?',
          choices: [
            {
              text: 'Kemungkinan besar ada pipa bocor.',
              next: 'b5a',
              effects: [{ type: 'flag', key: 'hypothesis', value: 'leak' }],
            },
            {
              text: 'Mungkin ada kegiatan yang memakai air lebih banyak.',
              next: 'b5b',
              effects: [{ type: 'flag', key: 'hypothesis', value: 'usage' }],
            },
            {
              text: 'Aku belum tahu. Aku mau lihat datanya dulu.',
              next: 'b5c',
              effects: [{ type: 'flag', key: 'hypothesis', value: 'data' }],
            },
          ],
        },
        b5a: {
          bg: 'hallway',
          speaker: 'nara',
          expr: 'neutral',
          cast: ['nara', 'darmo'],
          text: 'Dugaan yang masuk akal dan paling umum. Nanti kita lihat apakah bukti mendukungnya.',
          next: 'b6',
        },
        b5b: {
          bg: 'hallway',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Dugaan yang jarang terpikir orang. Simpan baik-baik, nanti kita uji dengan bukti.',
          next: 'b6',
        },
        b5c: {
          bg: 'hallway',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Itu sikap penyelidik sejati: data dulu, kesimpulan belakangan.',
          next: 'b6',
        },
        b6: {
          bg: 'hallway',
          speaker: 'nara',
          expr: 'neutral',
          cast: ['nara', 'darmo'],
          text: 'Mulailah dari Lorong Akademi dan Ruang Perawatan. Buka Jurnal untuk melihat bukti dan Tujuan untuk tahu langkah berikutnya.',
          next: 'b7',
        },
        b7: {
          bg: 'hallway',
          speaker: 'narrator',
          text: 'Ketuk titik berpendar di lokasi untuk memeriksa benda. Tidak semua benda adalah bukti, jadi pilihlah yang menurutmu penting.',
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
          text: 'Ada yang bisa saya bantu, Nak?',
          choices: [
            { text: 'Ceritakan tentang meteran air.', next: 'd1' },
            { text: 'Bagian mana yang sudah Bapak periksa?', next: 'd2' },
            { text: 'Ada kegiatan baru di sekolah akhir-akhir ini?', next: 'd3' },
            { text: 'Cukup, terima kasih, Pak.', next: 'dEnd' },
          ],
        },
        d1: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'worried',
          text: 'Rabu kemarin angkanya melonjak. Rasanya seperti ada air yang mengalir terus entah ke mana.',
          next: 'd1b',
        },
        d1b: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'thinking',
          text: 'Tapi itu baru perasaan saya. Coba lihat sendiri meterannya di Ruang Perawatan.',
          next: 'd0',
        },
        d2: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'neutral',
          text: 'Saya sudah keliling: keran kelas, toilet, sampai pipa utama. Semuanya saya catat di daftar periksa di Ruang Perawatan.',
          next: 'd2b',
        },
        d2b: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'thinking',
          text: 'Kalau memang bocor, biasanya meteran tetap bergerak malam hari, saat sekolah kosong. Itu tanda yang saya cari.',
          next: 'd0',
        },
        d3: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'thinking',
          text: 'Hmm... Klub Kebun sibuk sekali minggu ini. Katanya ada Pekan Kebun Sekolah. Coba lihat papan pengumuman di lorong ini.',
          next: 'd3b',
        },
        d3b: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'neutral',
          text: 'Ketuanya, Sari, sering ada di lorong ini. Tanyakan saja kalau kamu sudah punya bahan.',
          next: 'd0',
        },
        dEnd: {
          bg: 'hallway',
          speaker: 'darmo',
          expr: 'happy',
          text: 'Sama-sama. Kabari saya kalau kamu menemukan sesuatu.',
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
          text: 'Eh, kamu penyelidik baru, ya? Kudengar kamu mencari tahu kenapa air sekolah naik.',
          choices: [
            { text: 'Aku menemukan jadwal siram tambahan. Benar kalian yang menyiram?', next: 's1' },
            { text: 'Ada yang tidak biasa di dekat pipa taman?', next: 's2' },
            { text: 'Terima kasih, Sari.', next: 'sEnd' },
          ],
        },
        s1: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'happy',
          text: 'Benar! Rabu kemarin Klub Kebun menyiram dua kali di luar jadwal biasa, pukul 06.30 dan 15.30.',
          next: 's1b',
        },
        s1b: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'happy',
          text: 'Satu sesi memakai satu tangki penuh, 180 liter. Kami ingin tamannya terbaik waktu dinilai juri.',
          next: 's1c',
        },
        s1c: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'worried',
          text: 'Eh, apa kami salah? Kami tidak tahu kalau airnya jadi terlalu banyak.',
          effects: [{ type: 'collect', id: 'E5' }],
          next: 's0',
        },
        s2: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'thinking',
          text: 'Tidak ada. Tanahnya basah cuma karena disiram. Aku tidak lihat genangan atau pipa yang menetes. Yang banyak malah kupu-kupu!',
          next: 's0',
        },
        sEnd: {
          bg: 'hallway',
          speaker: 'sari',
          expr: 'happy',
          text: 'Sama-sama! Semoga kasusmu cepat selesai.',
          end: true,
        },
      },
    },

    epilogue: {
      id: 'epilogue',
      chapter: 'Kasus MYS-001 — Epilog',
      start: 'e1',
      onEnd: 'toResult',
      nodes: {
        e1: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Kerja bagus, {player}. Angkanya cocok sempurna: tambahan 360 liter sama dengan dua sesi siram tambahan.',
          next: 'e2',
        },
        e2: {
          bg: 'garden',
          speaker: 'darmo',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Hahaha, jadi bukan bocor! Syukurlah. Dan saya senang kamu mengecek meterannya juga.',
          next: 'e3',
        },
        e3: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'neutral',
          cast: ['nara', 'darmo'],
          branch: {
            flag: 'hypothesis',
            map: { leak: 'e3a', usage: 'e3b', data: 'e3c' },
            default: 'e3c',
          },
        },
        e3a: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'thinking',
          cast: ['nara', 'darmo'],
          text: 'Dugaan awalmu "bocor" ternyata keliru, dan itu tidak apa-apa. Penyelidik hebat berani mengubah kesimpulan saat bukti berkata lain.',
          next: 'e4',
        },
        e3b: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Dugaan awalmu tentang kegiatan yang memakai banyak air ternyata tepat. Tapi yang membuatnya berharga adalah kamu mengujinya dengan bukti.',
          next: 'e4',
        },
        e3c: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Kamu tidak menebak dulu, hanya mengikuti data. Begitulah cara kerja penyelidik sejati.',
          next: 'e4',
        },
        e4: {
          bg: 'garden',
          speaker: 'sari',
          expr: 'worried',
          cast: ['sari', 'darmo'],
          text: 'Maaf ya, Pak Darmo. Kami tidak bilang dulu soal siram tambahannya.',
          next: 'e5',
        },
        e5: {
          bg: 'garden',
          speaker: 'darmo',
          expr: 'happy',
          cast: ['sari', 'darmo'],
          text: 'Lain kali kabari saya. Soal hemat air, ayo kita siram pagi atau sore saja. Airnya tidak cepat menguap.',
          next: 'e6',
        },
        e6: {
          bg: 'garden',
          speaker: 'nara',
          expr: 'happy',
          cast: ['nara', 'darmo'],
          text: 'Satu kasus selesai. Tapi arsip ini masih menyimpan banyak map berdebu. Sampai jumpa di kasus berikutnya, {player}.',
          end: true,
        },
      },
    },
  },

  // ------------------------------------------------------------------
  // TANTANGAN PENGETAHUAN
  // ------------------------------------------------------------------
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
          table: LAST_DROP_EVIDENCE.E1.table,
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
      id: 'm2',
      subject: 'matematika',
      title: 'Tafsirkan Bukti',
      icon: 'Calculator',
      unlock: { collected: ['E3'] },
      lockText: 'Temukan jadwal penyiraman di Taman Akademi.',
      scenario:
        'Jadwal penyiraman menunjukkan ada sesi tambahan. Hitung berapa air yang dipakai oleh sesi-sesi itu.',
      evidenceRef: 'E3',
      steps: [
        {
          id: 'm2-1',
          type: 'numeric',
          prompt:
            'Setiap sesi tambahan memakai 180 liter, dan ada 2 sesi tambahan. Berapa liter total air untuk kedua sesi itu?',
          unit: 'liter',
          answer: 360,
          table: LAST_DROP_EVIDENCE.E3.table,
          hints: [
            'Baca tabel jadwal: ada berapa sesi tambahan dan berapa liter tiap sesi?',
            'Jumlah yang sama dipakai berulang kali. Perkalian adalah penjumlahan berulang.',
            'Hitung 180 + 180, atau kalikan 2 × 180.',
          ],
          wrong: {
            182: 'Kamu menjumlahkan banyak sesi (2) dengan volume per sesi (180). Kedua angka itu berbeda jenis, sehingga perlu dikalikan.',
            90: 'Kamu membagi. Padahal air dipakai dua kali, jadi totalnya bertambah.',
            180: '180 liter hanya untuk satu sesi. Ada dua sesi tambahan.',
          },
          wrongDefault:
            'Belum tepat. Ingat: ada 2 sesi tambahan dan tiap sesi memakai 180 liter.',
          explain:
            'Total air = 2 × 180 = 360 liter. Perkalian adalah cara cepat untuk menjumlahkan bilangan yang sama berulang kali (180 + 180).',
          link: 'Sekarang kamu punya dua angka penting dari dua bukti berbeda. Mari bandingkan keduanya.',
        },
        {
          id: 'm2-2',
          type: 'mc',
          prompt:
            'Bandingkan hasilmu (360 liter dari dua sesi tambahan) dengan selisih pada Tantangan 1 (360 liter). Apa artinya?',
          options: [
            {
              id: 'a',
              text: 'Hasilnya hanya kebetulan dan tidak berarti apa-apa.',
              correct: false,
              why: 'Dua angka dari dua sumber berbeda yang persis sama sulit dianggap kebetulan. Itu justru petunjuk kuat.',
            },
            {
              id: 'b',
              text: 'Ada 360 liter air bocor yang belum ditemukan.',
              correct: false,
              why: 'Angka 360 sudah punya penjelasan lain: dua sesi siram yang tercatat. Tidak ada bukti air bocor.',
            },
            {
              id: 'c',
              text: 'Kenaikan 360 liter sama besar dengan air dari dua sesi tambahan, sehingga kenaikan itu bisa dijelaskan tanpa kebocoran.',
              correct: true,
              why: '',
            },
            {
              id: 'd',
              text: 'Sesi tambahan hanya menjelaskan sebagian kecil dari kenaikan.',
              correct: false,
              why: 'Bandingkan angkanya: 360 liter dan 360 liter. Keduanya sama, bukan hanya sebagian.',
            },
          ],
          hints: [
            'Tuliskan kedua angka berdampingan: kenaikan pemakaian dan air dari sesi tambahan.',
            'Jika dua angka dari sumber berbeda sama persis, apakah itu hubungan yang kuat?',
            'Ingat: kamu mencari penjelasan yang didukung angka, bukan sekadar dugaan.',
          ],
          explain:
            'Kenaikan 360 liter (1.560 − 1.200) sama persis dengan 2 × 180 liter. Dua perhitungan dari dua bukti berbeda menghasilkan angka yang sama, sehingga kenaikan itu terjelaskan sepenuhnya.',
          link: 'Petunjuk kuat: kenaikan air kemungkinan besar berasal dari penyiraman tambahan, bukan dari kebocoran.',
        },
      ],
    },
    {
      id: 's1',
      subject: 'biologi',
      title: 'Transpirasi & Siklus Air',
      icon: 'FlaskConical',
      unlock: { collected: ['E3'] },
      lockText: 'Temukan jadwal penyiraman di Taman Akademi.',
      scenario:
        'Walaupun bukan kebocoran, 360 liter air tambahan tetap perlu dikelola secara ekologis. Pak Darmo ingin tahu alasan biologis di balik pemilihan waktu penyiraman tanaman.',
      evidenceRef: 'E3',
      steps: [
        {
          id: 's1-1',
          type: 'mc',
          prompt: 'Mengapa ketersediaan air tawar bersih perlu dijaga meskipun volume total air di Bumi tetap dalam siklus hidrologi?',
          options: [
            {
              id: 'a',
              text: 'Karena molekul air akan musnah setelah diserap akar tumbuhan.',
              correct: false,
              why: 'Air dilepaskan kembali ke atmosfer melalui transpirasi, tidak musnah.',
            },
            {
              id: 'b',
              text: 'Karena sebagian besar air di Bumi berupa air asin, sedangkan air tawar yang layak pakai jumlahnya sangat terbatas dan butuh waktu pemulihan.',
              correct: true,
              why: '',
            },
            {
              id: 'c',
              text: 'Karena air tanah tidak pernah terhubung dengan siklus presipitasi.',
              correct: false,
              why: 'Air tanah terisi kembali melalui infiltrasi air hujan.',
            },
            {
              id: 'd',
              text: 'Karena tanaman tidak membutuhkan air untuk fotosintesis.',
              correct: false,
              why: 'Air adalah bahan baku utama reaksi terang fotosintesis.',
            },
          ],
          hints: [
            'Ingat komposisi perairan Bumi: lebih dari 97% berada di lautan.',
            'Fokus pada keterbatasan proporsi air tawar yang siap digunakan.',
          ],
          explain:
            'Dalam siklus hidrologi, volume total air memang tetap, tetapi lebih dari 97% merupakan air laut yang asin. Persediaan air tawar bersih yang layak konsumsi sangat terbatas.',
          link: 'Pemilihan waktu penyiraman juga memengaruhi efisiensi penyerapan air oleh tanaman.',
        },
        {
          id: 's1-2',
          type: 'multi',
          prompt: 'Pilih SEMUA langkah konservasi air yang efektif diterapkan di lingkungan sekolah.',
          options: [
            { id: 'a', text: 'Menutup keran rapat-rapat setelah digunakan', correct: true, why: '' },
            { id: 'b', text: 'Menyiram tanaman pada pagi atau sore hari untuk menekan laju evaporasi dan transpirasi berlebih', correct: true, why: '' },
            { id: 'c', text: 'Membuat sumur resapan dan menampung air hujan untuk irigasi taman', correct: true, why: '' },
            { id: 'd', text: 'Segera memperbaiki kebocoran pipa atau keran', correct: true, why: '' },
            { id: 'e', text: 'Membiarkan keran mengalir terus saat mencuci alat laboratorium', correct: false, why: 'Air bersih terbuang sia-sia tanpa dimanfaatkan.' },
            { id: 'f', text: 'Menyiram tanaman pada tengah hari terik agar air cepat menguap', correct: false, why: 'Intensitas cahaya dan suhu tinggi mempercepat penguapan sebelum air diserap akar.' },
          ],
          hints: [
            'Ada empat pilihan yang benar. Perhatikan hubungan suhu siang hari dengan laju penguapan.',
          ],
          explain:
            'Menyiram pada pagi/sore hari mengurangi kehilangan air akibat evaporasi dan transpirasi tinggi saat terik, sementara penampungan air hujan menjaga cadangan air tanah.',
          link: 'Jadwal Klub Kebun pukul 06.30 dan 15.30 sudah tepat secara biologis karena suhu udara lebih rendah.',
        },
      ],
    },
    {
      id: 'i1',
      subject: 'bahasa',
      title: 'Membaca Kesaksian',
      icon: 'BookText',
      unlock: { collected: ['E5'] },
      lockText: 'Wawancarai Sari di Lorong Akademi.',
      scenario:
        'Kesaksian harus dibaca dengan teliti: mana informasi utama, mana fakta yang relevan, dan mana yang tidak berkaitan.',
      evidenceRef: 'E5',
      steps: [
        {
          id: 'i1-1',
          type: 'mc',
          quote: LAST_DROP_EVIDENCE.E5.quote,
          prompt: 'Apa informasi utama dalam pernyataan Sari?',
          options: [
            {
              id: 'a',
              text: 'Pipa di taman bocor sehingga tanaman menjadi basah.',
              correct: false,
              why: 'Sari justru menyatakan tidak melihat pipa yang menetes.',
            },
            {
              id: 'b',
              text: 'Klub Kebun melakukan dua sesi penyiraman tambahan pada hari Rabu untuk persiapan penilaian taman.',
              correct: true,
              why: '',
            },
            {
              id: 'c',
              text: 'Jumlah anggota Klub Kebun bertambah banyak.',
              correct: false,
              why: 'Pernyataan Sari tidak menyebut jumlah anggota.',
            },
            {
              id: 'd',
              text: 'Banyak kupu-kupu merusak bunga di taman.',
              correct: false,
              why: 'Kupu-kupu hanya disebut sekilas di akhir dan tidak dikatakan merusak bunga.',
            },
          ],
          hints: [
            'Informasi utama adalah hal terpenting yang ingin disampaikan penutur, biasanya di awal pernyataan.',
            'Baca kalimat pertama. Siapa melakukan apa, kapan, dan mengapa?',
            'Pilih jawaban yang merangkum kalimat pertama dan kedua.',
          ],
          explain:
            'Informasi utama menjawab apa yang terjadi. Sari menyatakan Klub Kebun menyiram dua kali di luar jadwal pada hari Rabu karena taman akan dinilai.',
          link: 'Kesaksian ini mendukung jadwal siram (BKT-03) yang kamu temukan di taman.',
        },
        {
          id: 'i1-2',
          type: 'classify',
          quote: LAST_DROP_EVIDENCE.E5.quote,
          prompt:
            'Hipotesis: "Kenaikan air disebabkan oleh pipa bocor." Kelompokkan setiap pernyataan Sari di bawah ini terhadap hipotesis tersebut.',
          categories: [
            { id: 'mendukung', label: 'Mendukung dugaan bocor' },
            { id: 'melemahkan', label: 'Melemahkan dugaan bocor' },
            { id: 'tidak', label: 'Tidak berkaitan' },
          ],
          items: [
            {
              id: 'k1',
              text: 'Klub Kebun menyiram taman dua kali di luar jadwal biasa pada hari Rabu.',
              answer: 'melemahkan',
              nudge: 'Apakah ada penyebab lain yang bisa menjelaskan tambahan air, sehingga bocor tidak lagi diperlukan?',
            },
            {
              id: 'k2',
              text: 'Setiap sesi penyiraman memakai satu tangki penuh sebanyak 180 liter.',
              answer: 'melemahkan',
              nudge: 'Bandingkan angka ini dengan selisih 360 liter. Apa yang kamu lihat?',
            },
            {
              id: 'k3',
              text: 'Sari tidak melihat genangan atau pipa yang menetes di sekitar taman.',
              answer: 'melemahkan',
              nudge: 'Kebocoran biasanya meninggalkan jejak. Bagaimana jika jejaknya tidak ada?',
            },
            {
              id: 'k4',
              text: 'Kemarin banyak kupu-kupu hinggap di bunga taman.',
              answer: 'tidak',
              nudge: 'Apakah kupu-kupu berpengaruh pada jumlah air yang terpakai atau bocor?',
            },
          ],
          hints: [
            'Untuk setiap pernyataan, tanyakan: apakah ini membuat dugaan bocor lebih kuat, lebih lemah, atau tidak berpengaruh?',
            'Fakta yang memberi penjelasan lain untuk kenaikan air akan melemahkan dugaan bocor.',
            'Perhatikan: tidak semua kalimat dalam kesaksian relevan dengan kasus.',
          ],
          explain:
            'Tiga pernyataan melemahkan dugaan bocor: ada penyiraman tambahan, angkanya cocok, dan tidak ada tanda kebocoran. Kupu-kupu tidak berkaitan. Perhatikan juga bahwa tidak ada satu pun fakta dalam kesaksian ini yang mendukung dugaan bocor.',
          link: 'Membaca teks dengan teliti membantumu memilah fakta penting dari informasi yang tidak relevan.',
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // PAPAN BUKTI: hubungan antar bukti
  // key: true = hubungan inti yang diperlukan untuk membuka kesimpulan
  // ------------------------------------------------------------------
  connections: [
    {
      id: 'C1',
      pair: ['E1', 'E3'],
      key: true,
      statements: [
        {
          id: 'a',
          text: 'Jadwal siram menunjukkan penyebab kebocoran pipa di taman.',
          correct: false,
          why: 'Jadwal siram hanya mencatat kegiatan menyiram. Tidak ada kata atau angka yang menunjukkan kebocoran.',
        },
        {
          id: 'b',
          text: 'Kenaikan pemakaian pada laporan sama besar dengan air dari sesi siram tambahan pada jadwal.',
          correct: true,
          why: '',
        },
        {
          id: 'c',
          text: 'Laporan menunjukkan jumlah murid bertambah sehingga air dipakai lebih banyak.',
          correct: false,
          why: 'Laporan justru mencatat murid hadir tetap 420 orang setiap hari.',
        },
        {
          id: 'd',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Coba bandingkan angka kenaikan pada laporan dengan angka pada jadwal.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena keduanya sama-sama dibuat pada hari Rabu.',
          correct: false,
          why: 'Hari yang sama belum membuktikan hubungan. Cari angka yang saling cocok.',
        },
        {
          id: 'r2',
          text: 'Karena 1.560 − 1.200 = 360 liter dan 2 × 180 liter = 360 liter, angkanya sama persis.',
          correct: true,
          why: '',
        },
        {
          id: 'r3',
          text: 'Karena kedua dokumen sama-sama menyebut kata "air".',
          correct: false,
          why: 'Kata yang sama belum menjadi bukti. Hubungan kuat terlihat dari angka yang saling menjelaskan.',
        },
      ],
      insight:
        'Selisih 360 liter pada laporan persis sama dengan 2 × 180 liter dari dua sesi siram tambahan. Kenaikan air terjelaskan sepenuhnya, tanpa perlu ada kebocoran.',
    },
    {
      id: 'C2',
      pair: ['E1', 'E2'],
      key: true,
      statements: [
        {
          id: 'a',
          text: 'Meteran menunjukkan angka jauh lebih kecil dari laporan, jadi laporan keliru.',
          correct: false,
          why: 'Meteran terbaca 1.560 liter, sama dengan laporan.',
        },
        {
          id: 'b',
          text: 'Keduanya membuktikan ada pipa bocor di taman.',
          correct: false,
          why: 'Keduanya hanya mencatat jumlah air yang terpakai. Belum ada tanda kebocoran atau lokasinya.',
        },
        {
          id: 'c',
          text: 'Pembacaan langsung meteran cocok dengan laporan harian, sehingga angka laporan dapat dipercaya.',
          correct: true,
          why: '',
        },
        {
          id: 'd',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Keduanya sama-sama mencatat pemakaian air hari Rabu. Coba bandingkan angkanya.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena meteran lebih baru daripada laporan.',
          correct: false,
          why: 'Umur alat bukan alasan angkanya dapat dipercaya. Bandingkan isi angka dan kondisi alatnya.',
        },
        {
          id: 'r2',
          text: 'Karena angka total pada meteran (1.560 liter) sama dengan angka pada laporan, dan segel meteran masih utuh.',
          correct: true,
          why: '',
        },
        {
          id: 'r3',
          text: 'Karena laporan ditulis oleh Pak Darmo.',
          correct: false,
          why: 'Siapa penulisnya tidak membuktikan angkanya benar. Bukti lebih kuat bila ada pengukuran lain yang cocok.',
        },
      ],
      insight:
        'Dua sumber berbeda (catatan petugas dan pembacaan langsung) menunjukkan angka yang sama. Dugaan bahwa meteran rusak atau laporan keliru bisa disingkirkan.',
    },
    {
      id: 'C3',
      pair: ['E2', 'E4'],
      key: true,
      statements: [
        {
          id: 'a',
          text: 'Meteran diam saat sekolah kosong dan daftar periksa tidak menemukan tetesan, sehingga dugaan kebocoran melemah.',
          correct: true,
          why: '',
        },
        {
          id: 'b',
          text: 'Daftar periksa mencatat banyak pipa rusak, dan meteran terus berputar saat malam.',
          correct: false,
          why: 'Daftar periksa mencatat semua titik dalam keadaan baik, dan meteran diam saat malam.',
        },
        {
          id: 'c',
          text: 'Meteran yang diam saat malam membuktikan meteran itu rusak.',
          correct: false,
          why: 'Meteran yang diam saat tidak ada pemakaian justru wajar, bukan tanda rusak.',
        },
        {
          id: 'd',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Daftar periksa sendiri menyarankan memeriksa meteran malam hari. Lihat catatannya.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena kebocoran selalu terlihat dari genangan besar.',
          correct: false,
          why: 'Tidak selalu. Bocor kecil bisa tak terlihat, itulah sebabnya meteran malam hari penting diperiksa.',
        },
        {
          id: 'r2',
          text: 'Karena jika ada bocor, air tetap mengalir saat sekolah kosong sehingga meteran bergerak. Itu tidak terjadi, dan pemeriksaan pipa juga bersih.',
          correct: true,
          why: '',
        },
        {
          id: 'r3',
          text: 'Karena Pak Darmo yakin tidak ada kebocoran.',
          correct: false,
          why: 'Keyakinan seseorang bukan bukti. Yang dipakai adalah hasil pengukuran dan pemeriksaan.',
        },
      ],
      insight:
        'Kebocoran akan membuat meteran terus bergerak walau sekolah kosong. Karena meteran diam dan pipa kering, dugaan kebocoran tidak mendapat dukungan bukti.',
    },
    {
      id: 'C4',
      pair: ['E3', 'E5'],
      key: true,
      statements: [
        {
          id: 'a',
          text: 'Sari menyebut jumlah sesi dan air yang berbeda dari jadwal.',
          correct: false,
          why: 'Sari menyebut dua sesi dan 180 liter per sesi, sama dengan jadwal.',
        },
        {
          id: 'b',
          text: 'Sari melihat banyak genangan sehingga membuktikan ada bocor.',
          correct: false,
          why: 'Sari justru tidak melihat genangan atau pipa yang menetes.',
        },
        {
          id: 'c',
          text: 'Kesaksian Sari menguatkan bahwa penyiraman tambahan pada jadwal benar-benar dilakukan, dengan jumlah air yang sama.',
          correct: true,
          why: '',
        },
        {
          id: 'd',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Bandingkan jumlah sesi dan volume air pada jadwal dengan yang disebut Sari.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena Sari adalah ketua klub, jadi pasti benar.',
          correct: false,
          why: 'Jabatan bukan bukti. Kesaksian lebih kuat bila cocok dengan dokumen lain.',
        },
        {
          id: 'r2',
          text: 'Karena dokumen tertulis dan saksi mata sama-sama menyebut 2 sesi tambahan dengan 180 liter per sesi.',
          correct: true,
          why: '',
        },
        {
          id: 'r3',
          text: 'Karena keduanya sama-sama menyebut taman.',
          correct: false,
          why: 'Menyebut tempat yang sama belum cukup. Periksa kecocokan jumlah sesi dan air.',
        },
      ],
      insight:
        'Jadwal (dokumen) dan Sari (saksi mata) menyebut hal yang sama: dua sesi tambahan, masing-masing 180 liter. Dua sumber yang saling cocok membuat penjelasan jauh lebih kuat.',
    },
    {
      id: 'C5',
      pair: ['E3', 'E6'],
      key: false,
      statements: [
        {
          id: 'a',
          text: 'Pengumuman menyatakan penyiraman taman harus dikurangi.',
          correct: false,
          why: 'Pengumuman justru memberi izin penyiraman tambahan.',
        },
        {
          id: 'b',
          text: 'Pengumuman menjelaskan alasan adanya sesi siram tambahan pada jadwal: persiapan Pekan Kebun.',
          correct: true,
          why: '',
        },
        {
          id: 'c',
          text: 'Pengumuman membuktikan ada kebocoran pipa.',
          correct: false,
          why: 'Pengumuman tidak menyebut kebocoran sama sekali.',
        },
        {
          id: 'd',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Keduanya menyebut penyiraman tambahan pada hari Rabu.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena keduanya ditemukan di lokasi yang berdekatan.',
          correct: false,
          why: 'Letak penemuan bukti tidak menunjukkan hubungan isinya.',
        },
        {
          id: 'r2',
          text: 'Karena pengumuman memberi izin 2 sesi tambahan hari Rabu, sama dengan jumlah sesi tambahan pada jadwal.',
          correct: true,
          why: '',
        },
        {
          id: 'r3',
          text: 'Karena pengumuman memuat angka 1.560 liter.',
          correct: false,
          why: 'Pengumuman tidak memuat angka 1.560. Periksa kembali isinya.',
        },
      ],
      insight:
        'Pengumuman memberi alasan dan izin untuk dua sesi tambahan, sama persis dengan jadwal. Penyiraman tambahan bukan hal mencurigakan, melainkan kegiatan resmi.',
    },
    {
      id: 'C6',
      pair: ['E4', 'E5'],
      key: false,
      statements: [
        {
          id: 'a',
          text: 'Dua sumber berbeda sama-sama tidak menemukan tanda kebocoran: tidak ada tetesan pada pemeriksaan pipa dan tidak ada genangan menurut saksi.',
          correct: true,
          why: '',
        },
        {
          id: 'b',
          text: 'Daftar periksa dan kesaksian Sari saling bertentangan tentang kebocoran.',
          correct: false,
          why: 'Keduanya sejalan: tidak ada tanda kebocoran.',
        },
        {
          id: 'c',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Keduanya sama-sama membahas ada atau tidaknya tanda kebocoran.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena pemeriksaan petugas dan pengamatan murid dilakukan secara terpisah, namun hasilnya sama.',
          correct: true,
          why: '',
        },
        {
          id: 'r2',
          text: 'Karena Pak Darmo dan Sari berteman baik.',
          correct: false,
          why: 'Pertemanan bukan alasan ilmiah. Yang penting adalah kecocokan hasil pengamatan.',
        },
      ],
      insight:
        'Pengamatan yang dilakukan oleh orang berbeda dan hasilnya sama membuat kesimpulan lebih dapat dipercaya.',
    },
    {
      id: 'C7',
      pair: ['E5', 'E6'],
      key: false,
      statements: [
        {
          id: 'a',
          text: 'Kesaksian dan pengumuman sama-sama menunjukkan bahwa penyiraman tambahan dilakukan untuk persiapan Pekan Kebun.',
          correct: true,
          why: '',
        },
        {
          id: 'b',
          text: 'Pengumuman membantah isi kesaksian Sari.',
          correct: false,
          why: 'Isi keduanya sejalan, bukan bertentangan.',
        },
        {
          id: 'c',
          text: 'Kedua bukti tidak saling berhubungan.',
          correct: false,
          why: 'Keduanya menyebut penilaian taman dalam Pekan Kebun.',
        },
      ],
      reasons: [
        {
          id: 'r1',
          text: 'Karena kedua sumber menyebut penilaian juri Pekan Kebun sebagai alasan penyiraman tambahan.',
          correct: true,
          why: '',
        },
        {
          id: 'r2',
          text: 'Karena kedua sumber menyebut kupu-kupu.',
          correct: false,
          why: 'Pengumuman tidak menyebut kupu-kupu.',
        },
      ],
      insight:
        'Alasan penyiraman tambahan terkonfirmasi dari dua sisi: pengumuman resmi dan pengalaman langsung Sari.',
    },
  ],
  keyConnectionsNeeded: 4,

  // ------------------------------------------------------------------
  // TUJUAN PENYELIDIKAN
  // ------------------------------------------------------------------
  objectives: [
    { id: 'o1', text: 'Temukan Catatan Pemakaian Harian', where: 'Ruang Perawatan', done: { collected: ['E1'] } },
    { id: 'o2', text: 'Baca meteran air secara langsung', where: 'Ruang Perawatan', done: { collected: ['E2'] } },
    { id: 'o3', text: 'Periksa Daftar Periksa Perawatan pipa', where: 'Ruang Perawatan', done: { collected: ['E4'] } },
    { id: 'o4', text: 'Selesaikan tantangan: Hitung Selisihnya', where: 'Tantangan', done: { solved: ['m1'] }, available: { collected: ['E1'] } },
    { id: 'o5', text: 'Selidiki taman dan temukan jadwal siram', where: 'Taman Akademi', done: { collected: ['E3'] }, available: { solved: ['m1'] } },
    { id: 'o6', text: 'Wawancarai Sari tentang penyiraman', where: 'Lorong Akademi', done: { collected: ['E5'] }, available: { collected: ['E3'] } },
    { id: 'o7', text: 'Selesaikan tantangan: Tafsirkan Bukti', where: 'Tantangan', done: { solved: ['m2'] }, available: { collected: ['E3'] } },
    { id: 'o8', text: 'Selesaikan tantangan Biologi: Transpirasi & Siklus Air', where: 'Tantangan', done: { solved: ['s1'] }, available: { collected: ['E3'] } },
    { id: 'o9', text: 'Selesaikan tantangan: Membaca Kesaksian', where: 'Tantangan', done: { solved: ['i1'] }, available: { collected: ['E5'] } },
    { id: 'o10', text: 'Buktikan 4 hubungan inti di Papan Bukti', where: 'Papan Bukti', done: { connections: 4 }, available: { collected: ['E1', 'E2'] } },
    { id: 'o11', text: 'Susun kesimpulan akhir kasus', where: 'Kesimpulan', done: { finalSolved: true }, available: { ready: true } },
    { id: 'o12', text: 'Opsional: baca papan pengumuman di lorong', where: 'Lorong Akademi', done: { collected: ['E6'] }, optional: true },
  ],

  // ------------------------------------------------------------------
  // KESIMPULAN AKHIR
  // ------------------------------------------------------------------
  resolution: {
    question: 'Apa yang paling tepat menjelaskan kenaikan pemakaian air akademi?',
    options: [
      {
        id: 'leak',
        text: 'Ada kebocoran pipa tersembunyi di sistem air akademi.',
        correct: false,
        why: 'Jika ada kebocoran, air akan tetap mengalir saat sekolah kosong sehingga meteran bergerak malam hari. Periksa lagi Pengamatan Meteran (BKT-02) dan Daftar Periksa (BKT-04).',
      },
      {
        id: 'watering',
        text: 'Ada penyiraman taman tambahan oleh Klub Kebun.',
        correct: true,
        why: '',
      },
      {
        id: 'attendance',
        text: 'Jumlah murid yang hadir bertambah.',
        correct: false,
        why: 'Lihat tabel pada Laporan Konsumsi Air Harian (BKT-01): murid hadir tetap 420 orang setiap hari.',
      },
      {
        id: 'meter',
        text: 'Meteran air rusak sehingga angkanya salah.',
        correct: false,
        why: 'Pembacaan langsung meteran (BKT-02) cocok dengan laporan harian (BKT-01), segelnya utuh, dan meteran dikalibrasi bulan lalu.',
      },
    ],
    requiredEvidence: ['E1', 'E3'],
    numberFill: { increase: 360, sessions: 2, perSession: 180 },
    minReasonLength: 20,
    reasoningChecks: [
      { id: 'k1', label: 'menyebut angka 360 liter', pattern: /360/ },
      { id: 'k2', label: 'menyebut dua sesi penyiraman tambahan', pattern: /(dua|2)\s*(sesi|kali)|siram/i },
      { id: 'k3', label: 'menyingkirkan dugaan lain (bocor / meteran / jumlah murid)', pattern: /bocor|meter|murid|siswa/i },
    ],
    solution: {
      headline: 'Penyebabnya penyiraman taman tambahan, bukan kebocoran.',
      story: [
        'Pada hari Rabu, Klub Kebun menyiram taman dua kali di luar jadwal biasa, pukul 06.30 dan 15.30, untuk menyambut Pekan Kebun Sekolah. Setiap sesi memakai satu tangki penuh, 180 liter.',
        'Pemakaian air hari itu 1.560 liter, sedangkan biasanya 1.200 liter. Selisihnya 1.560 − 1.200 = 360 liter. Dua sesi tambahan memakai 2 × 180 = 360 liter. Angkanya sama persis.',
        'Dugaan lain tidak didukung bukti: meteran diam saat sekolah kosong dan pipa kering (bukan bocor), pembacaan meteran cocok dengan laporan (bukan meteran rusak), dan murid hadir tetap 420 orang (bukan kehadiran naik).',
      ],
    },
  },

  concepts: [
    { subject: 'Matematika', icon: 'Calculator', text: 'Selisih (pengurangan) untuk mengetahui seberapa besar suatu jumlah bertambah: 1.560 − 1.200 = 360.' },
    { subject: 'Matematika', icon: 'Calculator', text: 'Perkalian sebagai penjumlahan berulang: 2 × 180 = 180 + 180 = 360.' },
    { subject: 'Biologi', icon: 'FlaskConical', text: 'Air tawar bersih sangat terbatas; hemat air dengan menyiram saat pagi/sore untuk menekan laju evaporasi dan transpirasi.' },
    { subject: 'Bahasa Indonesia', icon: 'BookText', text: 'Menemukan informasi utama dan memilah fakta yang mendukung, melemahkan, atau tidak berkaitan dengan suatu dugaan.' },
    { subject: 'Penalaran', icon: 'Brain', text: 'Menguji hipotesis dengan bukti: dua sumber yang saling cocok membuat kesimpulan lebih kuat, dan dugaan lain bisa disingkirkan.' },
  ],

  encouragement:
    'Kamu tidak hanya menemukan jawabannya, tetapi juga membuktikan mengapa jawaban itu benar. Itulah kebiasaan terbaik seorang penyelidik.',
};

export default theLastDrop;