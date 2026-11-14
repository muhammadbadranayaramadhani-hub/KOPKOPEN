import SceneBackground from './SceneBackground.jsx';
import { Icon } from './ui.jsx';
import LearnerPicker from './ai/LearnerPicker.jsx';

const OPTIONS = [
  {
    key: 'textSpeed',
    label: 'Kecepatan teks dialog',
    help: 'Teks selalu bisa ditampilkan penuh dengan menekan Lanjut.',
    choices: [['lambat', 'Lambat'], ['normal', 'Normal'], ['cepat', 'Cepat'], ['langsung', 'Langsung']],
  },
  {
    key: 'textSize',
    label: 'Ukuran teks',
    help: 'Perbesar teks agar lebih nyaman dibaca.',
    choices: [['normal', 'Normal'], ['large', 'Besar']],
  },
  {
    key: 'motion',
    label: 'Gerakan & animasi',
    help: 'Kurangi animasi latar dan efek berpendar.',
    choices: [['auto', 'Ikuti perangkat'], ['reduce', 'Kurangi'], ['full', 'Penuh']],
  },
];

export default function SettingsScreen({ settings, onChange, onReset, onBack }) {
  return (
    <div className="settings-screen">
      <SceneBackground id="hall" />
      <div className="archive-wrap narrow">
        <header className="archive-head">
          <button type="button" className="btn btn-ghost" onClick={onBack}><Icon name="ChevronLeft" size={18} /> Kembali</button>
          <div>
            <p className="eyebrow">Pengaturan</p>
            <h1 className="page-title">Kenyamanan Bermain</h1>
          </div>
        </header>
        <div className="paper-card dark">
          <fieldset className="setting">
            <legend>Profil belajar (SMA/MA)</legend>
            <p className="muted">Dipakai RENNTZY, NOPAL, ASTRA, dan NYX untuk menyesuaikan materi dan tingkat soal.</p>
            <LearnerPicker learner={settings.learner} onChange={(learner) => onChange({ learner })} idPrefix="set" />
          </fieldset>
          {OPTIONS.map((o) => (
            <fieldset key={o.key} className="setting">
              <legend>{o.label}</legend>
              <p className="muted">{o.help}</p>
              <div className="seg" role="radiogroup" aria-label={o.label}>
                {o.choices.map(([val, name]) => (
                  <label key={val} className={`seg-item ${settings[o.key] === val ? 'is-checked' : ''}`}>
                    <input type="radio" name={o.key} value={val} checked={settings[o.key] === val} onChange={() => onChange({ [o.key]: val })} />
                    <span>{settings[o.key] === val && <Icon name="Check" size={14} />} {name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="setting">
            <h2 className="setting-h">Data permainan</h2>
            <p className="muted">Progres tersimpan otomatis di perangkat ini. Menghapus data tidak dapat dibatalkan.</p>
            <button type="button" className="btn btn-danger" onClick={onReset}><Icon name="Trash2" size={18} /> Hapus semua progres</button>
          </div>
        </div>
      </div>
    </div>
  );
}
