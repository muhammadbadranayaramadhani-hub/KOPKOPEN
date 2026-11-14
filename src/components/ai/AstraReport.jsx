import { Icon } from '../ui.jsx';

const BARS = [
  ['conclusionAccuracy', 'Ketepatan kesimpulan'],
  ['evidenceRelevance', 'Relevansi bukti'],
  ['reasoningQuality', 'Kualitas penalaran'],
  ['educationalUnderstanding', 'Pemahaman konsep'],
];

// ASTRA: evaluasi penalaran SETELAH kasus selesai. Tidak menentukan lulus/gagal.
export default function AstraReport({ astra, busy, error, canAsk, onRequest }) {
  return (
    <section className="paper-card astra" aria-labelledby="res-astra">
      <h2 id="res-astra" className="ev-title"><Icon name="Brain" size={20} /> Evaluasi Penalaran oleh ASTRA</h2>
      {busy && <p role="status" className="muted"><span className="ai-dots" aria-hidden="true"><i /><i /><i /></span> ASTRA sedang menilai penalaranmu…</p>}
      {!busy && !astra && (
        <div className="ai-offline" role="note">
          <Icon name="WifiOff" size={16} />
          <span>{error ? error.message : 'Evaluasi AI belum dibuat. Hasil kasusmu tetap sah tanpa evaluasi ini.'}</span>
          {canAsk && <button type="button" className="btn btn-small" onClick={onRequest}><Icon name="RotateCcw" size={14} /> {error ? 'Coba lagi' : 'Minta evaluasi'}</button>}
        </div>
      )}
      {astra && (
        <>
          <p className="astra-total"><strong>{astra.totalScore}</strong><span>/100 skor penalaran</span></p>
          {astra.source === 'rules' && (
            <div className="ai-offline" role="note">
              <Icon name="Info" size={16} />
              <span>Analisis AI tidak tersedia; skor dihitung dari aturan permainan saja.</span>
              {canAsk && <button type="button" className="btn btn-small" onClick={onRequest}><Icon name="RotateCcw" size={14} /> Coba analisis AI lagi</button>}
            </div>
          )}
          <ul className="astra-bars">
            {BARS.map(([k, label]) => astra[k] === null || astra[k] === undefined ? null : (
              <li key={k}>
                <span>{label}</span>
                <span className="sp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={astra[k]} aria-label={label}><span style={{ width: `${astra[k]}%` }} /></span>
                <b>{astra[k]}</b>
              </li>
            ))}
          </ul>
          <p>{astra.summary}</p>
          <div className="astra-cols">
            <div><h3 className="mini-title">Kekuatan</h3><ul>{astra.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            {astra.weaknesses.length > 0 && <div><h3 className="mini-title">Perlu diperkuat</h3><ul>{astra.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
            <div><h3 className="mini-title">Saran</h3><ul>{astra.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          </div>
        </>
      )}
    </section>
  );
}
