import React from 'react';
import { CASE_CATALOG } from '../data/cases/catalog';
import { ALL_BADGES } from '../data/badges';
import { PlayerProgress } from '../types/game';
import { sound } from '../utils/audio';
import {
  Archive,
  X,
  CheckCircle,
  Clock,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CaseArchiveModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onPlayCase: (caseCode: string) => void;
}

export const CaseArchiveModal: React.FC<CaseArchiveModalProps> = ({
  progress,
  onClose,
  onPlayCase,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22243D]/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-[#22243D] border border-[#7776A8] rounded-lg shadow-2xl p-6 sm:p-8 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#7776A8]/30 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-[#7776A8]/20 border border-[#7776A8]/40 text-[#D9AD75]">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-data text-[#D9AD75] uppercase tracking-wider">
                <span>Ruang Arsip Kasus Akademi</span>
                <span className="text-[#7776A8]">·</span>
                <span>Peringkat: {progress.rank.split('(')[0].trim()}</span>
              </div>
              <h2 id="archive-modal-title" className="font-serif-title font-bold text-xl sm:text-2xl text-[#F4EEDC]">
                Koleksi Kasus Penyelidikan
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A9B8DF] hover:text-[#F4EEDC] rounded hover:bg-[#7776A8]/20 cursor-pointer"
            aria-label="Tutup Arsip Kasus"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case List */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-data text-[#A9B8DF] uppercase tracking-wider">
            Berkas Kasus Akademi:
          </h3>

          <div className="space-y-3">
            {CASE_CATALOG.map((caseItem) => {
              const isPlayable = caseItem.status === 'PLAYABLE';
              const isCompleted = progress.completedCases.includes('the-last-drop');

              return (
                <div
                  key={caseItem.code}
                  className={`p-5 rounded-lg border text-left transition-all ${
                    isCompleted
                      ? 'bg-[#91B9B4]/10 border-[#91B9B4]/40'
                      : isPlayable
                      ? 'bg-[#22243D] border-[#D9AD75]/60 shadow-sm'
                      : 'bg-[#22243D]/50 border-[#7776A8]/20 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-data text-xs text-[#D9AD75] font-bold">
                        {caseItem.code}
                      </span>
                      <span className="text-[#7776A8] text-xs">·</span>
                      <span className="text-xs text-[#A9B8DF]">{caseItem.difficulty}</span>
                    </div>

                    {isCompleted ? (
                      <span className="text-xs font-data text-[#91B9B4] flex items-center gap-1.5 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Kasus Terpecahkan
                      </span>
                    ) : isPlayable ? (
                      <span className="text-xs font-data text-[#D9AD75] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Siap Dimainkan
                      </span>
                    ) : (
                      <span className="text-xs font-data text-[#A9B8DF] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Arsip Mendatang
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif-title font-bold text-base sm:text-lg text-[#F4EEDC] mb-1">
                    {caseItem.title}
                  </h4>
                  <p className="text-xs font-data text-[#D9AD75] mb-2">{caseItem.subtitle}</p>
                  <p className="text-xs text-[#A9B8DF] leading-relaxed mb-4">{caseItem.synopsis}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#7776A8]/20">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {caseItem.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-data text-[#E7DDF5] bg-[#7776A8]/20 px-2 py-0.5 rounded border border-[#7776A8]/30"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>

                    {isPlayable && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onPlayCase(caseItem.code);
                        }}
                        className="px-4 py-2 rounded bg-[#D9AD75] text-[#22243D] hover:bg-[#E7DDF5] text-xs font-bold font-serif-title transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Mainkan Kembali Kasus</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Mulai Penyelidikan</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges Collection Showcase */}
        <div className="border-t border-[#7776A8]/30 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-data text-[#D9AD75] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Koleksi Lencana Penyelidik ({progress.badges.length}/{ALL_BADGES.length})</span>
            </h3>
            <span className="font-data text-xs text-[#F4EEDC]">
              {progress.knowledgePoints} Total Poin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_BADGES.map((badge) => {
              const unlocked = progress.badges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg border text-left flex items-start gap-3 ${
                    unlocked
                      ? 'bg-[#7776A8]/20 border-[#D9AD75]/60'
                      : 'bg-[#22243D]/40 border-[#7776A8]/20 opacity-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full shrink-0 ${
                      unlocked ? 'bg-[#D9AD75]/20 text-[#D9AD75]' : 'bg-[#7776A8]/20 text-[#A9B8DF]'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif-title font-bold text-xs text-[#F4EEDC] mb-0.5">
                      {badge.title}
                    </h5>
                    <p className="text-[11px] text-[#A9B8DF] leading-tight">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close CTA */}
        <div className="flex justify-end pt-6 mt-6 border-t border-[#7776A8]/30">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-[#7776A8]/30 border border-[#7776A8]/50 text-[#F4EEDC] hover:bg-[#7776A8]/50 text-xs font-semibold cursor-pointer"
          >
            Tutup Arsip
          </button>
        </div>
      </div>
    </div>
  );
};
