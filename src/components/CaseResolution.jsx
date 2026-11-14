import { useState } from 'react';
import { Icon } from './ui.jsx';
import { EvidenceDetail } from './EvidenceInventory.jsx';

const STEPS = ['Tinjau bukti', 'Pilih penjelasan', 'Dukung dengan bukti', 'Jelaskan alasanmu'];
const STAGE_STEP = { cause: 1, evidence: 2, numbers: 2, reasoning: 3 };

export default function CaseResolution({ caseDef, cs, actions }) {
  const r = caseDef.resolution;
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState({ optionId: '', evidence: [], increase: '', sessions: '', perSession: '', reasoning: '' });
  const [feedback, setFeedback] = useState(null);
  const collected = caseDef.evidenceOrder.filter((id) => cs.collected.includes(id));
  const set = (patch) => { setAnswer((a) => ({ ...a, ...patch })); setFeedback(null); };
  const toggleEv = (id) => set({ evidence: answer.evidence.includes(id) ? answer.evidence.filter((x) => x !== id) : [...answer.evidence, id] });

  const canNext = (step === 1 && !!answer.optionId) || step === 0 || (step === 2 && answer.evidence.length > 0);

  const submit = () => {
    const res = actions.submitConclusion(answer);
    if (!res.ok) {
      setFeedback(res);
      setStep(STAGE_STEP[res.stage] ?? step);
    }
  };

  const checks = r.reasoningChecks.map((c) => ({ ...c, hit: c.pattern.test(answer.reasoning) }));

  return (
    <div className="resolution">
      <header className="res-head">
        <p className="eyebrow">Kasus {caseDef.id}</p>
        <h2 className="res-title">Ungkap Kebenaran</h2>
        <ol className="stepper" aria-label="Langkah kesimpulan">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
              <span className="step-num">{i < step ? <Icon name="Check" size={14} /> : i + 1}</span>
              <span className="step-name">{s}</span>
            </li>
          ))}
        </ol>
      </header>

      <section className="paper-card res-card">
        {step === 0 && (
          <>
            <h3 className="ev-title">Tinjau semua buktimu</h3>
            <p className="muted">Baca kembali bukti yang kamu kumpulkan. Ketuk judul untuk membuka.</p>
            <div className="accordion">
              {collected.map((id) => (
                <details key={id}>
                  <summary><Icon name={caseDef.evidence[id].icon} size={18} /> {caseDef.evidence[id].code} — {caseDef.evidence[id].title}</summary>
                  <EvidenceDetail ev={caseDef.evidence[id]} />
                </details>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <fieldset className="choice-set">
            <legend className="ev-title">{r.question}</legend>
            <p className="muted">Pilih penjelasan yang paling didukung bukti, bukan yang paling kamu duga di awal.</p>
            {r.options.map((o) => (
              <label key={o.id} className={`radio ${answer.optionId === o.id ? 'is-checked' : ''}`}>
                <input type="radio" name="cause" value={o.id} checked={answer.optionId === o.id} onChange={() => set({ optionId: o.id })} />
                <span>{o.text}</span>
              </label>
            ))}
          </fieldset>
        )}

        {step === 2 && (
          <>
            <fieldset className="choice-set">
              <legend className="ev-title">Bukti mana yang mendukung kesimpulanmu?</legend>
              <p className="muted">Pilih bukti yang menghubungkan kenaikan air dengan penyebabnya, dan yang menyingkirkan dugaan lain.</p>
              {collected.map((id) => (
                <label key={id} className={`radio check ${answer.evidence.includes(id) ? 'is-checked' : ''}`}>
                  <input type="checkbox" checked={answer.evidence.includes(id)} onChange={() => toggleEv(id)} />
                  <span><strong>{caseDef.evidence[id].code}</strong> {caseDef.evidence[id].title}<br /><span className="muted">{caseDef.evidence[id].summary}</span></span>
                </label>
              ))}
            </fieldset>
            <div className="fill-box">
              <h4 className="mini-title">Lengkapi hubungan angkanya</h4>
              <p className="fill-line">
                <label htmlFor="f-inc" className="sr-only">Kenaikan pemakaian air</label>
                Kenaikan pemakaian = <input id="f-inc" inputMode="numeric" value={answer.increase} onChange={(e) => set({ increase: e.target.value })} aria-label="Kenaikan pemakaian dalam liter" /> liter
              </p>
              <p className="fill-line">
                Air sesi tambahan = <input inputMode="numeric" value={answer.sessions} onChange={(e) => set({ sessions: e.target.value })} aria-label="Jumlah sesi tambahan" /> sesi ×{' '}
                <input inputMode="numeric" value={answer.perSession} onChange={(e) => set({ perSession: e.target.value })} aria-label="Liter per sesi" /> liter
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label htmlFor="reasoning" className="ev-title">Jelaskan alasanmu</label>
            <p className="muted">Tuliskan dengan kalimatmu sendiri mengapa bukti mendukung kesimpulanmu dan mengapa dugaan lain tidak.</p>
            <textarea
              id="reasoning"
              rows={5}
              maxLength={500}
              value={answer.reasoning}
              placeholder="Contoh: Kenaikan pemakaian sebesar ... sama dengan ..."
              onChange={(e) => set({ reasoning: e.target.value })}
            />
            <ul className="check-list" aria-label="Penjelasanmu sudah menyebut">
              {checks.map((c) => (
                <li key={c.id} className={c.hit ? 'is-hit' : ''}><Icon name={c.hit ? 'CircleCheck' : 'Circle'} size={16} /> {c.label}</li>
              ))}
            </ul>
          </>
        )}

        {feedback && (
          <div className="feedback is-bad" role="alert">
            <Icon name="CircleX" size={20} />
            <div><strong>Kesimpulan belum diterima</strong><p>{feedback.message}</p></div>
          </div>
        )}

        <div className="btn-row">
          {step > 0 && <button type="button" className="btn" onClick={() => setStep(step - 1)}><Icon name="ChevronLeft" size={18} /> Sebelumnya</button>}
          {step < 3 && <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext}>Lanjut <Icon name="ChevronRight" size={18} /></button>}
          {step === 3 && <button type="button" className="btn btn-primary" onClick={submit}><Icon name="Scale" size={18} /> Kirim Kesimpulan</button>}
        </div>
      </section>
    </div>
  );
}
