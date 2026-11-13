import React from 'react';
import { GameScreen, PlayerProgress } from '../types/game';
import { Compass, BookOpen, GitMerge, Archive, Settings, Volume2, VolumeX, Award } from 'lucide-react';

interface TopNavigationProps {
  currentScreen: GameScreen;
  setCurrentScreen: (screen: GameScreen) => void;
  progress: PlayerProgress;
  toggleSound: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentScreen,
  setCurrentScreen,
  progress,
  toggleSound,
}) => {
  if (currentScreen === 'MAIN_MENU') return null;

  const evidenceCount = progress.collectedEvidenceIds.length;
  const deductionsCount = progress.unlockedDeductionIds.length;

  return (
    <header className="sticky top-0 z-40 bg-[#22243D]/95 backdrop-blur-md border-b border-[#7776A8]/30 px-4 md:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentScreen('MAIN_MENU')}
            className="text-left group cursor-pointer"
            aria-label="Kembali ke Menu Utama Mysteria"
          >
            <span className="font-serif-title font-bold text-lg md:text-xl tracking-wider text-[#D9AD75] group-hover:text-[#E7DDF5] transition-colors whitespace-nowrap block">
              MYSTERIA
            </span>
            <span className="font-data text-[10px] text-[#A9B8DF] tracking-widest uppercase block -mt-1">
              Kasus MYS-001 · Tetes Terakhir
            </span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none" aria-label="Navigasi Investigasi">
          <button
            onClick={() => setCurrentScreen('INVESTIGATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'INVESTIGATION'
                ? 'bg-[#7776A8]/40 text-[#F4EEDC] border border-[#D9AD75]/60 shadow-sm'
                : 'text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20'
            }`}
            aria-current={currentScreen === 'INVESTIGATION' ? 'page' : undefined}
          >
            <Compass className="w-4 h-4 text-[#D9AD75]" />
            <span>Investigasi</span>
          </button>

          <button
            onClick={() => setCurrentScreen('EVIDENCE_INVENTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'EVIDENCE_INVENTORY'
                ? 'bg-[#7776A8]/40 text-[#F4EEDC] border border-[#D9AD75]/60 shadow-sm'
                : 'text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20'
            }`}
            aria-current={currentScreen === 'EVIDENCE_INVENTORY' ? 'page' : undefined}
          >
            <BookOpen className="w-4 h-4 text-[#91B9B4]" />
            <span>Jurnal Bukti</span>
            <span className="font-data text-[11px] text-[#D9AD75]">
              ({evidenceCount}/5)
            </span>
          </button>

          <button
            onClick={() => setCurrentScreen('DEDUCTION_BOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'DEDUCTION_BOARD'
                ? 'bg-[#7776A8]/40 text-[#F4EEDC] border border-[#D9AD75]/60 shadow-sm'
                : 'text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20'
            }`}
            aria-current={currentScreen === 'DEDUCTION_BOARD' ? 'page' : undefined}
          >
            <GitMerge className="w-4 h-4 text-[#C8A9C8]" />
            <span>Papan Deduksi</span>
            <span className="font-data text-[11px] text-[#D9AD75]">
              ({deductionsCount}/3)
            </span>
          </button>

          <button
            onClick={() => setCurrentScreen('CASE_RESOLUTION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'CASE_RESOLUTION'
                ? 'bg-[#D9AD75]/30 text-[#F4EEDC] border border-[#D9AD75] shadow-sm'
                : 'text-[#D9AD75] hover:bg-[#D9AD75]/15'
            }`}
            aria-current={currentScreen === 'CASE_RESOLUTION' ? 'page' : undefined}
          >
            <Award className="w-4 h-4 text-[#D9AD75]" />
            <span>Sidang Akhir</span>
          </button>
        </nav>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Investigator Points & Rank (Desktop) */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs font-semibold text-[#F4EEDC]">
              {progress.investigatorName}
            </span>
            <span className="font-data text-[11px] text-[#D9AD75]">
              {progress.knowledgePoints} Poin · {progress.rank.split('(')[0].trim()}
            </span>
          </div>

          <button
            onClick={() => setCurrentScreen('CASE_ARCHIVE')}
            className="p-2 text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20 rounded transition-colors cursor-pointer"
            title="Arsip Kasus Akademi"
            aria-label="Buka Arsip Kasus"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-2 text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20 rounded transition-colors cursor-pointer"
            title={progress.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            aria-label={progress.soundEnabled ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#91B9B4]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#C8A9C8]" />
            )}
          </button>

          <button
            onClick={() => setCurrentScreen('SETTINGS')}
            className="p-2 text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20 rounded transition-colors cursor-pointer"
            title="Pengaturan & Panduan"
            aria-label="Buka Pengaturan dan Panduan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
