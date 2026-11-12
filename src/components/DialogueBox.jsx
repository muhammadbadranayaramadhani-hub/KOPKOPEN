import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';

const SPEEDS = { lambat: 28, normal: 55, cepat: 120, langsung: Infinity };

function useTypewriter(text, speed, instant) {
  const [count, setCount] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const cps = instant ? Infinity : SPEEDS[speed] || SPEEDS.normal;
  useEffect(() => {
    setSkipped(false);
    if (cps === Infinity) {
      setCount(text.length);
      return undefined;
    }
    setCount(0);
    const started = performance.now();
    const id = setInterval(() => {
      const n = Math.min(text.length, Math.floor(((performance.now() - started) / 1000) * cps));
      setCount(n);
      if (n >= text.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [text, cps]);
  // "Tampilkan": status skipped menang atas hitungan ketikan, sehingga timer yang masih berjalan tidak menimpanya.
  const n = skipped ? text.length : count;
  return { shown: text.slice(0, n), done: n >= text.length, finish: () => setSkipped(true) };
}

export default function DialogueBox({
  name, text, narrator, choices, visited = [], input, defaultName = 'Penyelidik',
  speed, instant, progress, onNext, onChoose, onSubmitName,
}) {
  const { shown, done, finish } = useTypewriter(text, speed, instant);
  const [nameValue, setNameValue] = useState('');
  const boxRef = useRef(null);
  const hasChoices = !!(choices && choices.length);
  const wantsInput = input === 'name';

  // Fokus ke pilihan pertama / kolom nama saat teks selesai, supaya nyaman dipakai keyboard.
  useEffect(() => {
    if (!done) return;
    const el = boxRef.current && boxRef.current.querySelector(hasChoices ? '.choice' : wantsInput ? 'input' : '.next-btn');
    if (el && hasChoices) el.focus({ preventScroll: true });
    if (el && wantsInput) el.focus({ preventScroll: true });
  }, [done, hasChoices, wantsInput, text]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!done) finish();
        else if (!hasChoices && !wantsInput) onNext();
      }
      if (done && hasChoices && /^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (choices[i]) onChoose(i);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const advance = () => {
    if (!done) finish();
    else onNext();
  };

  return (
    <div className="dialogue" ref={boxRef}>
      {done && hasChoices && (
        <ul className="choices" aria-label="Pilih tanggapanmu">
          {choices.map((c, i) => (
            <li key={i}>
              <button type="button" className="choice" onClick={() => onChoose(i)}>
                <span className="choice-key" aria-hidden="true">{i + 1}</span>
                <span className="choice-text">{c.text}</span>
                {visited.includes(c.next) && (
                  <span className="choice-seen"><Icon name="Check" size={14} /> sudah ditanyakan</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {done && wantsInput && (
        <form
          className="name-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitName(nameValue.trim() || defaultName);
          }}
        >
          <label htmlFor="player-name">Nama penyelidik</label>
          <div className="name-row">
            <input
              id="player-name"
              type="text"
              maxLength={20}
              value={nameValue}
              placeholder={defaultName}
              autoComplete="off"
              onChange={(e) => setNameValue(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Mulai</button>
          </div>
          <button type="button" className="link-btn" onClick={() => onSubmitName(defaultName)}>
            Pakai nama bawaan: {defaultName}
          </button>
        </form>
      )}

      <div className={`dialogue-box ${narrator ? 'is-narration' : ''}`} onClick={advance}>
        {!narrator && name && <div className="nameplate">{name}</div>}
        <p className="dialogue-text" aria-live="off">
          {shown}
          <span className="sr-only">{done ? '' : text.slice(shown.length)}</span>
        </p>
        <div className="dialogue-foot">
          {progress ? (
            <div className="story-progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.current} aria-label="Kemajuan cerita">
              <span className="sp-label">{progress.label}</span>
              <span className="sp-bar"><span style={{ width: `${(progress.current / progress.total) * 100}%` }} /></span>
              <span className="sp-num">{progress.current}/{progress.total}</span>
            </div>
          ) : (
            <span />
          )}
          {!hasChoices && !wantsInput && (
            <button
              type="button"
              className="btn next-btn"
              onClick={(e) => {
                e.stopPropagation();
                advance();
              }}
              aria-label={done ? 'Lanjut ke dialog berikutnya' : 'Tampilkan seluruh teks'}
            >
              {done ? 'Lanjut' : 'Tampilkan'} <Icon name="ChevronRight" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
