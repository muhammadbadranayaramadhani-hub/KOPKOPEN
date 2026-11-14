import { useEffect, useRef } from 'react';
import { getIcon } from './icons.js';

export function Icon({ name, size = 20, className = '', ...rest }) {
  const C = getIcon(name);
  return <C size={size} className={className} aria-hidden="true" focusable="false" {...rest} />;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

// Dialog modal: Esc menutup, fokus terkunci di dalam, fokus kembali ke pemicu.
export function Modal({ title, onClose, children, wide = false, tone = 'paper', labelId = 'modal-title', closeLabel = 'Tutup' }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const node = ref.current;
    const first = node && node.querySelector('[data-autofocus]');
    (first || (node && node.querySelector(FOCUSABLE)))?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose && onClose();
      }
      if (e.key === 'Tab' && node) {
        const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (!items.length) return;
        const a = items[0];
        const z = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (prev && prev.focus) prev.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div ref={ref} className={`modal modal-${tone} ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelId}>
        <div className="modal-head">
          <h2 id={labelId} className="modal-title">{title}</h2>
          {onClose && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label={closeLabel}>
              <Icon name="X" />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Lanjutkan', cancelLabel = 'Batal', danger = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} tone="dark" labelId="confirm-title">
      <p className="confirm-text">{message}</p>
      <div className="btn-row">
        <button type="button" className="btn" onClick={onCancel} data-autofocus>{cancelLabel}</button>
        <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Toasts({ items, onDismiss }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone || 'info'}`}>
          <Icon name={t.icon || 'Sparkles'} size={18} />
          <div className="toast-text">
            <strong>{t.title}</strong>
            {t.text && <span>{t.text}</span>}
          </div>
          {t.action && (
            <button type="button" className="btn btn-small" onClick={() => { t.action.run(); onDismiss(t.id); }}>
              {t.action.label}
            </button>
          )}
          <button type="button" className="icon-btn icon-btn-small" onClick={() => onDismiss(t.id)} aria-label="Tutup pemberitahuan">
            <Icon name="X" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Ornament({ children }) {
  return (
    <div className="ornament" aria-hidden={children ? undefined : 'true'}>
      <span className="orn-line" />
      <span className="orn-gem">{children || '◆'}</span>
      <span className="orn-line" />
    </div>
  );
}

export function Stars({ value, max = 3 }) {
  return (
    <span className="stars" role="img" aria-label={`${value} dari ${max} bintang`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name="Star" size={18} className={i < value ? 'star on' : 'star'} />
      ))}
    </span>
  );
}

export function DataTable({ table }) {
  if (!table) return null;
  return (
    <div className="table-wrap">
      <table className="doc-table">
        <thead>
          <tr>{table.headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const SUBJECT_LABEL = { matematika: 'Matematika', ipa: 'IPA', bahasa: 'Bahasa Indonesia', ips: 'IPS' };
