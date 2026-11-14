import { useState } from 'react';
import { Icon, DataTable } from './ui.jsx';

// Kartu bukti bergaya kertas arsip; dipakai di Jurnal dan di tinjauan Kesimpulan.
export function EvidenceDetail({ ev, collected = true, note, onNote }) {
  return (
    <article className="paper-card evidence-detail" aria-labelledby={`ev-${ev.id}`}>
      <header className="ev-head">
        <span className="ev-code">{ev.code}</span>
        <span className={`status-chip ${collected ? 'ok' : ''}`}>
          <Icon name={collected ? 'CircleCheck' : 'Lock'} size={14} /> {collected ? 'Terkumpul' : 'Belum ditemukan'}
        </span>
      </header>
      <h3 id={`ev-${ev.id}`} className="ev-title"><Icon name={ev.icon} size={22} /> {ev.title}</h3>
      <p className="ev-source"><Icon name="MapPin" size={14} /> {ev.source}</p>
      <p>{ev.description}</p>
      {ev.quote && <blockquote className="doc-quote">“{ev.quote}”</blockquote>}
      {ev.data && (
        <>
          <h4 className="mini-title">Informasi penting</h4>
          <dl className="data-list">
            {ev.data.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      <DataTable table={ev.table} />
      {ev.note && <blockquote className="doc-note">{ev.note}</blockquote>}
      {onNote && (
        <div className="note-field">
          <label htmlFor={`note-${ev.id}`}>Catatan penyelidik (opsional)</label>
          <textarea
            id={`note-${ev.id}`}
            rows={2}
            maxLength={240}
            value={note || ''}
            placeholder="Tulis pendapatmu tentang bukti ini..."
            onChange={(e) => onNote(ev.id, e.target.value)}
          />
        </div>
      )}
    </article>
  );
}

export default function EvidenceInventory({ caseDef, cs, actions }) {
  const [selected, setSelected] = useState(null);
  const total = caseDef.evidenceOrder.length;
  const sel = selected && cs.collected.includes(selected) ? caseDef.evidence[selected] : null;

  return (
    <div className={`journal ${sel ? 'has-selection' : ''}`}>
      <section className="journal-list" aria-labelledby="journal-title">
        <div className="panel-head">
          <h2 id="journal-title" className="panel-title"><Icon name="BookOpen" size={18} /> Jurnal Penyelidik</h2>
          <span className="mono-chip">{cs.collected.length}/{total}</span>
        </div>
        <ul className="ev-list">
          {caseDef.evidenceOrder.map((id) => {
            const ev = caseDef.evidence[id];
            const has = cs.collected.includes(id);
            return (
              <li key={id}>
                {has ? (
                  <button type="button" className={`ev-item ${selected === id ? 'is-selected' : ''}`} onClick={() => setSelected(id)} aria-pressed={selected === id}>
                    <Icon name={ev.icon} size={20} />
                    <span className="ev-item-body">
                      <span className="ev-item-code">{ev.code}{!ev.core && ' · opsional'}</span>
                      <span className="ev-item-title">{ev.title}</span>
                      <span className="ev-item-sum">{ev.summary}</span>
                    </span>
                    <span className="status-chip ok"><Icon name="CircleCheck" size={14} /> Terkumpul</span>
                  </button>
                ) : (
                  <div className="ev-item is-empty">
                    <Icon name="Lock" size={20} />
                    <span className="ev-item-body">
                      <span className="ev-item-code">{ev.code}</span>
                      <span className="ev-item-title">Bukti belum ditemukan</span>
                      <span className="ev-item-sum">Petunjuk lokasi: {ev.source.split('—')[0].trim()}</span>
                    </span>
                    <span className="status-chip">Belum</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {cs.collected.length >= 2 && (
          <button type="button" className="btn" onClick={() => actions.openView('board')}>
            <Icon name="Network" size={18} /> Hubungkan di Papan Bukti
          </button>
        )}
      </section>

      <section className="journal-detail" aria-live="polite">
        {sel ? (
          <>
            <button type="button" className="btn btn-ghost back-btn" onClick={() => setSelected(null)}>
              <Icon name="ChevronLeft" size={18} /> Kembali ke daftar
            </button>
            <EvidenceDetail ev={sel} note={cs.notes[sel.id]} onNote={actions.setNote} />
          </>
        ) : (
          <div className="empty-state">
            <Icon name="BookOpen" size={40} />
            <p>Pilih bukti di daftar untuk membacanya kembali.</p>
            {!cs.collected.length && <p className="muted">Jurnalmu masih kosong. Jelajahi lokasi dan kumpulkan bukti pertamamu.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
