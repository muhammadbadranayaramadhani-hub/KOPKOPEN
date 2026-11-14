# MYSTERIA: The Academy of Hidden Knowledge

Game misteri edukasi (visual novel + investigasi titik-dan-klik) untuk siswa SMA/MA kelas X–XII (Kurikulum Merdeka).
Kasus pertama, **MYS-001 "The Last Drop"**, bisa dimainkan dari menu sampai kesimpulan.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil di dist/
npm test           # tes logika game (node:test, tanpa dependensi tambahan)
```

Butuh Node.js 18+. Progres tersimpan otomatis di `localStorage` (kunci `mysteria.save.v1`).

## Cara bermain

1. **Penyelidikan Baru** → prolog (masukkan nama) → **Arsip Kasus** → **Buka Kasus**.
2. Jelajahi tiga lokasi, ketuk titik berpendar, kumpulkan bukti. Tidak semua benda adalah bukti.
3. Bukti membuka **Tantangan** (Matematika, IPA, Bahasa Indonesia). Jawaban salah dijelaskan, petunjuk bertahap tersedia, jawaban baru diperlihatkan hanya atas permintaan pemain.
4. Hubungkan bukti di **Papan Bukti** (pilih dua kartu, pilih hubungan *dan* alasannya).
5. Setelah 4 hubungan inti terbukti dan semua tantangan selesai, **Kesimpulan** terbuka. Kesimpulan dinilai dari bukti dan angka yang dipilih, bukan sekadar pilihan benar.

Keyboard: Enter/Spasi/→ melanjutkan dialog, tombol 1–9 memilih jawaban dialog, Esc menutup panel.

## Struktur

```
src/
  components/   UI (MainMenu, DialogueBox, StoryScreen, InvestigationScene, InteractiveObject,
                EvidenceInventory, EvidenceBoard, KnowledgeChallenge, CaseResolution,
                ResultScreen, CaseArchive, ProgressPanel, SettingsScreen, SceneBackground, ...)
  data/
    characters.js  evidence.js  intro.js
    cases/theLastDrop.js   <- seluruh konten kasus (lokasi, skrip, soal, hubungan, kesimpulan)
    cases/index.js         <- daftar kasus
  engines/      logika murni tanpa React
    StoryEngine  InvestigationEngine  EvidenceEngine  PuzzleEngine  ProgressEngine
  styles/       theme.css (token Dream Archive)  global.css
tests/          engines.test.mjs
```

## Menambah kasus baru

1. Salin `src/data/cases/theLastDrop.js` sebagai kerangka (lokasi + hotspot, bukti, `scripts`,
   `challenges`, `connections`, `objectives`, `resolution`).
2. Daftarkan di `src/data/cases/index.js` (`CASES` dan `CASE_LIST`).
3. Latar baru: tambahkan komponen adegan di `SceneBackground.jsx`.

Bahasa syarat yang sama dipakai di seluruh data: `{ collected, inspected, solved, connections, finalSolved, ready }`.

## Data kasus MYS-001 (harus selalu konsisten)

| Data | Nilai |
|---|---|
| Konsumsi normal | 1.200 liter |
| Hari penyelidikan | 1.560 liter |
| Selisih | 1.560 − 1.200 = **360 liter** |
| Sesi tambahan | 2 × 180 = **360 liter** |
| Murid hadir | 420 orang setiap hari |

`npm test` memeriksa bahwa tidak ada angka liter lain yang bertentangan di seluruh data kasus.

---

# Integrasi AI Gemini (RENNTZY · REI · NOPAL · ASTRA · NYX)

## Arsitektur
```
Browser (React) ──/api/ai/*──▶ Express (server/) ──▶ Gemini (@google/genai)
   tanpa kunci                  GEMINI_API_KEY hanya di server/.env
```
- `server/routes/*`: `companion`, `interrogation`, `tutor`, `evaluation`, `challenge`; `server/app.js` merakit middleware (header keamanan, CORS terbatas, batas body 32 KB, rate limit, penanganan galat).
- `server/services/contextManager.js`: konteks per identitas hanya berisi bukti yang SUDAH ditemukan pemain; solusi resmi (`server/data/case001.js → SOLUTION`) tidak pernah masuk prompt RENNTZY/REI/NOPAL.
- `server/services/guard.js`: keluaran AI diperiksa kode (spoiler, angka di luar pengetahuan karakter, kebocoran jawaban soal); bila melanggar diminta ulang sekali, lalu diganti jawaban aman bertanda `source:"guard"`.
- Fakta resmi (1.560 − 1.200 = 360; 2 × 180 = 360) dihitung dengan JS deterministik, bukan oleh AI. AI tidak dapat membuka lokasi, memberi bukti, mengubah progres, atau menentukan kasus selesai.
- Gemini tidak aktif / gagal → game tetap berjalan; UI menampilkan status dan tombol "Coba lagi". Tidak ada jawaban AI palsu.

## Instalasi
```bash
npm run install:all            # frontend + server
cp server/.env.example server/.env
# isi GEMINI_API_KEY di server/.env
```
Kunci API: buka https://aistudio.google.com/apikey → Create API key → salin ke `server/.env`. **Jangan** menaruhnya di frontend, LocalStorage, atau repositori (`.env` sudah ada di `.gitignore`).

## Menjalankan
```bash
npm run server      # terminal 1 → http://127.0.0.1:8787
npm run dev         # terminal 2 → http://localhost:5173 (proxy /api → backend)
```
Dari HP/perangkat lain di jaringan yang sama: buka `http://<IP-komputer>:5173` (Vite sudah `host: true`); backend cukup tetap di `127.0.0.1` karena diakses lewat proxy Vite.

## Pengujian
```bash
npm test            # mesin game + 19 tes rute AI (AI tiruan)
npm run test:http   # tes HTTP (butuh express terpasang)
```

## Deploy
Build `npm run build`, sajikan `dist/` lewat web server/reverse proxy yang meneruskan `/api` ke `node server/index.js` (set `HOST`, `PORT`, `TRUST_PROXY=1`, `ALLOWED_ORIGINS` bila beda origin). Simpan `GEMINI_API_KEY` sebagai environment variable/secret platform.

## Cakupan SMA/MA (Kelas X–XII)
- Profil belajar (Kelas X/XI/XII, 15 mata pelajaran, tingkat Mudah/Menengah/HOTS) dipilih di Pengaturan, panel NOPAL, atau panel NYX, disimpan di `save.settings.learner`, dan dikirim sebagai `learner` pada setiap permintaan AI.
- Sumber data tunggal: `src/data/curriculum.js` (dipakai frontend dan backend). Ketersediaan mapel berbeda per sekolah; AI diminta mengakui bila ragu soal capaian pembelajaran resmi.
- Tantangan resmi MYS-001 (berhitung selisih/perkalian) tidak ditulis ulang agar cerita utuh; tingkat SMA berlaku untuk RENNTZY, REI, NOPAL, ASTRA, dan soal NYX.
- `POST /api/ai/evaluate` dengan `kind:"practice"` menilai alasan siswa pada soal NYX (rubrik penalaran + konsep); benar/salah tetap dihitung kode.

## Memakai Groq (alternatif Gemini)
Di `server/.env`:
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...        # dari https://console.groq.com/keys
GROQ_MODEL=openai/gpt-oss-120b
```
Restart backend; log harus menampilkan `Groq aktif`. Semua fitur (RENNTZY, REI, NOPAL, ASTRA, NYX), guard, dan validasi sama; hanya penyedia AI yang berganti. Untuk Gemini kembalikan `AI_PROVIDER=gemini`.
