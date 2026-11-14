// Bukti kasus MYS-001 "The Last Drop".
// SEMUA angka di sini harus konsisten dengan theLastDrop.js:
//   normal 1.200 L | hari penyelidikan 1.560 L | selisih 360 L
//   2 sesi tambahan x 180 L = 360 L | murid hadir 420 setiap hari

export const LAST_DROP_EVIDENCE = {
  E1: {
    id: 'E1',
    code: 'BKT-01',
    title: 'Laporan Konsumsi Air Harian',
    icon: 'FileText',
    core: true,
    source: 'Ruang Perawatan — Catatan Pemakaian Harian',
    summary: 'Pemakaian air hari penyelidikan lebih tinggi dari biasanya.',
    description:
      'Catatan resmi pemakaian air akademi yang disusun petugas pemeliharaan. Pada hari penyelidikan (Rabu), pemakaian air naik dibandingkan hari biasa, padahal jumlah murid yang hadir tidak berubah.',
    data: [
      { label: 'Konsumsi normal', value: '1.200 liter/hari' },
      { label: 'Hari penyelidikan (Rabu)', value: '1.560 liter' },
      { label: 'Murid hadir', value: '420 orang setiap hari' },
    ],
    table: {
      headers: ['Hari', 'Murid hadir', 'Konsumsi air (liter)'],
      rows: [
        ['Senin', '420', '1.200'],
        ['Selasa', '420', '1.200'],
        ['Rabu (hari penyelidikan)', '420', '1.560'],
      ],
    },
  },
  E2: {
    id: 'E2',
    code: 'BKT-02',
    title: 'Pengamatan Meteran Air',
    icon: 'Gauge',
    core: true,
    source: 'Ruang Perawatan — Meteran air utama',
    summary: 'Angka meteran cocok dengan laporan; meteran diam saat sekolah kosong.',
    description:
      'Hasil pengamatanmu langsung pada meteran air utama. Angka yang terbaca sama dengan laporan harian. Catatan jam malam menunjukkan meteran tidak bergerak ketika sekolah kosong.',
    data: [
      { label: 'Pembacaan total hari penyelidikan', value: '1.560 liter' },
      { label: 'Pukul 22.00–05.00 (sekolah kosong)', value: 'meteran tidak bergerak (0 liter)' },
      { label: 'Segel & label meteran', value: 'segel utuh; dikalibrasi bulan lalu' },
    ],
  },
  E3: {
    id: 'E3',
    code: 'BKT-03',
    title: 'Jadwal Penyiraman Taman',
    icon: 'CalendarDays',
    core: true,
    source: 'Taman Akademi — Papan jadwal siram',
    summary: 'Ada dua sesi penyiraman tambahan, masing-masing 180 liter.',
    description:
      'Jadwal penyiraman taman untuk hari Rabu. Selain sesi rutin yang sudah termasuk pemakaian normal, ada dua sesi tambahan dari Klub Kebun.',
    data: [
      { label: 'Sesi tambahan', value: '2 sesi' },
      { label: 'Air per sesi tambahan', value: '180 liter' },
    ],
    table: {
      headers: ['Sesi', 'Pukul', 'Air', 'Keterangan'],
      rows: [
        ['Rutin', '05.45', '—', 'Sudah termasuk pemakaian normal'],
        ['Tambahan 1', '06.30', '180 liter', 'Klub Kebun, persiapan Pekan Kebun'],
        ['Tambahan 2', '15.30', '180 liter', 'Klub Kebun, persiapan Pekan Kebun'],
      ],
    },
  },
  E4: {
    id: 'E4',
    code: 'BKT-04',
    title: 'Daftar Periksa Perawatan',
    icon: 'ClipboardCheck',
    core: true,
    source: 'Ruang Perawatan — Papan klip dinding',
    summary: 'Pemeriksaan pipa oleh Pak Darmo tidak menemukan tanda kebocoran.',
    description:
      'Daftar periksa yang diisi Pak Darmo untuk mencari kebocoran. Semua titik yang diperiksa dalam keadaan baik. Di bagian bawah ada catatan untuk memeriksa meteran pada malam hari.',
    data: [
      { label: 'Pipa utama', value: 'tidak ada tetesan' },
      { label: 'Keran kelas & toilet', value: 'kencang, tidak menetes' },
      { label: 'Toren / tangki air', value: 'tidak merembes' },
      { label: 'Sambungan selang taman', value: 'kering' },
      { label: 'Genangan tak wajar', value: 'tidak ada' },
    ],
    note: 'Catatan petugas: "Untuk memastikan tidak ada aliran saat sekolah kosong, cek juga meteran pada malam hari."',
  },
  E5: {
    id: 'E5',
    code: 'BKT-05',
    title: 'Pernyataan Saksi: Sari',
    icon: 'MessageSquareQuote',
    core: true,
    source: 'Lorong Akademi — Wawancara dengan Sari, Ketua Klub Kebun',
    summary: 'Klub Kebun menyiram dua kali di luar jadwal, 180 liter per sesi.',
    description: 'Kesaksian Sari tentang kegiatan penyiraman taman pada hari Rabu.',
    quote:
      'Hari Rabu kemarin Klub Kebun menyiram taman dua kali di luar jadwal biasa, yaitu pukul 06.30 dan pukul 15.30, karena taman akan dinilai juri Pekan Kebun. Setiap sesi memakai satu tangki penuh sebanyak 180 liter. Saya tidak melihat genangan atau pipa yang menetes di sekitar taman. Kemarin juga banyak kupu-kupu hinggap di bunga.',
    data: [
      { label: 'Kegiatan', value: 'penyiraman tambahan 2 kali' },
      { label: 'Air per sesi', value: '180 liter (satu tangki penuh)' },
    ],
  },
  E6: {
    id: 'E6',
    code: 'BKT-06',
    title: 'Pengumuman Pekan Kebun Sekolah',
    icon: 'Megaphone',
    core: false,
    source: 'Lorong Akademi — Papan pengumuman',
    summary: 'Klub Kebun mendapat izin menyiram tambahan 2 sesi pada hari Rabu.',
    description:
      'Pengumuman resmi dari Wakil Kepala Sekolah. Bukti ini menjelaskan mengapa ada penyiraman tambahan.',
    quote:
      'Pekan Kebun Sekolah diadakan hari Selasa sampai Kamis. Taman akan dinilai juri tamu. Klub Kebun mendapat izin melakukan penyiraman tambahan sebanyak 2 sesi pada hari Rabu.',
    data: [
      { label: 'Acara', value: 'Pekan Kebun Sekolah (Selasa–Kamis)' },
      { label: 'Izin', value: '2 sesi penyiraman tambahan, hari Rabu' },
    ],
  },
};
