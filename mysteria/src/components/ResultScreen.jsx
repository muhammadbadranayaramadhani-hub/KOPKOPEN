import SceneBackground from './SceneBackground.jsx';
import { Icon, Stars, Ornament } from './ui.jsx';
import { BADGES } from '../engines/ProgressEngine.js';
import AstraReport from './ai/AstraReport.jsx';

const HYP = {
  leak: 'Dugaan awalmu adalah kebocoran pipa. Bukti menunjukkan sebaliknya, dan kamu berani mengubah kesimpulan. Itu tanda penyelidik yang baik.',
  usage: 'Dugaan awalmu tentang kegiatan yang memakai banyak air ternyata benar, dan sekarang kamu bisa membuktikannya dengan angka.',
  data: 'Kamu memulai dari data tanpa menebak lebih dulu, dan itu membuat kesimpulanmu lebih kuat.',
};

export default function ResultScreen({ caseDef, result, rank, points, rankUp, onArchive, onReplay, onMenu, astra }) {
  const r = caseDef.resolution;
  const supporting = caseDef.evidenceOrder.filter((id) => r.requiredEvidence.includes(id) || ['E2', 'E4', 'E5'].includes(id));
  return (
    <div className="result-screen">
      <SceneBackground id="archive" />
      <div className="archive-wrap narrow">
        <header className="result-head">
          <p className="eyebrow">Kasus {caseDef.id} · Terpecahkan</p>
          <h1 className="page-title">{caseDef.title}</h1>
          <Stars value={result.stars} />
          <Ornament />
          <p className="result-headline">{r.solution.headline}</p>
        </header>

        <section className="paper-card" aria-labelledby="res-truth">
          <h2 id="res-truth" className="ev-title"><Icon name="Search" size={20} /> Apa yang sebenarnya terjadi</h2>
          {r.solution.story.map((p, i) => <p key={i}>{p}</p>)}
          <p className="calc-line" role="math" aria-label="1.560 dikurangi 1.200 sama dengan 360, dan 2 kali 180 sama dengan 360">
            1.560 − 1.200 = <strong>360</strong> liter &nbsp;|&nbsp; 2 × 180 = <strong>360</strong> liter
          </p>
        </section>

        <section className="paper-card" aria-labelledby="res-ev">
          <h2 id="res-ev" className="ev-title"><Icon name="Pin" size={20} /> Bukti yang mendukung</h2>
          <ul className="support-list">
            {supporting.map((id) => (
              <li key={id}><strong>{caseDef.evidence[id].code}</strong> {caseDef.evidence[id].title}<br /><span className="muted">{caseDef.evidence[id].summary}</span></li>
            ))}
          </ul>
          {result.reasoning && (
            <>
              <h3 className="mini-title">Penjelasanmu</h3>
              <blockquote className="doc-quote">“{result.reasoning}”</blockquote>
              {result.reasoningChecks.length > 0 && (
                <ul className="check-list">
                  {result.reasoningChecks.map((c) => (
                    <li key={c.id} className={c.hit ? 'is-hit' : ''}><Icon name={c.hit ? 'CircleCheck' : 'Circle'} size={16} /> {c.label}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          {result.hypothesis && <p className="muted">{HYP[result.hypothesis]}</p>}
        </section>

        <section className="paper-card" aria-labelledby="res-learn">
          <h2 id="res-learn" className="ev-title"><Icon name="Brain" size={20} /> Konsep yang kamu pelajari</h2>
          <ul className="concept-list">
            {caseDef.concepts.map((c, i) => (
              <li key={i}><Icon name={c.icon} size={18} /><span><strong>{c.subject}.</strong> {c.text}</span></li>
            ))}
          </ul>
        </section>

        {astra && <AstraReport astra={astra.data} busy={astra.busy} error={astra.error} canAsk={astra.canAsk} onRequest={astra.onRequest} />}

        <section className="paper-card dark" aria-labelledby="res-perf">
          <h2 id="res-perf" className="ev-title"><Icon name="Award" size={20} /> Performa penyelidikan</h2>
          <ul className="stat-row">
            <li><strong>{result.points}</strong><span>poin pengetahuan</span></li>
            <li><strong>{result.evidence}/{result.evidenceTotal}</strong><span>bukti terkumpul</span></li>
            <li><strong>{result.stepsSolved}/{result.stepsTotal}</strong><span>soal terselesaikan</span></li>
            <li><strong>{result.connections}/{result.connectionsTotal}</strong><span>hubungan bukti</span></li>
            <li><strong>{result.hints}</strong><span>petunjuk dipakai</span></li>
            <li><strong>{result.mistakes}</strong><span>jawaban meleset</span></li>
          </ul>
          <p className="rank-line">
            <Icon name="Award" size={18} /> Pangkat: <strong>{rank.name}</strong> ({points} poin total)
            {rankUp && <span className="status-chip new">Naik pangkat!</span>}
          </p>
          <h3 className="mini-title">Lencana kasus ini</h3>
          <ul className="badge-grid">
            {result.badges.map((id) => (
              <li key={id} className="badge is-earned">
                <Icon name={BADGES[id].icon} size={22} />
                <span className="badge-name">{BADGES[id].name}</span>
                <span className="badge-desc">{BADGES[id].desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="encourage">{caseDef.encouragement}</p>

        <div className="btn-row center">
          <button type="button" className="btn btn-primary" onClick={onArchive}><Icon name="Archive" size={18} /> Kembali ke Arsip</button>
          <button type="button" className="btn" onClick={onReplay}><Icon name="RotateCcw" size={18} /> Ulangi Kasus</button>
          <button type="button" className="btn btn-ghost" onClick={onMenu}><Icon name="House" size={18} /> Menu Utama</button>
        </div>
      </div>
    </div>
  );
}
