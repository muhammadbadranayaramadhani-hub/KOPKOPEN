// Prolog: perkenalan pemain, akademi, dan arsip.
// Format skrip cerita (dipakai juga oleh skrip kasus):
//   nodes[id] = { bg, speaker, expr, text, cast?, card?, next?, choices?, input?, branch?, effects?, end? }
//   - speaker: id karakter | 'narrator'
//   - choices: [{ text, next, effects? }]
//   - input: 'name'  -> meminta nama pemain
//   - branch: { flag, map, default } -> loncat otomatis berdasarkan flag
//   - effects: [{ type:'flag', key, value } | { type:'collect', id }]
//   - end: true -> skrip selesai (lihat onEnd)

export const INTRO_SCRIPT = {
  id: 'intro',
  chapter: 'Prolog — Undangan',
  start: 'n1',
  onEnd: 'introDone',
  nodes: {
    n1: {
      bg: 'desk',
      speaker: 'narrator',
      text: 'Pagi ini, sebuah amplop berwarna krem tergeletak di mejamu. Tidak ada nama pengirim — hanya segel lilin bergambar buku terbuka.',
      card: {
        title: 'Undangan',
        lines: [
          'Kepada calon penyelidik,',
          'Arsip kami menyimpan kasus-kasus yang belum terpecahkan. Kami percaya kamu punya rasa ingin tahu yang kami butuhkan.',
          'Datanglah ke Akademi Pengetahuan Tersembunyi sebelum senja.',
          '— Penjaga Arsip',
        ],
      },
      next: 'n2',
    },
    n2: {
      bg: 'gate',
      speaker: 'narrator',
      text: 'Kamu mengikuti peta kecil di dalam amplop. Di ujung jalan berkabut berdirilah sebuah akademi tua. Jendela-jendelanya bersinar keemasan, seolah sudah menunggumu.',
      next: 'n3',
    },
    n3: {
      bg: 'gate',
      speaker: 'narrator',
      text: 'Gerbang besi berderit pelan. Seseorang membukanya dari dalam.',
      next: 'n4',
    },
    n4: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'happy',
      text: 'Selamat datang di Akademi Pengetahuan Tersembunyi! Aku Nara, penjaga arsip di sini. Kami sudah menunggumu.',
      next: 'n5',
    },
    n5: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'thinking',
      text: 'Hmm, aku belum tahu namamu. Siapa nama penyelidik baru kita?',
      input: 'name',
      next: 'n6',
    },
    n6: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'happy',
      text: 'Senang bertemu denganmu, {player}. Nama yang bagus untuk seorang penyelidik.',
      next: 'n7',
    },
    n7: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'neutral',
      text: 'Kamu pasti punya banyak pertanyaan. Tanyakan saja satu.',
      choices: [
        { text: 'Kenapa aku yang diundang?', next: 'n7a' },
        { text: 'Penyelidikan seperti apa yang akan kulakukan?', next: 'n7b' },
        { text: 'Apakah ini berbahaya?', next: 'n7c' },
      ],
    },
    n7a: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'happy',
      text: 'Karena kamu suka bertanya "kenapa". Itu modal terbaik seorang penyelidik.',
      next: 'n8',
    },
    n7b: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'neutral',
      text: 'Kasus-kasus aneh di akademi ini. Tidak ada monster atau sihir — hanya petunjuk, angka, dan kata-kata yang harus dibaca dengan teliti.',
      next: 'n8',
    },
    n7c: {
      bg: 'hall',
      speaker: 'nara',
      expr: 'happy',
      text: 'Tenang. Bahaya terbesarnya hanya kebingungan, dan itu bisa dikalahkan dengan berpikir runtut.',
      next: 'n8',
    },
    n8: {
      bg: 'archive',
      speaker: 'nara',
      expr: 'neutral',
      text: 'Ikuti aku. Di sinilah semua kasus disimpan: Arsip Penyelidikan.',
      next: 'n9',
    },
    n9: {
      bg: 'archive',
      speaker: 'narrator',
      text: 'Rak-rak setinggi langit-langit dipenuhi map berdebu. Beberapa map berpendar redup — tanda kasus yang menunggu untuk dibuka.',
      next: 'n10',
    },
    n10: {
      bg: 'archive',
      speaker: 'nara',
      expr: 'neutral',
      text: 'Aturannya sederhana. Jelajahi tempat kejadian, kumpulkan bukti, baca dan hitung dengan cermat, lalu hubungkan semua petunjuk.',
      next: 'n11',
    },
    n11: {
      bg: 'archive',
      speaker: 'nara',
      expr: 'thinking',
      text: 'Matematika, IPA, bahasa — semuanya adalah alat penyelidikmu. Bukan pelajaran terpisah, melainkan kunci untuk membuka misteri.',
      next: 'n12',
    },
    n12: {
      bg: 'archive',
      speaker: 'nara',
      expr: 'happy',
      text: 'Satu map baru muncul pagi ini: Kasus MYS-001, "The Last Drop". Mau kita lihat?',
      end: true,
    },
  },
};
