import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui.jsx';
import AiChat from './AiChat.jsx';
import { STATUS_LABEL } from './useAiStatus.js';
import { ai, buildProgress } from '../../services/aiClient.js';

// RENNTZY: pendamping penyelidikan melayang. Tombol kecil di sudut kanan-bawah (di atas dock navigasi),
// panel terbuka sebagai kartu kecil (desktop) atau lembar bawah (HP) dan bisa ditutup kapan saja.
export default function RenntzyCompanion({ cs, status, onRecheck, learner }) {
  const [open, setOpen] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const panelRef = useRef(null);
  const fabRef = useRef(null);
  const available = status === 'online';

  // Petunjuk dimulai lagi dari tingkat 1 setiap ada bukti baru.
  const evCount = cs.collected.length;
  useEffect(() => setHintLevel(0), [evCount]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); if (fabRef.current) fabRef.current.focus(); } };
    window.addEventListener('keydown', onKey);
    const first = panelRef.current && panelRef.current.querySelector('input');
    if (first) first.focus({ preventScroll: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (text, history, extra = {}) => {
    const level = extra.mode === 'hint' ? Math.min(3, hintLevel + 1) : hintLevel;
    const data = await ai.companion({ message: text, history, progress: buildProgress(cs), learner, mode: extra.mode || 'chat', hintLevel: level, evidenceId: extra.evidenceId });
    if (extra.mode === 'hint') setHintLevel(level);
    return { text: data.reply, meta: data.source === 'guard' ? { note: 'Jawaban disaring oleh sistem agar tidak membocorkan kesimpulan.' } : null };
  };

  const suggestions = [
    { label: 'Beri petunjuk', text: 'Bisakah kamu memberi petunjuk untuk langkah selanjutnya?', extra: { mode: 'hint' } },
    { label: 'Tinjau buktiku', text: 'Tolong bantu aku meninjau apa yang sudah kutemukan sejauh ini.', extra: { mode: 'review' } },
  ];

  return (
    <div className={`renntzy ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="renntzy-panel" ref={panelRef} role="dialog" aria-label="RENNTZY, pendamping penyelidikan">
          <header className="renntzy-head">
            <div>
              <strong><Icon name="Sparkles" size={16} /> RENNTZY</strong>
              <span className={`ai-status is-${status}`} role="status">{STATUS_LABEL[status]}</span>
            </div>
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => { setOpen(false); if (fabRef.current) fabRef.current.focus(); }} aria-label="Tutup RENNTZY"><Icon name="X" size={18} /></button>
          </header>
          {!available && status !== 'checking' && (
            <div className="ai-offline" role="note">
              <Icon name="WifiOff" size={16} />
              <span>{status === 'nokey' ? 'AI belum diaktifkan di server.' : 'Server AI tidak terhubung.'} Kamu tetap bisa bermain; gunakan tombol Petunjuk di setiap tantangan.</span>
              <button type="button" className="btn btn-small" onClick={onRecheck}><Icon name="RotateCcw" size={14} /> Cek lagi</button>
            </div>
          )}
          <AiChat
            idPrefix="renntzy"
            botLabel="RENNTZY"
            send={send}
            disabled={!available}
            suggestions={suggestions.map((s) => ({ ...s, disabled: !available }))}
            placeholder="Tanya RENNTZY tentang bukti…"
            intro="Halo, aku RENNTZY. Aku bisa membantumu membaca bukti dan memberi petunjuk bertahap, tapi kesimpulannya tetap kamu yang menemukan."
          />
        </section>
      )}
      <button type="button" ref={fabRef} className="renntzy-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Sembunyikan RENNTZY' : 'Buka RENNTZY, pendamping penyelidikan'}>
        <Icon name="Sparkles" size={22} />
        <span className="renntzy-fab-label hide-sm">RENNTZY</span>
        <span className={`ai-dot is-${status}`} aria-hidden="true" />
      </button>
    </div>
  );
}
