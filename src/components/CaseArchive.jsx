import SceneBackground from './SceneBackground.jsx';
import ProgressPanel from './ProgressPanel.jsx';
import { Icon, Stars } from './ui.jsx';
import { CASES, CASE_LIST } from '../data/cases/index.js';
import { caseStatus } from '../engines/ProgressEngine.js';

const LABEL = { locked: 'Terkunci', available: 'Tersedia', inProgress: 'Sedang berjalan', completed: 'Selesai' };

export default function CaseArchive({ save, points, rank, highlight, onBack, onStart, onContinue, onReport, onReplay, onNewGame }) {
  return (
    <div className="archive-screen">
      <SceneBackground id="archive" />
      <div className="archive-wrap">
        <header className="archive-head">
          <button type="button" className="btn btn-ghost" onClick={onBack}><Icon name="ChevronLeft" size={18} /> Kembali</button>
          <div>
            <p className="eyebrow">Arsip Penyelidikan</p>
            <h1 className="page-title">Arsip Kasus</h1>
          </div>
        </header>

        <div className="archive-grid">
          <section aria-label="Daftar kasus" className="case-col">
            {!save.started && (
              <div className="paper-card">
                <p>Arsip masih tertutup. Mulai penyelidikan baru untuk membuka kasus pertamamu.</p>
                <button type="button" className="btn btn-primary" onClick={onNewGame}><Icon name="Search" size={18} /> Penyelidikan Baru</button>
              </div>
            )}
            {CASE_LIST.map((entry) => {
              const c = CASES[entry.id];
              const prevDone = !entry.requires || (save.profile.cases[entry.requires] && save.profile.cases[entry.requires].status === 'completed');

              if (!entry.playable || !c || !prevDone) {
                const title = c ? c.title : entry.title;
                const tagline = c ? c.tagline : entry.tagline;
                const subjects = c ? c.subjects : entry.subjects;
                return (
                  <article key={entry.id} className="case-card is-locked" aria-label={`${title}, terkunci`}>
                    <p className="case-id">{entry.id}</p>
                    <h2 className="case-title"><Icon name="Lock" size={18} /> {title}</h2>
                    <p>{tagline}</p>
                    <p className="muted">
                      {entry.requires
                        ? `Map ini masih tersegel. Selesaikan kasus ${entry.requires} terlebih dahulu untuk membukanya.`
                        : 'Map ini masih tersegel. Selesaikan kasus sebelumnya untuk membukanya nanti.'}
                    </p>
                    <p className="chips">{subjects.map((s) => <span key={s} className="chip">{s}</span>)}</p>
                  </article>
                );
              }

              const status = caseStatus(save, c.id);
              const rec = save.profile.cases[c.id];
              return (
                <article key={c.id} className={`case-card is-${status} ${highlight === c.id ? 'is-new' : ''}`} aria-labelledby={`case-${c.id}`}>
                  <div className="case-top">
                    <p className="case-id">{c.id}</p>
                    <span className={`status-chip ${status === 'completed' ? 'ok' : ''}`}>
                      <Icon name={status === 'completed' ? 'CircleCheck' : status === 'locked' ? 'Lock' : 'Search'} size={14} /> {LABEL[status]}
                    </span>
                    {highlight === c.id && <span className="status-chip new">Kasus baru</span>}
                  </div>
                  <h2 id={`case-${c.id}`} className="case-title">{c.title}</h2>
                  <p>{c.synopsis}</p>
                  <dl className="case-meta">
                    <div><dt>Lokasi</dt><dd>{c.place}</dd></div>
                    <div><dt>Tingkat</dt><dd>{c.difficulty}</dd></div>
                    <div><dt>Durasi</dt><dd>{c.duration}</dd></div>
                  </dl>
                  <p className="chips">{c.subjects.map((s) => <span key={s} className="chip">{s}</span>)}</p>
                  {rec && rec.status === 'completed' && (
                    <p className="case-score"><Stars value={rec.bestStars} /> <span className="mono-chip">{rec.bestPoints} poin terbaik</span></p>
                  )}
                  <div className="btn-row">
                    {status === 'locked' && <p className="muted">Selesaikan pengenalan akademi terlebih dahulu (Penyelidikan Baru).</p>}
                    {status === 'available' && <button type="button" className="btn btn-primary" onClick={() => onStart(c.id)}><Icon name="Play" size={18} /> Buka Kasus</button>}
                    {status === 'inProgress' && <button type="button" className="btn btn-primary" onClick={() => onContinue(c.id)}><Icon name="Play" size={18} /> Lanjutkan Kasus</button>}
                    {status === 'completed' && (
                      <>
                        <button type="button" className="btn btn-primary" onClick={() => onReport(c.id)}><Icon name="BookOpen" size={18} /> Lihat Laporan</button>
                        <button type="button" className="btn" onClick={() => onReplay(c.id)}><Icon name="RotateCcw" size={18} /> Ulangi Kasus</button>
                      </>
                    )}
                    {status === 'inProgress' && <button type="button" className="btn" onClick={() => onReplay(c.id)}><Icon name="RotateCcw" size={18} /> Mulai dari awal</button>}
                  </div>
                </article>
              );
            })}
          </section>
          <aside className="profile-col paper-card dark">
            <ProgressPanel save={save} points={points} rank={rank} cases={save.profile.cases} />
          </aside>
        </div>
      </div>
    </div>
  );
}