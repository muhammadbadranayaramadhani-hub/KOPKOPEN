import { useState } from 'react';
import { Icon } from '../ui.jsx';
import LearnerPicker from './LearnerPicker.jsx';
import { ai, friendlyError } from '../../services/aiClient.js';
import { STATUS_LABEL } from './useAiStatus.js';
import { normalizeLearner, findSubject, findGrade, findDifficulty } from '../../data/curriculum.js';

const parseNum = (raw) => {
  const s = String(raw).trim().replace(/\s+/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
};

// NYX: latihan SMA yang dibuat AI sesuai profil belajar. Tidak mengubah bukti, cerita, atau poin kasus resmi.
// ASTRA menilai alasan siswa (opsional) setelah jawaban diperiksa.
export default function NyxPractice({ status, onRecheck, learner, onLearner }) {
  const l = normalizeLearner(learner);
  const subj = findSubject(l.subject);
  const [type, setType] = useState('auto');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null); // {correct}
  const [shownHint, setShownHint] = useState(false);
  const [seen, setSeen] = useState([]);
  const [why, setWhy] = useState('');
  const [astra, setAstra] = useState({ busy: false, error: null, data: null });
  const available = status === 'online';
  const wantType = subj.numeric && type === 'mc' ? 'mc' : subj.numeric ? 'numeric' : 'mc';

  async function generate() {
    setBusy(true); setError(null); setResult(null); setValue(''); setShownHint(false); setWhy(''); setAstra({ busy: false, error: null, data: null });
    try {
      const data = await ai.generateChallenge({ learner: l, type: wantType, avoid: seen });
      setItem(data.challenge);
      setSeen((s) => [...s, data.challenge.question].slice(-5));
    } catch (e) { setError(friendlyError(e)); setItem(null); } finally { setBusy(false); }
  }

  function check() {
    if (!item) return;
    const correct = item.type === 'mc' ? Number(value) === item.correctIndex : Math.abs(parseNum(value) - item.answer) < 1e-6;
    setResult({ correct });
  }

  async function askAstra() {
    setAstra({ busy: true, error: null, data: null });
    try {
      const data = await ai.evaluate({
        kind: 'practice', learner: l, studentAnswer: item.type === 'mc' ? Number(value) : value, studentExplanation: why.trim(),
        challenge: { type: item.type, topic: item.topic, question: item.question, options: item.options, correctIndex: item.correctIndex, answer: item.answer, expression: item.expression, unit: item.unit, explanation: item.explanation },
      });
      setAstra({ busy: false, error: null, data });
    } catch (e) { setAstra({ busy: false, error: friendlyError(e), data: null }); }
  }

  return (
    <section className="nyx paper-card" aria-labelledby="nyx-title">
      <h2 id="nyx-title" className="panel-title"><Icon name="Sparkles" size={18} /> Latihan Tambahan oleh NYX</h2>
      <p className="muted">Soal baru buatan AI untuk jenjang SMA/MA. Tidak memengaruhi bukti, cerita, atau poin kasus.</p>
      <p className={`ai-status is-${status}`} role="status">{STATUS_LABEL[status]}</p>
      {!available && status !== 'checking' && (
        <div className="ai-offline" role="note"><Icon name="WifiOff" size={16} /><span>NYX butuh AI yang terhubung.</span><button type="button" className="btn btn-small" onClick={onRecheck}><Icon name="RotateCcw" size={14} /> Cek lagi</button></div>
      )}
      <div className="nyx-form">
        <LearnerPicker learner={l} onChange={onLearner} idPrefix="nyx" compact />
        {subj.numeric && (
          <label htmlFor="nyx-type">Jenis soal
            <select id="nyx-type" value={wantType} onChange={(e) => setType(e.target.value)}>
              <option value="numeric">Isian angka</option>
              <option value="mc">Pilihan ganda</option>
            </select>
          </label>
        )}
        <button type="button" className="btn btn-primary" onClick={generate} disabled={!available || busy}>{busy ? 'Membuat soal…' : item ? 'Soal baru' : 'Buat soal'}</button>
      </div>
      {busy && <p role="status" className="muted"><span className="ai-dots" aria-hidden="true"><i /><i /><i /></span> NYX sedang menyiapkan dan memeriksa soal…</p>}
      {error && <div className="ai-error" role="alert"><Icon name="TriangleAlert" size={16} /> <span>{error.message}</span>{error.retryable && <button type="button" className="btn btn-small" onClick={generate}><Icon name="RotateCcw" size={14} /> Coba lagi</button>}</div>}
      {item && !busy && (
        <div className="nyx-item">
          <p className="ch-subject">{subj.label} · {findGrade(item.grade).label} · {findDifficulty(item.difficulty).label} · {item.topic}</p>
          <p className="question">{item.question}</p>
          {item.type === 'mc' ? (
            <fieldset className="choice-set" disabled={!!result}>
              <legend className="sr-only">Pilih satu jawaban</legend>
              {item.options.map((o, i) => (
                <label key={i} className={`radio ${String(value) === String(i) ? 'is-checked' : ''}`}>
                  <input type="radio" name="nyx" checked={String(value) === String(i)} onChange={() => setValue(String(i))} /><span>{o}</span>
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="numeric-row">
              <label htmlFor="nyx-answer" className="sr-only">Jawaban dalam angka</label>
              <input id="nyx-answer" type="text" inputMode="decimal" autoComplete="off" value={value} disabled={!!result} placeholder="Tulis angka" onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), value && !result && check())} />
              {item.unit && <span className="unit">{item.unit}</span>}
            </div>
          )}
          {shownHint && <p className="hint-list"><Icon name="Lightbulb" size={16} /> {item.hint}</p>}
          {result && (
            <div className={`feedback ${result.correct ? 'is-good' : 'is-bad'}`} role="status">
              <Icon name={result.correct ? 'CircleCheck' : 'CircleX'} size={20} />
              <div><strong>{result.correct ? 'Tepat!' : 'Belum tepat'}</strong><p>{item.explanation}</p></div>
            </div>
          )}
          <div className="btn-row">
            {!result && <button type="button" className="btn btn-primary" onClick={check} disabled={value === ''}>Periksa</button>}
            {!result && !shownHint && <button type="button" className="btn" onClick={() => setShownHint(true)}><Icon name="Lightbulb" size={18} /> Petunjuk</button>}
          </div>
          {result && (
            <div className="astra-practice">
              <label htmlFor="nyx-why">Jelaskan alasan atau langkahmu (opsional, untuk dinilai ASTRA)</label>
              <textarea id="nyx-why" rows={3} maxLength={500} value={why} disabled={astra.busy || !!astra.data} onChange={(e) => setWhy(e.target.value)} placeholder="Mis. aku memakai rumus … karena …" />
              {!astra.data && <button type="button" className="btn" onClick={askAstra} disabled={!available || astra.busy}><Icon name="Brain" size={18} /> {astra.busy ? 'ASTRA menilai…' : 'Minta ASTRA menilai penalaran'}</button>}
              {astra.error && <div className="ai-error" role="alert"><Icon name="TriangleAlert" size={16} /> <span>{astra.error.message}</span>{astra.error.retryable && <button type="button" className="btn btn-small" onClick={askAstra}><Icon name="RotateCcw" size={14} /> Coba lagi</button>}</div>}
              {astra.data && (
                <div className="astra-practice-result" role="status">
                  <p><strong>Penalaran {astra.data.reasoningScore}/100 · Konsep {astra.data.conceptScore}/100</strong>{!astra.data.hadExplanation && ' (tanpa alasan tertulis, penilaian terbatas)'}</p>
                  <p>{astra.data.whyCorrectOrNot}</p>
                  <p>{astra.data.feedback}</p>
                  {astra.data.misconceptions.length > 0 && <ul>{astra.data.misconceptions.map((m, i) => <li key={i}>{m}</li>)}</ul>}
                  <p className="muted">Saran: {astra.data.nextStep}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
