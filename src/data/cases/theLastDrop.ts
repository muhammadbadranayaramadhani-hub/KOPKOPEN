import { CaseData } from '../../types/game';

export const theLastDropCase: CaseData = {
  id: 'the-last-drop',
  code: 'MYS-001',
  title: 'Tetes Terakhir: Anomali Hidraulik',
  subtitle: 'Misteri Fluktuasi Debit, Cuaca & Konsumsi Air Akademi',
  difficulty: 'Tingkat Menengah-Lanjut (Kelas VIII-IX)',
  duration: '15 - 25 Menit',
  subjects: ['Matematika', 'Ilmu Pengetahuan Alam (IPA)', 'Bahasa Indonesia'],
  synopsis:
    'Sistem utilitas Akademi Mysteria mencatat anomali debit air harian yang signifikan. Dari rata-rata baseline 1,2 m³ (meter kubik) per hari, pembacaan hari ini melonjak ke angka 1.560 liter, di tengah suhu puncak 34°C. Pak Joko khawatir terjadi kebocoran struktural pada jaringan pipa bawah tanah sekunder. Gunakan instrumen sains, matematika, dan logika cuaca untuk membongkar fakta di balik angka ini!',
  targetExplanation:
    'Lonjakan konsumsi air sebesar 360 liter (1.560 liter dikurangi baseline 1.200 liter) secara matematis dan klimatologis terbukti identik dengan volume air yang dialokasikan untuk 2 siklus irigasi mikro tambahan pada kebun Anggrek Mistika guna merespons indeks evaporasi cuaca ekstrem (2 sesi × 0,18 m³ = 360 liter), mengeliminasi hipotesis kebocoran pipa bawah tanah.',
  
  locations: [
    {
      id: 'garden',
      name: 'Taman Akademi',
      subtitle: 'Kebun Botani & Stasiun Meteorologi Mini',
      sceneImage: '/src/assets/images/mysteria_garden_scene_1793849662259.jpg',
      description:
        'Taman rimbun dengan bebatuan, kanal air jernih, dan stasiun cuaca digital di dekat kubah rumah kaca.',
      hotspots: [
        {
          id: 'garden-hose',
          name: 'Katup Regulator Selang',
          x: 65,
          y: 72,
          icon: 'droplet',
          shortDesc: 'Regulator kuningan dengan indikator tekanan kerja.',
          detailText:
            'Katup utama terhubung ke jaringan sekunder. Pembacaan manometer nosel menunjukkan sisa tekanan statis 1,8 bar dengan kelembapan nosel yang mengindikasikan penggunaan intensif.',
          hasEvidence: false,
        },
        {
          id: 'weather-station-spot',
          name: 'Sensor Stasiun Meteorologi',
          x: 45,
          y: 20,
          icon: 'cloud-sun',
          shortDesc: 'Alat ukur suhu dan kelembapan relatif udara.',
          detailText:
            'Layar digital mencatat: Suhu Puncak 34°C, Kelembapan Relatif 45%, dengan indeks evaporasi tanah meningkat 20% dari kondisi normal.',
          hasEvidence: true,
          evidenceId: 'ev-weather-station',
          triggerChallengeId: 'challenge-weather-logic',
        },
        {
          id: 'garden-schedule-board',
          name: 'Logbook Pemeliharaan Botani',
          x: 63,
          y: 48,
          icon: 'clipboard-list',
          shortDesc: 'Catatan operasional harian teknisi taman.',
          detailText:
            'Tercatat dalam tinta tahan air: "Penyesuaian kelembapan mikro: Diimplementasikan 2 SESI IRIGASI EKSTRA (Sesi Alpha & Beta) untuk kultur Anggrek Mistika guna mengantisipasi penurunan kelembapan relatif. Masing-masing sesi menyerap volume persis 0,18 m³ dari tangki buffer."',
          hasEvidence: true,
          evidenceId: 'ev-garden-schedule',
          triggerChallengeId: 'challenge-math-2',
        },
        {
          id: 'orchid-bed',
          name: 'Petak Anggrek Mistika',
          x: 22,
          y: 78,
          icon: 'flower',
          shortDesc: 'Zona konservasi flora endemik sensitif.',
          detailText:
            'Media tanam menggunakan campuran sekam bakar dan mulsa organik untuk menekan koefisien evaporasi tanah di tengah fluktuasi suhu mikro.',
          hasEvidence: false,
          triggerChallengeId: 'challenge-ipa',
        },
      ],
    },
    {
      id: 'maintenance',
      name: 'Ruang Pemeliharaan',
      subtitle: 'Pusat Utilitas & Pengontrolan Pipa Utama',
      sceneImage: '/src/assets/images/mysteria_maintenance_scene_1793849662124.jpg',
      description:
        'Ruang bawah tanah dengan pipa-pipa kuningan, pengukur tekanan, dan meja kerja kayu yang diterangi lampu minyak hangat.',
      hotspots: [
        {
          id: 'water-meter',
          name: 'Flow Meter Digital Utama',
          x: 75,
          y: 22,
          icon: 'gauge',
          shortDesc: 'Pencatat laju aliran volume fluida.',
          detailText:
            'Menunjukkan akumulasi harian 1.560 liter. Ketika katup isolasi gedung ditutup total selama uji coba 10 menit, rotor flow meter berhenti berputar secara mutlak (0,0 L/menit).',
          hasEvidence: true,
          evidenceId: 'ev-water-meter',
        },
        {
          id: 'workbench-records',
          name: 'Buku Rekapitulasi Utilitas',
          x: 81,
          y: 58,
          icon: 'book-open',
          shortDesc: 'Grafik historis konsumsi bulanan.',
          detailText:
            'Baseline utilitas normal tercatat sebesar 1,2 m³ (1.200 liter) per hari secara konsisten selama 3 bulan terakhir. Pembacaan hari ini menunjukkan deviasi kumulatif mencapai 1.560 liter.',
          hasEvidence: true,
          evidenceId: 'ev-water-report',
          triggerChallengeId: 'challenge-math-1',
        },
        {
          id: 'pipeline-checklist',
          name: 'Dokumen Uji Hidrostatis',
          x: 30,
          y: 36,
          icon: 'file-check',
          shortDesc: 'Hasil audit tekanan jaringan pipa.',
          detailText:
            'Laporan insinyur: "Uji tekanan tertutup (hydrostatic pressure test) menunjukkan angka konstan 2,4 bar selama pengujian 1 jam. Koefisien penurunan tekanan (pressure drop) bernilai nol."',
          hasEvidence: true,
          evidenceId: 'ev-checklist',
        },
      ],
    },
    {
      id: 'hallway',
      name: 'Lorong Akademi',
      subtitle: 'Koridor Utama & Papan Informasi Siswa',
      sceneImage: '/src/assets/images/mysteria_hallway_scene_1793849662734.jpg',
      description:
        'Lorong berlantai kayu mengilap dengan jendela bergaya gotik dan lentera tembaga. Siswa dan staf berlalu-lalang di sini.',
      hotspots: [
        {
          id: 'bulletin-board',
          name: 'Mading Akademik',
          x: 85,
          y: 48,
          icon: 'info',
          shortDesc: 'Pengumuman resmi kegiatan kampus.',
          detailText:
            'Maklumat pameran botani: "Setiap departemen klub wajib memastikan protokol hidrasi spesimen flora terjaga ketat tanpa mengganggu alokasi utilitas umum."',
          hasEvidence: false,
        },
        {
          id: 'witness-student-budi',
          name: 'Siswa: Budi (Koordinator Klub Botani)',
          x: 55,
          y: 62,
          icon: 'user-check',
          shortDesc: 'Pengurus klub yang membawa logbook lapangan.',
          detailText:
            'Budi menyatakan: "Karena indeks suhu lingkungan meningkat hingga 34°C, kami mengeksekusi dua sesi penyiraman tambahan sesuai protokol logika cuaca. Tiap sesi mendistribusikan tepat 180 liter air dari buffer khusus."',
          hasEvidence: true,
          evidenceId: 'ev-witness',
          triggerChallengeId: 'challenge-indonesian',
        },
        {
          id: 'witness-worker-joko',
          name: 'Pak Joko (Kepala Teknisi Utilitas)',
          x: 20,
          y: 62,
          icon: 'user',
          shortDesc: 'Petugas senior penanggung jawab infrastruktur.',
          detailText:
            'Pak Joko berkata: "Lonjakan ke angka 1.560 liter dari biasanya 1,2 meter kubik langsung membuat saya berasumsi ada kegagalan struktural pada pipa bawah tanah."',
          hasEvidence: false,
        },
      ],
    },
  ],

  evidence: [
    {
      id: 'ev-water-report',
      title: 'Laporan Logistik Utilitas Harian',
      category: 'Dokumen',
      locationSource: 'Ruang Pemeliharaan (Meja Kerja)',
      description: 'Data kuantitatif konsumsi air komparatif antara baseline normal dan aktual harian.',
      keyData: 'Baseline Normal: 1,2 m³ | Aktual Hari Ini: 1.560 Liter | Selisih Absolut: 360 Liter',
      iconName: 'book-open',
    },
    {
      id: 'ev-weather-station',
      title: 'Log Stasiun Meteorologi Mini',
      category: 'Observasi',
      locationSource: 'Taman Akademi (Atap Kubah)',
      description: 'Catatan sensor kelembapan relatif dan indeks penguapan harian.',
      keyData: 'Suhu Puncak: 34°C | Kelembapan Relatif: 45% | Indeks Evaporasi: +20% dari normal.',
      iconName: 'cloud-sun',
    },
    {
      id: 'ev-water-meter',
      title: 'Log Diagnostik Flow Meter Utama',
      category: 'Observasi',
      locationSource: 'Ruang Pemeliharaan (Dinding Pipa)',
      description: 'Kurva aliran fluida saat pengujian penutupan katup isolasi menyeluruh.',
      keyData: 'Laju alir turun ke 0,0 L/menit saat katup ditutup. Integritas katup tervalidasi.',
      iconName: 'gauge',
    },
    {
      id: 'ev-garden-schedule',
      title: 'Log Aktivitas Irigasi Mikro',
      category: 'Dokumen',
      locationSource: 'Taman Akademi (Papan Log)',
      description: 'Catatan parameter teknis penyiraman spesimen khusus.',
      keyData: '2 Sesi Tambahan × 0,18 m³ per sesi = Total volume teralokasi spesifik (0,36 m³).',
      iconName: 'clipboard-list',
    },
    {
      id: 'ev-checklist',
      title: 'Sertifikat Audit Tekanan Hidrostatis',
      category: 'Fisik',
      locationSource: 'Ruang Pemeliharaan (Papan Lembar)',
      description: 'Parameter mekanis tekanan jaringan pipa distribusi utama.',
      keyData: 'Tekanan statis konstan di 2,4 bar. Variasi pressure drop = 0 bar.',
      iconName: 'file-check',
    },
    {
      id: 'ev-witness',
      title: 'Transkrip Kesaksian Teknis Lapangan',
      category: 'Kesaksian',
      locationSource: 'Lorong Akademi (Budi)',
      description: 'Pernyataan terverifikasi mengenai volume penggunaan air operasional taman.',
      keyData: 'Konfirmasi penggunaan 2 siklus irigasi terukur (180 liter per siklus) merespons cuaca panas.',
      iconName: 'message-square-quote',
    },
  ],

  challenges: [
    {
      id: 'challenge-math-1',
      subject: 'Matematika',
      grade: 'SMP Kelas VIII',
      title: 'Konversi Satuan & Analisis Selisih Volume',
      context:
        'Penyelidik harus menyamakan satuan ukur sebelum menghitung deviasi konsumsi air antara data meteran dan baseline.',
      question:
        'Jika baseline normal konsumsi air harian akademi adalah 1,2 m³ (meter kubik) dan pembacaan meteran hari ini menunjukkan 1.560 liter, berapakah selisih kenaikan konsumsi tersebut dalam satuan liter? (Catatan: 1 m³ = 1.000 liter)',
      type: 'calculation',
      expectedNumber: 360,
      tolerance: 0,
      unit: 'liter',
      hints: [
        'Ubah terlebih dahulu nilai baseline 1,2 m³ ke dalam satuan liter dengan mengalikannya dengan 1.000.',
        'Kurangi total pembacaan hari ini (1.560 liter) dengan hasil konversi baseline tersebut.',
      ],
      educationalTakeaway:
        'Keselarasan satuan (dimensional consistency) adalah kunci utama dalam analisis kuantitatif sebelum membandingkan besaran fisik.',
      storyImpact:
        'Kalkulasi tervalidasi: Selisih tepat sebesar 360 liter ditemukan dan siap dicocokkan dengan aktivitas lapangan!',
    },
    {
      id: 'challenge-math-2',
      subject: 'Matematika',
      grade: 'SMP Kelas VIII',
      title: 'Verifikasi Agregat Volume Irigasi',
      context:
        'Log taman mencatat penggunaan 2 sesi irigasi tambahan dengan satuan meter kubik (m³).',
      question:
        'Jika setiap sesi irigasi menggunakan volume 0,18 m³ dan dilakukan sebanyak 2 kali, berapakah total volume air yang dikonsumsi dalam satuan liter? (1 m³ = 1.000 liter)',
      type: 'calculation',
      expectedNumber: 360,
      tolerance: 0,
      unit: 'liter',
      hints: [
        'Kalikan jumlah sesi (2) dengan volume per sesi (0,18 m³), lalu konversikan hasilnya ke liter dengan mengalikan 1.000.',
        'Rumus: 2 × 0,18 m³ × 1.000 = ...',
      ],
      educationalTakeaway:
        'Kemampuan mengonversi pecahan desimal meter kubik ke liter memastikan akurasi pencocokan data silang.',
      storyImpact:
        'Angka 360 liter terverifikasi persis sama dengan selisih yang tercatat di meteran utama!',
    },
    {
      id: 'challenge-weather-logic',
      subject: 'Ilmu Pengetahuan Alam & Logika',
      grade: 'SMP Kelas IX',
      title: 'Analisis Koefisien Evaporasi & Aturan Bersyarat',
      context:
        'Indeks evaporasi hari ini meningkat akibat suhu 34°C. Klub botani harus menyesuaikan volume air berdasarkan aturan operasional.',
      question:
        'Berdasarkan aturan: (1) Jika suhu > 30°C DAN kelembapan < 50%, tambahkan 2 sesi irigasi ekstra. (2) Mengingat tangki buffer terisi penuh (0,36 m³), apakah eksekusi kedua sesi tersebut sah secara operasional berdasarkan data stasiun cuaca (Suhu 34°C, Kelembapan 45%)?',
      type: 'multiple_choice',
      options: [
        {
          id: 'opt-w-1',
          text: 'Sah, karena kondisi suhu (34°C > 30°C) dan kelembapan (45% < 50%) memenuhi syarat pemicu aturan, serta kapasitas tangki 0,36 m³ mencukupi.',
          isCorrect: true,
          explanation:
            'Tepat! Variabel iklim memicu aturan penambahan irigasi, dan perhitungan kapasitas tangki terbukti sangat akurat.',
        },
        {
          id: 'opt-w-2',
          text: 'Tidak sah, karena cuaca panas tidak memengaruhi penggunaan air.',
          isCorrect: false,
          explanation: 'Suhu tinggi mempercepat evaporasi sehingga penambahan air adalah prosedur standar yang sah.',
        },
      ],
      hints: [
        'Uji kondisi suhu dan kelembapan terhadap parameter aturan.',
        'Periksa apakah kapasitas total tangki (0,36 m³ atau 360 liter) mencukupi kebutuhan 2 sesi.',
      ],
      educationalTakeaway:
        'Logika bersyarat (conditional logic) sangat membantu dalam menganalisis prosedur operasional standar berbasis lingkungan.',
      storyImpact:
        'Kamu membuktikan bahwa lonjakan air adalah respons terukur terhadap kondisi cuaca ekstrem!',
    },
    {
      id: 'challenge-ipa',
      subject: 'Ilmu Pengetahuan Alam (IPA)',
      grade: 'SMP Kelas IX',
      title: 'Termodinamika Evaporasi & Efisiensi Penyerapan',
      context:
        'Menganalisis mengapa penyiraman tanaman di bawah terik matahari tanpa teknik perlindungan dapat menyebabkan inefisiensi hidraulik.',
      question:
        'Manakah prinsip termodinamika dan fisiologi tumbuhan yang paling tepat menjelaskan pentingnya penggunaan mulsa organik serta pengaturan waktu penyiraman di pagi/sore hari?',
      type: 'multiple_choice',
      options: [
        {
          id: 'opt-ipa-1',
          text: 'Penyiraman di siang bolong mempercepat fotosintesis karena energi panas matahari langsung mengaktifkan klorofil akar.',
          isCorrect: false,
          explanation: 'Akar tidak memiliki klorofil dan tidak melakukan fotosintesis di dalam tanah.',
        },
        {
          id: 'opt-ipa-2',
          text: 'Mulsa organik menghambat laju evaporasi termal tanah, sementara penyiraman terarah meminimalkan kehilangan air akibat penguapan udara.',
          isCorrect: true,
          explanation:
            'Tepat! Penutupan permukaan tanah dengan mulsa memotong jalur pindahnya uap air ke atmosfer, memaksa penyerapan optimal oleh akar.',
        },
        {
          id: 'opt-ipa-3',
          text: 'Suhu tinggi membuat air mendidih di dalam pori-pori tanah sehingga mempercepat penyerapan nutrisi.',
          isCorrect: false,
          explanation: 'Air tanah tidak mendidih pada suhu lingkungan normal.',
        },
      ],
      hints: [
        'Perhatikan peran mulsa sebagai insulator termal untuk menahan kelembapan tanah.',
        'Pilih opsi yang menjelaskan efisiensi penyerapan air dengan mengurangi penguapan (evaporasi).',
      ],
      educationalTakeaway:
        'Pemahaman konsep kalor dan evaporasi membantu menjelaskan perilaku penggunaan air secara rasional dan ilmiah.',
      storyImpact:
        'Kamu memahami alasan ekologis di balik protokol penggunaan tangki air terukur untuk perawatan flora.',
    },
    {
      id: 'challenge-indonesian',
      subject: 'Bahasa Indonesia',
      grade: 'SMP Kelas VIII - IX',
      title: 'Validitas Retorika & Identifikasi Fallacy',
      context:
        'Seorang penyelidik harus mampu menilai apakah suatu pernyataan mengandung argumen logis berbasis bukti atau sesat pikir (fallacy) akibat kepanikan.',
      question:
        'Analisis pernyataan berikut: "Karena meteran menunjukkan angka tinggi secara mendadak, maka pasti ada pipa bawah tanah yang hancur berkeping-keping di seluruh akademi." Manakah evaluasi kritis paling akurat terhadap klaim tersebut?',
      type: 'multiple_choice',
      options: [
        {
          id: 'opt-indo-1',
          text: 'Klaim tersebut valid karena kenaikan angka otomatis menjadi bukti mutlak kerusakan infrastruktur bawah tanah.',
          isCorrect: false,
          explanation: 'Ini adalah kesimpulan terburu-buru (hasty generalization) yang mengabaikan variabel lain.',
        },
        {
          id: 'opt-indo-2',
          text: 'Klaim tersebut merupakan bentuk kesesatan logika (fallacy) berlebihan karena melompat pada kesimpulan destruktif tanpa menguji variabel logis lain seperti audit tekanan dan log cuaca.',
          isCorrect: true,
          explanation:
            'Sempurna! Kepanikan membuat seseorang mengasumsikan skenario terburuk tanpa memverifikasi data empiris pendukung.',
        },
        {
          id: 'opt-indo-3',
          text: 'Klaim tersebut adalah fakta ilmiah karena diucapkan oleh petugas senior utilitas.',
          isCorrect: false,
          explanation: 'Otoritas seseorang tidak serta-merta membuat dugaannya menjadi fakta mutlak.',
        },
      ],
      hints: [
        'Perhatikan apakah pembicara langsung menuduh kerusakan berat tanpa memeriksa bukti pendukung lain.',
        'Pilih opsi yang mengidentifikasi adanya loncatan kesimpulan tanpa verifikasi.',
      ],
      educationalTakeaway:
        'Kemampuan mendeteksi sesat pikir (logical fallacy) dalam teks argumentatif melatih berpikir kritis dan objektif.',
      storyImpact:
        'Kamu terhindar dari bias kognitif dan kepanikan subyektif, menjaga fokus investigasi tetap berbasis bukti.',
    },
  ],

  connections: [
    {
      id: 'conn-1',
      evidenceA: 'ev-water-report',
      evidenceB: 'ev-garden-schedule',
      relationTitle: 'Korelasi Silang: Deviasi Volume vs Alokasi Irigasi',
      options: [
        {
          id: 'opt-c1-correct',
          text: 'Selisih kenaikan 360 liter dari laporan utilitas berkolerasi sempurna dengan total alokasi 2 sesi irigasi taman (2 × 180 L).',
          isCorrect: true,
          feedback: 'Analisis kuantitatif brilian! Selisih volume tersebut terjawab habis oleh aktivitas taman.',
        },
        {
          id: 'opt-c1-wrong',
          text: 'Angka 360 liter tidak berkaitan dengan aktivitas taman karena menggunakan jaringan pipa terpisah.',
          isCorrect: false,
          feedback: 'Keliru. Jaringan taman menyatu langsung dengan jalur distribusi utama meteran.',
        },
      ],
      deductionExplanation: 'Kalkulasi silang membuktikan bahwa seluruh surplus konsumsi air teralokasikan secara sah untuk pemeliharaan botani.',
      unlockedInsight: 'Insight Terbuka: Misteri selisih 360 liter teridentifikasi sepenuhnya sebagai volume konsumsi legal!',
    },
    {
      id: 'conn-weather',
      evidenceA: 'ev-weather-station',
      evidenceB: 'ev-garden-schedule',
      relationTitle: 'Korelasi Klimatologi: Suhu Ekstrem vs Kebutuhan Irigasi',
      options: [
        {
          id: 'opt-cw-correct',
          text: 'Kenaikan suhu 34°C dan indeks evaporasi tinggi membenarkan perlunya eksekusi irigasi tambahan secara logis.',
          isCorrect: true,
          feedback: 'Deduksi cuaca yang brilian! Faktor lingkungan menjelaskan alasan ekologis di balik lonjakan volume.',
        },
        {
          id: 'opt-cw-wrong',
          text: 'Suhu panas tidak berpengaruh pada penyerapan air tanaman.',
          isCorrect: false,
          feedback: 'Keliru. Suhu tinggi mempercepat transpirasi dan evaporasi tanah secara signifikan.',
        },
      ],
      deductionExplanation: 'Variabel cuaca panas mengonfirmasi bahwa penambahan sesi irigasi adalah tindakan preventif yang valid.',
      unlockedInsight: 'Insight Terbuka: Faktor pemicu lingkungan (cuaca ekstrem) dari anomali air berhasil diidentifikasi!',
    },
    {
      id: 'conn-2',
      evidenceA: 'ev-water-meter',
      evidenceB: 'ev-checklist',
      relationTitle: 'Audit Sistemik: Uji Tekanan vs Flow Meter Statis',
      options: [
        {
          id: 'opt-c2-correct',
          text: 'Stabilitas tekanan 2,4 bar dan berhentinya rotor flow meter saat katup ditutup secara mutlak menggugurkan asumsi kebocoran pipa.',
          isCorrect: true,
          feedback: 'Deduksi logis yang kuat! Sistem perpipaan terbukti tertutup rapat dan kedap sempurna.',
        },
        {
          id: 'opt-c2-wrong',
          text: 'Tekanan 2,4 bar membuktikan adanya kebocoran tersembunyi yang mendesak keluar dari sambungan pipa.',
          isCorrect: false,
          feedback: 'Salah penafsiran mekanika fluida. Tekanan statis yang stabil justru menunjukkan tidak ada celah.',
        },
      ],
      deductionExplanation: 'Kombinasi data flow meter dan sertifikat audit hidrostatis secara definitif mengeliminasi hipotesis kebocoran.',
      unlockedInsight: 'Insight Terbuka: Hipotesis kerusakan pipa bawah tanah Pak Joko resmi gugur secara ilmiah!',
    },
  ],

  resolutions: [
    {
      id: 'res-garden-watering',
      title: 'Irigasi Mikro Intensif Respons Cuaca Ekstrem',
      summary:
        'Lonjakan konsumsi air sebesar 360 liter murni disebabkan oleh pelaksanaan 2 sesi irigasi mikro tambahan (2 × 180 liter) untuk merawat spesimen Anggrek Mistika guna mengantisipasi suhu puncak 34°C.',
      isCorrect: true,
      requiredEvidenceIds: ['ev-water-report', 'ev-weather-station', 'ev-garden-schedule', 'ev-witness', 'ev-checklist'],
      feedback:
        'Investigasi Sempurna! Anda berhasil memadukan matematika tingkat lanjut, analisis termodinamika cuaca, kritik literasi bahasa, dan verifikasi bukti silang untuk memecahkan anomali ini secara profesional.',
    },
    {
      id: 'res-pipe-leak',
      title: 'Kegagalan Struktural Pipa Bawah Tanah',
      summary:
        'Terjadi kebocoran tersembunyi pada sambungan pipa sekunder bawah tanah yang mengalirkan air ke dalam tanah.',
      isCorrect: false,
      requiredEvidenceIds: ['ev-water-meter'],
      feedback: 'Analisis keliru. Audit tekanan hidrostatis 2,4 bar dan uji flow meter tertutup secara mutlak membuktikan jaringan pipa utuh.',
    },
    {
      id: 'res-student-attendance',
      title: 'Lonjakan Beban Kapasitas Asrama',
      summary: 'Peningkatan konsumsi dipicu oleh kedatangan delegasi tamu tak terduga yang memadati fasilitas sanitasi akademi.',
      isCorrect: false,
      requiredEvidenceIds: [],
      feedback: 'Tidak akurat. Premis kasus menegaskan bahwa jumlah populasi dan beban harian di asrama tidak mengalami perubahan.',
    },
  ],

  dialogues: {
    'intro-1': {
      id: 'intro-1',
      speaker: 'Aria',
      speakerTitle: 'Kepala Arsip Investigasi',
      portrait: '/src/assets/images/mysteria_guide_aria_1793849663528.jpg',
      text:
        'Selamat datang kembali di Divisi Arsip Rahasia Akademi Mysteria. Kompleksitas arsip kali ini mencakup variabel meteorologi dan logika bersyarat yang menuntut standar nalar analitis tinggi.',
      nextNodeId: 'intro-2',
    },
    'intro-2': {
      id: 'intro-2',
      speaker: 'Aria',
      speakerTitle: 'Kepala Arsip Investigasi',
      portrait: '/src/assets/images/mysteria_guide_aria_1793849663528.jpg',
      text:
        'Jangan terburu-buru mengambil kesimpulan emosional seperti kepanikan Pak Joko. Uji setiap variabel cuaca, konversi satuan, dan klaim retoris dengan data yang sahih.',
      choices: [
        {
          text: 'Saya siap menghadapi tantangan analitis ini, Aria!',
          nextNodeId: 'intro-3a',
          impactText: 'Mentalitas penyelidik tingkat lanjut dicatat dalam arsip.',
        },
        {
          text: 'Mengapa variabel cuaca dilibatkan dalam penyelidikan ini?',
          nextNodeId: 'intro-3b',
          impactText: 'Pendekatan metodenya dievaluasi secara kritis.',
        },
      ],
    },
    'intro-3a': {
      id: 'intro-3a',
      speaker: 'Aria',
      speakerTitle: 'Kepala Arsip Investigasi',
      portrait: '/src/assets/images/mysteria_guide_aria_1793849663528.jpg',
      text:
        'Bagus! Kasus MYS-001: "Tetes Terakhir: Anomali Hidraulik" menanti ketelitianmu. Periksa stasiun cuaca, hitung konversinya, dan buktikan kebenarannya di Papan Deduksi.',
      nextNodeId: 'intro-end',
    },
    'intro-3b': {
      id: 'intro-3b',
      speaker: 'Aria',
      speakerTitle: 'Kepala Arsip Investigasi',
      portrait: '/src/assets/images/mysteria_guide_aria_1793849663528.jpg',
      text:
        'Karena lingkungan alam dan cuaca sangat memengaruhi perilaku konsumsi utilitas. Sains menghubungkan suhu panas dengan laju evaporasi secara logis.',
      nextNodeId: 'intro-end',
    },
  },
};