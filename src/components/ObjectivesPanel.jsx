import { Icon } from './ui.jsx';

const STATUS = {
  done: { icon: 'CircleCheck', label: 'Selesai' },
  active: { icon: 'Circle', label: 'Tersedia' },
  locked: { icon: 'Lock', label: 'Terkunci' },
};

// Daftar tujuan penyelidikan. compact=true: hanya tujuan saat ini + ringkasan.
export default function ObjectivesPanel({ objectives, compact = false }) {
  const required = objectives.filter((o) => !o.optional);
  const doneCount = required.filter((o) => o.status === 'done').length;
  const list = compact ? objectives.filter((o) => o.current || (o.status === 'active' && !o.optional)).slice(0, 3) : objectives;
  return (
    <section className="objectives" aria-labelledby="obj-title">
      <div className="panel-head">
        <h2 id="obj-title" className="panel-title"><Icon name="Target" size={18} /> Tujuan</h2>
        <span className="mono-chip">{doneCount}/{required.length}</span>
      </div>
      <ol className="obj-list">
        {list.map((o) => {
          const s = o.current ? { icon: 'Target', label: 'Sekarang' } : STATUS[o.status];
          return (
            <li key={o.id} className={`obj obj-${o.status} ${o.current ? 'obj-current' : ''}`}>
              <Icon name={s.icon} size={18} />
              <div className="obj-body">
                <span className="obj-text">
                  {o.text}
                  {o.optional && <em className="obj-opt"> (opsional)</em>}
                </span>
                <span className="obj-meta">{s.label} · {o.where}</span>
              </div>
            </li>
          );
        })}
        {!list.length && <li className="obj obj-done"><Icon name="CircleCheck" size={18} /><div className="obj-body"><span className="obj-text">Semua tujuan terpenuhi.</span></div></li>}
      </ol>
    </section>
  );
}
