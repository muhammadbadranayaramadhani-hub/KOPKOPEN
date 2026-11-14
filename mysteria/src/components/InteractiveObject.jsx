import { Icon } from './ui.jsx';

// Hotspot titik-dan-klik di atas panggung. Status ditandai ikon + teks tersembunyi (bukan hanya warna).
export default function InteractiveObject({ obj, state, onOpen }) {
  const status = state.locked ? 'terkunci' : state.collected ? 'bukti terkumpul' : state.inspected ? 'sudah diperiksa' : 'belum diperiksa';
  const cls = ['hotspot', state.locked && 'is-locked', state.inspected && 'is-inspected', state.collected && 'is-collected', !state.inspected && !state.locked && 'is-new']
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={cls}
      style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
      onClick={() => onOpen(obj.id)}
      aria-label={`${obj.name}, ${status}`}
    >
      <span className="hs-ring" aria-hidden="true" />
      <span className="hs-core" aria-hidden="true">
        <Icon name={state.locked ? 'Lock' : obj.icon} size={20} />
      </span>
      {(state.inspected || state.locked) && (
        <span className="hs-badge" aria-hidden="true">
          <Icon name={state.locked ? 'Lock' : 'Check'} size={11} />
        </span>
      )}
      <span className="hs-label" aria-hidden="true">{obj.name}</span>
    </button>
  );
}
