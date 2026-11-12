import { useState } from 'react';
import { Icon } from '../ui.jsx';
import AiChat from './AiChat.jsx';
import { STATUS_LABEL } from './useAiStatus.js';
import { ai, buildProgress } from '../../services/aiClient.js';

export const REI_CHARACTER_BY_SCRIPT = { 'interview-darmo': 'darmo', 'interview-sari': 'sari' };
const NAMES = { darmo: 'Pak Darmo', sari: 'Sari' };

// REI: tanya bebas ke karakter yang sedang diwawancarai. Tampil di dalam layar wawancara yang sudah ada;
// pilihan dialog bawaan tetap berfungsi dan satu-satunya yang memberi bukti.
export default function ReiTalk({ characterId, cs, status, onRecheck, learner }) {
  const [open, setOpen] = useState(false);
  const name = NAMES[characterId] || 'Narasumber';
  const available = status === 'online';

  const send = async (text, history) => {
    const data = await ai.interrogate({ characterId, message: text, history, progress: buildProgress(cs), learner });
    return { text: data.reply, meta: data.source === 'guard' ? { note: 'Jawaban disaring sistem.' } : null };
  };

  return (
    <div className="rei">
      <button type="button" className="btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="rei-panel">
        <Icon name="MessageCircle" size={18} /> <span className="hide-sm">Tanya langsung</span><span className={`ai-dot is-${status}`} aria-hidden="true" />
      </button>
      {open && (
        <section id="rei-panel" className="rei-panel" aria-label={`Tanya langsung ke ${name}`}>
          <header className="renntzy-head">
            <div>
              <strong>Tanya {name}</strong>
              <span className={`ai-status is-${status}`} role="status">{STATUS_LABEL[status]}</span>
            </div>
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="Tutup kolom tanya"><Icon name="X" size={18} /></button>
          </header>
          {!available && status !== 'checking' ? (
            <div className="ai-offline" role="note">
              <Icon name="WifiOff" size={16} />
              <span>Pertanyaan bebas butuh AI yang terhubung. Gunakan pilihan dialog di bawah; semua bukti tetap bisa didapat.</span>
              <button type="button" className="btn btn-small" onClick={onRecheck}><Icon name="RotateCcw" size={14} /> Cek lagi</button>
            </div>
          ) : (
            <AiChat idPrefix="rei" botLabel={name} userLabel="Kamu" send={send} disabled={!available} placeholder={`Tanya ${name}…`} intro={`Ajukan pertanyaanmu sendiri ke ${name}. Ia hanya menjawab sesuai yang ia ketahui.`} />
          )}
        </section>
      )}
    </div>
  );
}
