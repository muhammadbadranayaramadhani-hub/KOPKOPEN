import { useState } from 'react';
import { Icon, DataTable, SUBJECT_LABEL } from './ui.jsx';
import { evaluateStep, revealAnswerText } from '../engines/PuzzleEngine.js';
import { challengeStatus } from '../engines/InvestigationEngine.js';
import NopalTutor from './ai/NopalTutor.jsx';
import NyxPractice from './ai/NyxPractice.jsx';

export function ChallengeList({ caseDef, cs, onOpen, aiStatus, learner, onLearner }) {
  return (
    <section className="challenge-list" aria-labelledby="chl-title">
      <div className="panel-head">
        <h2 id="chl-title" className="panel-title"><Icon name="Brain" size={18} /> Tantangan Pengetahuan</h2>
      </div>
      <p className="muted">Tantangan muncul dari bukti yang kamu temukan. Jawabannya membantu memecahkan kasus.</p>
      <ul className="ch-cards">
        {caseDef.challenges.map((ch) => {
          const status = challengeStatus(ch, caseDef, cs);
          const pts = (cs.challenges[ch.id]?.steps || []).reduce((n, s) => n + (s.points || 0), 0);
          return (
            <li key={ch.id}>
              <button type="button" className={`ch-card is-${status}`} disabled={status === 'locked'} onClick={() => onOpen(ch.id)}>
                <span className="ch-icon"><Icon name={status === 'locked' ? 'Lock' : ch.icon} size={22} /></span>
                <span className="ch-body">
                  <span className="ch-subject">{SUBJECT_LABEL[ch.subject]}</span>
                  <span className="ch-title">{ch.title}</span>
                  <span className="ch-desc">{status === 'locked' ? ch.lockText : ch.scenario}</span>
                </span>
                <span className={`status-chip ${status === 'done' ? 'ok' : ''}`}>
                  {status === 'done' ? <><Icon name="CircleCheck" size={14} /> Selesai +{pts}</> : status === 'locked' ? 'Terkunci' : 'Tersedia'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {aiStatus && <NyxPractice status={aiStatus.status} onRecheck={aiStatus.recheck} learner={learner} onLearner={onLearner} />}
    </section>
  );
}

function AnswerInput({ step, value, onChange, onSubmit, wrongIds }) {
  switch (step.type) {
    case 'numeric':
      return (
        <div className="numeric-row">
          <label htmlFor="num-answer" className="sr-only">Jawaban dalam angka</label>
          <input
            id="num-answer"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value || ''}
            placeholder="Tulis angka"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onSubmit())}
          />
          {step.unit && <span className="unit">{step.unit}</span>}
        </div>
      );
    case 'mc':
      return (
        <fieldset className="choice-set">
          <legend className="sr-only">Pilih satu jawaban</legend>
          {step.options.map((o) => (
            <label key={o.id} className={`radio ${value === o.id ? 'is-checked' : ''}`}>
              <input type="radio" name="mc" value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      );
    case 'multi': {
      const cur = value || [];
      const toggle = (id) => onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
      return (
        <fieldset className="choice-set">
          <legend className="sr-only">Pilih semua jawaban yang benar</legend>
          {step.options.map((o) => (
            <label key={o.id} className={`radio check ${cur.includes(o.id) ? 'is-checked' : ''}`}>
              <input type="checkbox" checked={cur.includes(o.id)} onChange={() => toggle(o.id)} />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      );
    }
    case 'classify': {
      const map = value || {};
      return (
        <ol className="classify">
          {step.items.map((it, i) => (
            <li key={it.id} className={wrongIds && wrongIds.includes(it.id) ? 'is-wrong' : ''}>
              <p className="classify-text">
                <span className="classify-num">{i + 1}</span> {it.text}
                {wrongIds && wrongIds.includes(it.id) && <span className="wrong-flag"><Icon name="CircleX" size={14} /> perlu dicek ulang</span>}
              </p>
              <fieldset className="classify-opts">
                <legend className="sr-only">Kategori untuk pernyataan {i + 1}</legend>
                {step.categories.map((c) => (
                  <label key={c.id} className={`radio chip ${map[it.id] === c.id ? 'is-checked' : ''}`}>
                    <input type="radio" name={`cl-${it.id}`} checked={map[it.id] === c.id} onChange={() => onChange({ ...map, [it.id]: c.id })} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </fieldset>
            </li>
          ))}
        </ol>
      );
    }
    default:
      return null;
  }
}

export default function KnowledgeChallenge({ caseDef, cs, challenge, actions, onBack, aiStatus, learner, onLearner }) {
  const state = cs.challenges[challenge.id];
  const [justSolved, setJustSolved] = useState(null); // { idx }
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [revealText, setRevealText] = useState('');

  const idx = justSolved ? justSolved.idx : state ? state.step : 0;
  const step = challenge.steps[idx];
  const stepState = state ? state.steps[idx] : { wrong: 0, hints: 0, solved: false };
  const ev = challenge.evidenceRef ? caseDef.evidence[challenge.evidenceRef] : null;

  // Tantangan yang sudah selesai dibuka kembali: tampilkan ringkasan.
  if (state && state.done && !justSolved) {
    return (
      <section className="challenge paper-card" aria-labelledby="chal-title">
        <p className="ch-subject">{SUBJECT_LABEL[challenge.subject]}</p>
        <h2 id="chal-title" className="ev-title"><Icon name="CircleCheck" size={22} /> {challenge.title} — selesai</h2>
        {challenge.steps.map((s) => (
          <div key={s.id} className="explain-block">
            <p className="explain-q">{s.prompt}</p>
            <p><strong>Konsep:</strong> {s.explain}</p>
            <p><strong>Kaitan dengan kasus:</strong> {s.link}</p>
          </div>
        ))}
        <button type="button" className="btn btn-primary" onClick={onBack}>Kembali ke penyelidikan</button>
      </section>
    );
  }

  const submit = () => {
    const res = evaluateStep(step, answer);
    if (res.correct) {
      actions.recordResult(challenge.id, idx, { correct: true });
      setJustSolved({ idx });
      setFeedback(null);
    } else {
      if (res.message && /^(Tulis|Pilih|Kelompokkan)/.test(res.message)) {
        setFeedback({ ...res, soft: true });
      } else {
        actions.recordResult(challenge.id, idx, { correct: false });
        setFeedback(res);
      }
    }
  };

  const reveal = () => {
    setRevealText(revealAnswerText(step));
    actions.recordResult(challenge.id, idx, { correct: true, revealed: true });
    setJustSolved({ idx });
    setFeedback(null);
  };

  const next = () => {
    const wasLast = state && state.done;
    setJustSolved(null);
    setAnswer(null);
    setFeedback(null);
    setRevealText('');
    if (wasLast) onBack();
  };

  const hintsShown = stepState.hints;
  const allHints = hintsShown >= step.hints.length;

  if (justSolved) {
    const s = state.steps[idx];
    const isLast = state.done;
    return (
      <section className="challenge paper-card" aria-labelledby="chal-title">
        <p className="ch-subject">{SUBJECT_LABEL[challenge.subject]} · {challenge.title}</p>
        <h2 id="chal-title" className="ev-title">
          <Icon name="CircleCheck" size={22} /> {s.revealed ? 'Jawaban diperlihatkan' : 'Tepat!'}
        </h2>
        {s.revealed && <p className="reveal-text">{revealText}</p>}
        <div className="explain-block">
          <h3 className="mini-title">Konsep di balik jawabannya</h3>
          <p>{step.explain}</p>
        </div>
        <div className="explain-block link-block">
          <h3 className="mini-title">Kaitannya dengan kasus</h3>
          <p>{step.link}</p>
          {isLast && challenge.unlocksText && <p className="discovery"><Icon name="Sparkles" size={16} /> {challenge.unlocksText}</p>}
        </div>
        <p className="points-note"><Icon name="Star" size={16} /> +{s.points} poin pengetahuan</p>
        <button type="button" className="btn btn-primary" onClick={next} data-autofocus>
          {isLast ? 'Selesai, kembali ke penyelidikan' : 'Lanjut ke pertanyaan berikutnya'} <Icon name="ChevronRight" size={18} />
        </button>
      </section>
    );
  }

  return (
    <section className="challenge paper-card" aria-labelledby="chal-title">
      <button type="button" className="btn btn-ghost back-btn dark-ink" onClick={onBack}>
        <Icon name="ChevronLeft" size={18} /> Kembali
      </button>
      <p className="ch-subject">{SUBJECT_LABEL[challenge.subject]} · Langkah {idx + 1}/{challenge.steps.length}</p>
      <h2 id="chal-title" className="ev-title"><Icon name={challenge.icon} size={22} /> {challenge.title}</h2>
      <p className="scenario">{challenge.scenario}</p>

      {step.quote && <blockquote className="doc-quote">“{step.quote}”</blockquote>}
      {step.table && (
        <>
          <p className="mini-title">{ev ? `${ev.code} — ${ev.title}` : 'Data'}</p>
          <DataTable table={step.table} />
        </>
      )}

      <p className="question">{step.prompt}</p>
      <AnswerInput step={step} value={answer} onChange={(v) => { setAnswer(v); setFeedback(null); }} onSubmit={submit} wrongIds={feedback && feedback.wrongIds} />

      {feedback && (
        <div className={`feedback ${feedback.soft ? 'is-note' : 'is-bad'}`} role="status">
          <Icon name={feedback.soft ? 'Info' : 'CircleX'} size={20} />
          <div>
            <strong>{feedback.soft ? 'Satu langkah lagi' : 'Belum tepat'}</strong>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {hintsShown > 0 && (
        <ol className="hint-list" aria-label="Petunjuk">
          {step.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i}><Icon name="Lightbulb" size={16} /> <span><strong>Petunjuk {i + 1}:</strong> {h}</span></li>
          ))}
        </ol>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={submit}>Periksa Jawaban</button>
        <button type="button" className="btn" onClick={() => actions.hint(challenge.id, idx)} disabled={allHints}>
          <Icon name="Lightbulb" size={18} /> Petunjuk ({hintsShown}/{step.hints.length})
        </button>
        {allHints && stepState.wrong > 0 && (
          <button type="button" className="btn btn-ghost" onClick={reveal}>Perlihatkan jawaban</button>
        )}
      </div>

      {aiStatus && (
        <NopalTutor cs={cs} challenge={challenge} step={step} answer={answer} hintsUsed={hintsShown} status={aiStatus.status} onRecheck={aiStatus.recheck} learner={learner} onLearner={onLearner} />
      )}
    </section>
  );
}
