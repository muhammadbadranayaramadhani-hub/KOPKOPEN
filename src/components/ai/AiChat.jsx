import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui.jsx';
import MathText from '../MathText.jsx';
import { friendlyError } from '../../services/aiClient.js';
import { loadChat, saveChat } from '../../services/chatStore.js';

// Percakapan generik yang dipakai RENNTZY dan REI: daftar pesan, kotak input, status memuat, galat + coba lagi.
// `send(text, history)` harus mengembalikan Promise<string>.
export default function AiChat({ send, placeholder, intro, disabled, suggestions = [], idPrefix, maxLength = 400, onReply, userLabel = 'Kamu', botLabel, storageKey }) {
  // Bila storageKey diberikan, riwayat disimpan di luar komponen sehingga tetap ada setelah panel ditutup lalu dibuka lagi.
  const [messages, setMessages] = useState(() => loadChat(storageKey));
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const lastRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { if (storageKey) saveChat(storageKey, messages); }, [storageKey, messages]);

  useEffect(() => { if (endRef.current && endRef.current.scrollIntoView) endRef.current.scrollIntoView({ block: 'nearest' }); }, [messages, busy, error]);

  async function run(q, base, extra) {
    setBusy(true);
    setError(null);
    lastRef.current = { q, base, extra };
    const history = base.map((m) => ({ role: m.role, text: m.text }));
    try {
      const reply = await send(q, history, extra);
      const next = [...base, { role: 'user', text: q }, { role: 'model', text: reply.text, meta: reply.meta }];
      setMessages(next);
      if (onReply) onReply(reply);
    } catch (e) {
      setMessages([...base, { role: 'user', text: q }]);
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    const q = text.trim();
    if (!q || busy || disabled) return;
    setText('');
    run(q, messages);
  };

  const retry = () => {
    const l = lastRef.current;
    if (!l) return;
    run(l.q, l.base, l.extra);
  };

  return (
    <div className="ai-chat">
      <div className="ai-log" role="log" aria-live="polite" aria-label="Percakapan">
        {!messages.length && intro && <p className="ai-intro">{intro}</p>}
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role === 'user' ? 'is-user' : 'is-bot'}`}>
            <span className="ai-who">{m.role === 'user' ? userLabel : botLabel}</span>
            <p><MathText>{m.text}</MathText></p>
            {m.meta && m.meta.note && <span className="ai-note">{m.meta.note}</span>}
          </div>
        ))}
        {busy && (
          <div className="ai-msg is-bot is-loading" role="status">
            <span className="ai-who">{botLabel}</span>
            <p><span className="ai-dots" aria-hidden="true"><i /><i /><i /></span> <span className="sr-only">Sedang berpikir</span><span aria-hidden="true">sedang berpikir…</span></p>
          </div>
        )}
        {error && (
          <div className="ai-error" role="alert">
            <Icon name="TriangleAlert" size={16} /> <span>{error.message}</span>
            {error.retryable && <button type="button" className="btn btn-small" onClick={retry}><Icon name="RotateCcw" size={14} /> Coba lagi</button>}
          </div>
        )}
        <div ref={endRef} />
      </div>
      {suggestions.length > 0 && !busy && (
        <div className="ai-suggest">
          {suggestions.map((s) => (
            <button key={s.label} type="button" className="chip-btn" disabled={disabled || s.disabled} onClick={() => run(s.text, messages, s.extra)}>{s.label}</button>
          ))}
        </div>
      )}
      <form className="ai-form" onSubmit={submit}>
        <label className="sr-only" htmlFor={`${idPrefix}-input`}>Pesan</label>
        <input id={`${idPrefix}-input`} type="text" value={text} maxLength={maxLength} disabled={disabled || busy} placeholder={placeholder} autoComplete="off" onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={disabled || busy || !text.trim()} aria-label="Kirim pesan"><Icon name="Send" size={16} /></button>
      </form>
    </div>
  );
}
