import { isPlainObject } from './validation.js';
import { invalid } from '../errors.js';
import { GRADE_IDS, SUBJECT_IDS, DIFFICULTY_IDS, DEFAULT_LEARNER, findGrade, findSubject, findDifficulty } from '../../src/data/curriculum.js';

// Profil belajar dari klien: tidak ada -> bawaan; ada tapi tidak dikenal -> 400 (jangan menebak).
export function sanitizeLearner(raw) {
  if (raw === undefined || raw === null) return { ...DEFAULT_LEARNER };
  if (!isPlainObject(raw)) throw invalid('learner tidak valid.');
  const pick = (v, list, field, def) => {
    if (v === undefined || v === null || v === '') return def;
    if (!list.includes(v)) throw invalid(`${field} tidak valid.`, { allowed: list });
    return v;
  };
  const grade = pick(raw.grade, GRADE_IDS, 'learner.grade', DEFAULT_LEARNER.grade);
  const subject = pick(raw.subject, SUBJECT_IDS, 'learner.subject', DEFAULT_LEARNER.subject);
  const difficulty = pick(raw.difficulty, DIFFICULTY_IDS, 'learner.difficulty', DEFAULT_LEARNER.difficulty);
  if (!findSubject(subject).grades.includes(grade)) throw invalid(`${findSubject(subject).label} tidak tersedia untuk Kelas ${grade}.`);
  return { grade, subject, difficulty };
}

export const learnerLabels = (l) => ({ grade: findGrade(l.grade), subject: findSubject(l.subject), difficulty: findDifficulty(l.difficulty) });

// Blok konteks yang ditambahkan ke prompt semua identitas AI.
export function learnerContext(l) {
  const { grade, subject, difficulty } = learnerLabels(l);
  return `=== PROFIL BELAJAR SISWA (dipilih pemain) ===
Jenjang: SMA/MA ${grade.label} (Fase ${grade.fase}, Kurikulum Merdeka).
Mata pelajaran fokus: ${subject.label}${subject.group === 'lainnya' ? ' (bisa jadi mapel pilihan; tidak semua siswa mengambilnya)' : ''}.
Tingkat kesulitan: ${difficulty.label} — ${difficulty.desc}
Sesuaikan istilah, contoh, dan kedalaman dengan jenjang dan tingkat ini. Dorong berpikir kritis, bukan hafalan.
Jika kamu tidak yakin apakah suatu topik masuk capaian pembelajaran resmi ${grade.label}, katakan terus terang bahwa kamu tidak yakin; jangan mengarang aturan kurikulum resmi.`;
}
