import { Icon } from './ui.jsx';

const DOCK = [
  { view: 'scene', label: 'Selidiki', icon: 'Search' },
  { view: 'journal', label: 'Jurnal', icon: 'BookOpen' },
  { view: 'board', label: 'Papan', icon: 'Network' },
  { view: 'challenges', label: 'Tantangan', icon: 'Brain' },
  { view: 'resolution', label: 'Kesimpulan', icon: 'Scale' },
];

// Rangka layar investigasi: bilah atas (HUD) + navigasi bawah.
export default function GameShell({ caseDef, view, points, rank, evidenceCount, newChallenges, ready, onView, onPause, children }) {
  const active = view === 'challenge' ? 'challenges' : view;
  return (
    <div className="shell">
      <header className="hud">
        <div className="hud-case">
          <span className="mono-chip">{caseDef.id}</span>
          <span className="hud-title">{caseDef.title}</span>
        </div>
        <div className="hud-right">
          <span className="hud-rank" title="Pangkat dan poin pengetahuan">
            <Icon name="Award" size={16} /> <span className="hide-sm">{rank.name} ·</span> {points} poin
          </span>
          <button type="button" className={`btn btn-ghost btn-icon ${view === 'objectives' ? 'is-active' : ''}`} onClick={() => onView('objectives')} aria-label="Buka daftar tujuan">
            <Icon name="Target" size={18} /> <span className="hide-sm">Tujuan</span>
          </button>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onPause} aria-label="Buka menu jeda">
            <Icon name="Menu" size={18} /> <span className="hide-sm">Jeda</span>
          </button>
        </div>
      </header>

      <main className="shell-main" id="game-main">{children}</main>

      <nav className="dock" aria-label="Navigasi penyelidikan">
        {DOCK.map((d) => {
          const locked = d.view === 'resolution' && !ready;
          const count = d.view === 'journal' ? evidenceCount : d.view === 'challenges' ? newChallenges : 0;
          return (
            <button
              key={d.view}
              type="button"
              className={`dock-btn ${active === d.view ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
              aria-current={active === d.view ? 'page' : undefined}
              aria-disabled={locked || undefined}
              onClick={() => onView(d.view)}
            >
              <Icon name={locked ? 'Lock' : d.icon} size={22} />
              <span className="dock-label">{d.label}</span>
              {count > 0 && <span className="dock-count" aria-label={d.view === 'journal' ? `${count} bukti` : `${count} tantangan baru`}>{count}</span>}
              {locked && <span className="sr-only"> (belum siap)</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
