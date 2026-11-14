import { useMemo, useState } from 'react';
import { Icon } from './ui.jsx';
import { getPairTest, checkConnection, isConnectionDone, keyConnectionsDone } from '../engines/EvidenceEngine.js';

function ConnectionMap({ caseDef, cs }) {
  const ids = caseDef.evidenceOrder.filter((id) => cs.collected.includes(id));
  const R = 92;
  const C = 120;
  const pos = Object.fromEntries(ids.map((id, i) => {
    const a = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
    return [id, { x: C + R * Math.cos(a), y: C + R * Math.sin(a) }];
  }));
  const done = caseDef.connections.filter((c) => isConnectionDone(cs, c.id));
  return (
    <figure className="conn-map">
      <svg viewBox="0 0 240 240" role="img" aria-label={`Peta hubungan: ${done.length} hubungan terbukti`}>
        <circle cx={C} cy={C} r={R + 18} fill="none" stroke="#A9B8DF" strokeOpacity=".15" />
        {done.map((c) => (
          <line key={c.id} x1={pos[c.pair[0]].x} y1={pos[c.pair[0]].y} x2={pos[c.pair[1]].x} y2={pos[c.pair[1]].y}
            stroke="#D9AD75" strokeWidth={c.key ? 3 : 1.8} strokeDasharray={c.key ? '' : '5 4'} />
        ))}
        {ids.map((id) => (
          <g key={id}>
            <circle cx={pos[id].x} cy={pos[id].y} r="17" fill="#2d3052" stroke="#D9AD75" strokeWidth="2" />
            <text x={pos[id].x} y={pos[id].y + 4} textAnchor="middle" fontSize="11" fill="#F4EEDC" fontFamily="DM Mono, monospace">
              {caseDef.evidence[id].code.replace('BKT-', '')}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>Garis emas = hubungan terbukti (putus-putus = tambahan)</figcaption>
    </figure>
  );
}

export default function EvidenceBoard({ caseDef, cs, actions }) {
  const [sel, setSel] = useState([]);
  const [st, setSt] = useState('');
  const [re, setRe] = useState('');
  const [result, setResult] = useState(null);

  const ids = caseDef.evidenceOrder.filter((id) => cs.collected.includes(id));
  const test = useMemo(() => (sel.length === 2 ? getPairTest(caseDef, sel[0], sel[1]) : null), [caseDef, sel]);
  const alreadyDone = test && !test.generic && isConnectionDone(cs, test.id);
  const keyDone = keyConnectionsDone(caseDef, cs);

  const reset = () => { setSt(''); setRe(''); setResult(null); };
  const toggle = (id) => {
    reset();
    setSel((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 2 ? [cur[1], id] : [...cur, id]));
  };

  const submit = (e) => {
    e.preventDefault();
    const r = checkConnection(test, st, re);
    setResult(r);
    if (!r.incomplete) actions.recordConnection(test, r.success);
  };

  const connectedWith = (id) => caseDef.connections.filter((c) => isConnectionDone(cs, c.id) && c.pair.includes(id)).length;

  return (
    <div className="board">
      <section className="board-cards" aria-labelledby="board-title">
        <div className="panel-head">
          <h2 id="board-title" className="panel-title"><Icon name="Network" size={18} /> Papan Bukti</h2>
          <span className="mono-chip" title="Hubungan inti yang sudah terbukti">{keyDone}/{caseDef.keyConnectionsNeeded} inti</span>
        </div>
        <p className="muted">Pilih dua kartu bukti, lalu jelaskan bagaimana keduanya berhubungan dan mengapa kamu yakin.</p>
        {ids.length < 2 ? (
          <div className="empty-state"><Icon name="Pin" size={36} /><p>Kumpulkan setidaknya dua bukti untuk mulai menghubungkan.</p></div>
        ) : (
          <ul className="card-grid">
            {ids.map((id) => {
              const ev = caseDef.evidence[id];
              const idx = sel.indexOf(id);
              const n = connectedWith(id);
              return (
                <li key={id}>
                  <button type="button" className={`pin-card ${idx >= 0 ? 'is-selected' : ''}`} aria-pressed={idx >= 0} onClick={() => toggle(id)}>
                    <span className="pin" aria-hidden="true" />
                    {idx >= 0 && <span className="sel-num" aria-label={`dipilih sebagai kartu ${idx + 1}`}>{idx + 1}</span>}
                    <span className="pin-code">{ev.code}</span>
                    <Icon name={ev.icon} size={22} />
                    <span className="pin-title">{ev.title}</span>
                    <span className="pin-sum">{ev.summary}</span>
                    {n > 0 && <span className="pin-links"><Icon name="Link2" size={13} /> {n} hubungan terbukti</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside className="board-side">
        <ConnectionMap caseDef={caseDef} cs={cs} />

        {sel.length === 2 && test && (
          <section className="paper-card test-card" aria-labelledby="test-title">
            <h3 id="test-title" className="ev-title">
              {caseDef.evidence[sel[0]].code} <Icon name="Link2" size={18} /> {caseDef.evidence[sel[1]].code}
            </h3>
            {alreadyDone ? (
              <>
                <div className="feedback is-ok" role="status">
                  <Icon name="CircleCheck" size={20} />
                  <div>
                    <strong>Hubungan terbukti!</strong>
                    <p>{test.insight}</p>
                  </div>
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-primary" onClick={() => { setSel([]); reset(); }} data-autofocus>
                    Pilih pasangan lain
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={submit}>
                <fieldset>
                  <legend>Bagaimana hubungan kedua bukti ini?</legend>
                  {test.statements.map((s) => (
                    <label key={s.id} className={`radio ${st === s.id ? 'is-checked' : ''}`}>
                      <input type="radio" name="statement" value={s.id} checked={st === s.id} onChange={() => { setSt(s.id); setResult(null); }} />
                      <span>{s.text}</span>
                    </label>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>Mengapa kamu yakin?</legend>
                  {test.reasons.map((r) => (
                    <label key={r.id} className={`radio ${re === r.id ? 'is-checked' : ''}`}>
                      <input type="radio" name="reason" value={r.id} checked={re === r.id} onChange={() => { setRe(r.id); setResult(null); }} />
                      <span>{r.text}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="btn-row">
                  <button type="submit" className="btn btn-primary" disabled={!st || !re}>Uji Hubungan</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setSel([]); reset(); }}>Pilih ulang</button>
                </div>
                {result && (
                  <div className={`feedback ${result.success ? 'is-ok' : 'is-bad'}`} role="status">
                    <Icon name={result.success ? 'CircleCheck' : 'CircleX'} size={20} />
                    <div>
                      <strong>{result.success ? (test.generic ? 'Tepat: memang tidak berhubungan langsung.' : 'Hubungan terbukti!') : 'Belum didukung bukti.'}</strong>
                      <p>{result.message}</p>
                    </div>
                  </div>
                )}
              </form>
            )}
          </section>
        )}
        {sel.length < 2 && ids.length >= 2 && (
          <p className="muted board-hint"><Icon name="Info" size={16} /> Dipilih {sel.length}/2 kartu.</p>
        )}
      </aside>
    </div>
  );
}
