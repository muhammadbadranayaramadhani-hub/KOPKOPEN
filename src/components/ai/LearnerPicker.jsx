import { GRADES, DIFFICULTIES, SUBJECTS, subjectsFor, normalizeLearner, findDifficulty } from '../../data/curriculum.js';

// Pemilih profil belajar: Kelas X–XII, mata pelajaran, tingkat kesulitan. Dipakai di Pengaturan, NOPAL, dan NYX.
export default function LearnerPicker({ learner, onChange, idPrefix = 'lp', compact = false }) {
  const l = normalizeLearner(learner);
  const set = (patch) => onChange(normalizeLearner({ ...l, ...patch }));
  const available = subjectsFor(l.grade);
  const group = (g) => available.filter((s) => s.group === g);
  return (
    <div className={`learner-picker ${compact ? 'is-compact' : ''}`}>
      <label htmlFor={`${idPrefix}-grade`}>Kelas
        <select id={`${idPrefix}-grade`} value={l.grade} onChange={(e) => set({ grade: e.target.value })}>
          {GRADES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
      </label>
      <label htmlFor={`${idPrefix}-subject`}>Mata pelajaran
        <select id={`${idPrefix}-subject`} value={l.subject} onChange={(e) => set({ subject: e.target.value })}>
          <optgroup label="Kelompok umum">{group('umum').map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>
          <optgroup label="Mata pelajaran lainnya">{group('lainnya').map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>
        </select>
      </label>
      <label htmlFor={`${idPrefix}-diff`}>Tingkat
        <select id={`${idPrefix}-diff`} value={l.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
          {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
      </label>
      {!compact && (
        <p className="learner-help muted">
          {findDifficulty(l.difficulty).desc} Ketersediaan mata pelajaran berbeda di tiap sekolah; pilih yang kamu pelajari ({SUBJECTS.length} pilihan, beberapa khusus Kelas XI–XII).
        </p>
      )}
    </div>
  );
}
