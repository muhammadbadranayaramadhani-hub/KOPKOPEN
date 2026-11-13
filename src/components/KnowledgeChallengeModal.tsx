import React, { useState } from 'react';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { KnowledgeChallenge } from '../types/game';
import { sound } from '../utils/audio';
import {
  HelpCircle,
  X,
  CheckCircle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Send,
  Calculator,
  ChevronRight,
} from 'lucide-react';

interface KnowledgeChallengeModalProps {
  challengeId: string;
  onClose: () => void;
  onSolveChallenge: (challengeId: string) => void;
  isAlreadySolved: boolean;
}

export const KnowledgeChallengeModal: React.FC<KnowledgeChallengeModalProps> = ({
  challengeId,
  onClose,
  onSolveChallenge,
  isAlreadySolved,
}) => {
  const challenge: KnowledgeChallenge | undefined = theLastDropCase.challenges.find(
    (c) => c.id === challengeId
  );

  const [numericAnswer, setNumericAnswer] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeHintIndex, setActiveHintIndex] = useState<number>(-1);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect' | null;
    message: string;
    explanation?: string;
  }>({ status: isAlreadySolved ? 'correct' : null, message: '' });

  if (!challenge) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (challenge.type === 'calculation') {
      const parsed = parseFloat(numericAnswer.trim());
      if (isNaN(parsed)) {
        setFeedback({
          status: 'incorrect',
          message: 'Silakan masukkan angka jawabanmu terlebih dahulu.',
        });
        sound.playFailure();
        return;
      }

      if (parsed === challenge.expectedNumber) {
        sound.playSuccess();
        setFeedback({
          status: 'correct',
          message: `Jawaban Tepat! ${challenge.expectedNumber} ${challenge.unit || ''}.`,
          explanation: challenge.storyImpact,
        });
        onSolveChallenge(challenge.id);
      } else {
        sound.playFailure();
        setFeedback({
          status: 'incorrect',
          message: `Kalkulasi belum tepat. Periksa kembali angka pada berkas kasus atau gunakan Petunjuk Penyelidik di bawah.`,
        });
      }
    } else if (challenge.type === 'multiple_choice') {
      if (!selectedOptionId) {
        setFeedback({
          status: 'incorrect',
          message: 'Silakan pilih salah satu opsi jawaban.',
        });
        sound.playFailure();
        return;
      }

      const chosenOption = challenge.options?.find((opt) => opt.id === selectedOptionId);
      if (chosenOption?.isCorrect) {
        sound.playSuccess();
        setFeedback({
          status: 'correct',
          message: 'Analisis Sangat Tepat!',
          explanation: `${chosenOption.explanation} ${challenge.storyImpact}`,
        });
        onSolveChallenge(challenge.id);
      } else {
        sound.playFailure();
        setFeedback({
          status: 'incorrect',
          message: chosenOption?.explanation || 'Pilihan kurang tepat. Coba pertimbangkan kembali!',
        });
      }
    }
  };

  const revealNextHint = () => {
    sound.playClick();
    if (activeHintIndex < challenge.hints.length - 1) {
      setActiveHintIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22243D]/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#22243D] border border-[#7776A8] rounded-lg shadow-2xl p-6 sm:p-8 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#7776A8]/30 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-1">
              <span>{challenge.subject}</span>
              <span className="text-[#7776A8]">·</span>
              <span>{challenge.grade}</span>
            </div>
            <h2 id="challenge-modal-title" className="font-serif-title font-bold text-lg sm:text-xl text-[#F4EEDC]">
              {challenge.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A9B8DF] hover:text-[#F4EEDC] rounded hover:bg-[#7776A8]/20 cursor-pointer"
            aria-label="Tutup Tantangan Pengetahuan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Context Callout */}
        <div className="mb-4 p-3.5 rounded bg-[#7776A8]/15 border border-[#7776A8]/30 text-xs text-[#E7DDF5] leading-relaxed">
          <p className="font-semibold text-[#D9AD75] mb-1">Konteks Investigasi:</p>
          <p>{challenge.context}</p>
        </div>

        {/* Question Prompt */}
        <div className="mb-6">
          <p className="text-sm sm:text-base font-semibold text-[#F4EEDC] leading-relaxed">
            {challenge.question}
          </p>
        </div>

        {/* Interactive Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {challenge.type === 'calculation' ? (
            <div className="space-y-2">
              <label htmlFor="challenge-num-input" className="block text-xs font-data text-[#D9AD75] uppercase tracking-wider">
                Hasil Perhitungan ({challenge.unit || 'Angka'}):
              </label>
              <div className="relative flex items-center">
                <input
                  id="challenge-num-input"
                  type="number"
                  step="any"
                  value={numericAnswer}
                  onChange={(e) => {
                    setNumericAnswer(e.target.value);
                    if (feedback.status !== 'correct') {
                      setFeedback({ status: null, message: '' });
                    }
                  }}
                  disabled={feedback.status === 'correct'}
                  placeholder="Ketik angka hasil kalkulasimu..."
                  className="w-full px-4 py-3 rounded bg-[#22243D] border border-[#7776A8] text-[#F4EEDC] focus:outline-none focus:border-[#D9AD75] font-data text-base"
                  autoFocus
                />
                {challenge.unit && (
                  <span className="absolute right-4 text-xs font-data text-[#A9B8DF]">
                    {challenge.unit}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {challenge.options?.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3.5 rounded border text-xs sm:text-sm cursor-pointer transition-all ${
                    selectedOptionId === opt.id
                      ? 'bg-[#D9AD75]/15 border-[#D9AD75] text-[#F4EEDC]'
                      : 'bg-[#22243D] border-[#7776A8]/30 hover:border-[#7776A8] text-[#A9B8DF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="knowledge-option"
                    value={opt.id}
                    checked={selectedOptionId === opt.id}
                    onChange={() => {
                      sound.playClick();
                      setSelectedOptionId(opt.id);
                      if (feedback.status !== 'correct') {
                        setFeedback({ status: null, message: '' });
                      }
                    }}
                    disabled={feedback.status === 'correct'}
                    className="mt-0.5 text-[#D9AD75] focus:ring-[#D9AD75]"
                  />
                  <span className="leading-relaxed">{opt.text}</span>
                </label>
              ))}
            </div>
          )}

          {feedback.status !== 'correct' && (
            <button
              type="submit"
              className="w-full py-3 px-4 rounded bg-[#D9AD75] text-[#22243D] font-bold text-xs sm:text-sm hover:bg-[#E7DDF5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-serif-title tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>Verifikasi Jawaban</span>
            </button>
          )}
        </form>

        {/* Feedback / Educational Concept Result */}
        {feedback.status && (
          <div
            className={`p-4 rounded-lg border text-xs sm:text-sm leading-relaxed mb-6 animate-fade-in ${
              feedback.status === 'correct'
                ? 'bg-[#91B9B4]/20 border-[#91B9B4] text-[#F4EEDC]'
                : 'bg-[#C8A9C8]/15 border-[#C8A9C8] text-[#E7DDF5]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.status === 'correct' ? (
                <CheckCircle className="w-5 h-5 text-[#91B9B4] shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="w-5 h-5 text-[#C8A9C8] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5">
                <p className="font-semibold">{feedback.message}</p>
                {feedback.explanation && <p>{feedback.explanation}</p>}
                {feedback.status === 'correct' && (
                  <div className="mt-3 pt-3 border-t border-[#91B9B4]/30 text-xs text-[#91B9B4]">
                    <span className="font-bold block mb-0.5">Konsep Pelajaran yang Dipelajari:</span>
                    <span>{challenge.educationalTakeaway}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progressive Hint Drawer */}
        {feedback.status !== 'correct' && (
          <div className="border-t border-[#7776A8]/30 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-data text-[#A9B8DF] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#D9AD75]" />
                <span>Petunjuk Penyelidikan ({activeHintIndex + 1}/{challenge.hints.length})</span>
              </span>

              {activeHintIndex < challenge.hints.length - 1 && (
                <button
                  type="button"
                  onClick={revealNextHint}
                  className="text-xs text-[#D9AD75] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Petunjuk {activeHintIndex + 2}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeHintIndex >= 0 && (
              <div className="space-y-2 mt-2">
                {challenge.hints.slice(0, activeHintIndex + 1).map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[#22243D] border border-[#7776A8]/40 text-xs text-[#E7DDF5] flex items-start gap-2"
                  >
                    <span className="font-data text-[#D9AD75] font-bold">#{idx + 1}</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Done / Close CTA */}
        <div className="flex justify-end pt-4 mt-2 border-t border-[#7776A8]/30">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-[#7776A8]/30 border border-[#7776A8]/50 text-[#F4EEDC] hover:bg-[#7776A8]/50 text-xs font-semibold cursor-pointer"
          >
            {feedback.status === 'correct' ? 'Lanjutkan Penyelidikan' : 'Tutup Sementara'}
          </button>
        </div>
      </div>
    </div>
  );
};
