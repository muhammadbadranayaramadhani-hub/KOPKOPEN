import { Icon } from './ui.jsx';
import { BADGES, RANKS } from '../engines/ProgressEngine.js';

export default function ProgressPanel({ save, points, rank, cases }) {
  const earned = save.profile.badges || [];
  const completed = Object.values(save.profile.cases).filter((c) => c.status === 'completed').length;
  const evCount = save.current ? save.current.collected.length : null;
  return (
    <section className="progress-panel" aria-label="Profil penyelidik">
      <div className="rank-card">
        <div className="rank-seal" aria-hidden="true"><Icon name="Award" size={30} /></div>
        <div>
          <p className="eyebrow">{save.player.name || 'Penyelidik'}</p>
          <h3 className="rank-name">{rank.name}</h3>
          <p className="mono-chip">{points} poin pengetahuan</p>
        </div>
      </div>
      <div className="rank-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(rank.progress * 100)} aria-label="Kemajuan menuju pangkat berikutnya">
        <span style={{ width: `${Math.round(rank.progress * 100)}%` }} />
      </div>
      <p className="muted">
        {rank.next ? `${rank.next.min - points} poin lagi menuju ${rank.next.name}.` : 'Pangkat tertinggi tercapai.'}
      </p>
      <ul className="stat-row">
        <li><strong>{completed}</strong><span>kasus selesai</span></li>
        <li><strong>{Object.keys(cases).length}</strong><span>kasus dimainkan</span></li>
        <li><strong>{evCount === null ? '—' : evCount}</strong><span>bukti kasus ini</span></li>
        <li><strong>{earned.length}/{Object.keys(BADGES).length}</strong><span>lencana</span></li>
      </ul>
      <h4 className="mini-title">Lencana</h4>
      <ul className="badge-grid">
        {Object.entries(BADGES).map(([id, b]) => {
          const has = earned.includes(id);
          return (
            <li key={id} className={`badge ${has ? 'is-earned' : ''}`}>
              <Icon name={has ? b.icon : 'Lock'} size={22} />
              <span className="badge-name">{b.name}</span>
              <span className="badge-desc">{b.desc}</span>
              <span className="badge-state">{has ? 'Diraih' : 'Belum diraih'}</span>
            </li>
          );
        })}
      </ul>
      <h4 className="mini-title">Jenjang pangkat</h4>
      <ol className="rank-ladder">
        {RANKS.map((r, i) => (
          <li key={r.name} className={i === rank.index ? 'is-current' : i < rank.index ? 'is-done' : ''}>
            {r.name} <span className="mono-chip">{r.min}+</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
