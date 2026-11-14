import SceneBackground from './SceneBackground.jsx';
import { Icon, Ornament } from './ui.jsx';

// Pintu masuk arsip: layar pertama permainan.
export default function MainMenu({ canContinue, continueHint, onContinue, onNew, onArchive, onSettings }) {
  return (
    <div className="menu-screen">
      <SceneBackground id="gate" />
      <div className="menu-panel">
        <p className="eyebrow">Akademi Pengetahuan Tersembunyi</p>
        <h1 className="logo">MYSTERIA</h1>
        <Ornament />
        <p className="subtitle">The Academy of Hidden Knowledge</p>
        <p className="menu-intro">
          Sebuah undangan tanpa nama membawamu ke akademi tua penyimpan kasus-kasus yang belum terpecahkan.
          Jelajahi, kumpulkan bukti, lalu hubungkan petunjuk. Setiap jawaban yang kamu temukan membuka sedikit lagi kebenaran.
        </p>
        <nav className="menu-buttons" aria-label="Menu utama">
          <button type="button" className="btn btn-primary btn-big" onClick={onContinue} disabled={!canContinue}>
            <Icon name="Play" size={18} /> Lanjutkan Cerita
          </button>
          {!canContinue && <p className="menu-hint">{continueHint}</p>}
          <button type="button" className="btn btn-big" onClick={onNew}>
            <Icon name="Search" size={18} /> Penyelidikan Baru
          </button>
          <button type="button" className="btn btn-big" onClick={onArchive}>
            <Icon name="Archive" size={18} /> Arsip Kasus
          </button>
          <button type="button" className="btn btn-big" onClick={onSettings}>
            <Icon name="Settings" size={18} /> Pengaturan
          </button>
        </nav>
        <p className="menu-foot">Untuk siswa SMA/MA kelas X–XII · 15 mata pelajaran · Mudah, Menengah, HOTS</p>
      </div>
    </div>
  );
}
