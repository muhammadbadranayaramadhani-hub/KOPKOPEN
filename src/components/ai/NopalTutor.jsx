import { useState } from 'react';
import { Icon } from '../ui.jsx';
import AiChat from './AiChat.jsx';
import { STATUS_LABEL } from './useAiStatus.js';
import { ai, buildProgress } from '../../services/aiClient.js';
import LearnerPicker from './LearnerPicker.jsx';
import { findGrade, findSubject, findDifficulty, normalizeLearner } from '../../data/curriculum.js';

// NOPAL: tutor di dalam tantangan. Penilaian benar/salah tetap dari mesin permainan; NOPAL hanya menjelaskan.
export default function NopalTutor({ cs, challenge, step, answer, hintsUsed, status, onRecheck, learner, onLearner }) {
  const [open, setOpen] = useState(false);
  const available = status === 'online';
  const hasAnswer = Array.isArray(answer) ? answer.length > 0 : answer && typeof answer === 'object' ? Object.keys(answer).length > 0 : Boolean(answer && String(answer).trim());

  const send = async (text, history, extra = {}) => {
    const data = await ai.tutor({
      challengeId: challenge.id, stepId: step.id, mode: extra.mode || 'ask', message: text,
      answer: extra.mode === 'analyze-answer' ? answer : undefined, hintsUsed, history, progress: buildProgress(cs), learner,
    });
    return { text: data.reply, meta: data.source === 'guard' ? { note: 'Jawaban disaring agar tidak membocorkan hasil akhir.' } : null };
  };

  const suggestions = [
    { label: 'Jelaskan konsepnya', text: 'Tolong jelaskan konsep untuk soal ini.', extra: { mode: 'explain' } },
    { label: 'Periksa jawabanku', text: 'Tolong periksa jawabanku.', extra: { mode: 'analyze-answer' }, disabled: !hasAnswer },
    { label: 'Beri soal latihan', text: 'Beri aku soal latihan serupa.', extra: { mode: 'practice' } },
  ];

  return (
    <div className="nopal">
      <button type="button" className="btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="nopal-panel">
        <Icon name="Bot" size={18} /> Tanya NOPAL <span className={`ai-dot is-${status}`} aria-hidden="true" />
      </button>
      {open && (
        <section id="nopal-panel" className="nopal-panel" aria-label="NOPAL, tutor belajar">
          <p className={`ai-status is-${status}`} role="status">{STATUS_LABEL[status]}</p>
          <details className="learner-details">
            <summary>Profil belajar: {findGrade(normalizeLearner(learner).grade).label} · {findSubject(normalizeLearner(learner).subject).label} · {findDifficulty(normalizeLearner(learner).difficulty).label}</summary>
            <LearnerPicker learner={learner} onChange={onLearner} idPrefix="nopal" compact />
          </details>
          {!available && status !== 'checking' ? (
            <div className="ai-offline" role="note">
              <Icon name="WifiOff" size={16} />
              <span>NOPAL butuh AI yang terhubung. Gunakan tombol Petunjuk di bawah; tantangan tetap bisa diselesaikan.</span>
              <button type="button" className="btn btn-small" onClick={onRecheck}><Icon name="RotateCcw" size={14} /> Cek lagi</button>
            </div>
          ) : (
            <AiChat idPrefix="nopal" botLabel="NOPAL" send={send} disabled={!available} suggestions={suggestions} placeholder="Tanya konsep yang belum paham…" intro="Aku NOPAL. Aku menjelaskan konsepnya dan memberi petunjuk dulu; jawaban akhirnya kamu yang temukan." />
          )}
        </section>
      )}
    </div>
  );
}
