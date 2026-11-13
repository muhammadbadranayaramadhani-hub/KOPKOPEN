import React, { useState } from 'react';
import { GameScreen, PlayerProgress } from '../types/game';
import { Play, RotateCcw, Archive, BookOpen, Volume2, VolumeX, Sparkles, UserCheck } from 'lucide-react';

interface MainMenuProps {
  onStartNew: (name?: string) => void;
  onContinue: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
  progress: PlayerProgress;
  toggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNew,
  onContinue,
  onOpenArchive,
  onOpenSettings,
  progress,
  toggleSound,
}) => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [inputName, setInputName] = useState(progress.investigatorName || 'Detektif Muda');

  const hasSaveData =
    progress.collectedEvidenceIds.length > 0 ||
    progress.caseResolved ||
    progress.solvedChallengeIds.length > 0;

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNameModal(false);
    onStartNew(inputName);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#22243D] text-[#F4EEDC]">
      {/* Background Image with Cinematic Scrim and Dreamy Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/mysteria_archive_hall_1793849661193.jpg"
          alt="Aula Arsip Misterius Akademi Mysteria"
          className="w-full h-full object-cover object-center scale-105 filter brightness-90 contrast-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Layered atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#22243D] via-[#22243D]/65 to-[#22243D]/30" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#22243D]/40 to-[#22243D]/80" />
      </div>

      {/* Top Header Strip */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-data text-[#D9AD75]">
          <Sparkles className="w-4 h-4 text-[#D9AD75]" />
          <span>Divisi Penyelidikan Akademi Mysteria</span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-[#22243D]/70 border border-[#7776A8]/40 text-[#A9B8DF] hover:text-[#F4EEDC] hover:border-[#D9AD75] transition-all cursor-pointer backdrop-blur-sm"
          title={progress.soundEnabled ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
          aria-label={progress.soundEnabled ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
        >
          {progress.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#91B9B4]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#C8A9C8]" />
          )}
        </button>
      </header>

      {/* Center Hero Identity */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 text-center flex flex-col items-center my-auto">
        <div className="inline-block mb-3 px-3.5 py-1 text-xs font-data tracking-widest text-[#E7DDF5] bg-[#7776A8]/30 border border-[#7776A8]/50 rounded">
          VISUAL NOVEL EDUKASI MISTERI · SMP KELAS VII–IX
        </div>

        <h1 className="font-serif-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-[#F4EEDC] drop-shadow-lg mb-3">
          MYSTERIA
        </h1>

        <p className="font-serif-title text-base sm:text-xl md:text-2xl text-[#D9AD75] tracking-wide mb-6">
          The Academy of Hidden Knowledge
        </p>

        <p className="font-sans text-sm sm:text-base text-[#A9B8DF] max-w-2xl leading-relaxed mb-10 text-balance">
          Setiap anomali memiliki penjelasan logis. Masuki arsip rahasia akademi, selidiki bukti lapangan,
          pecahkan teka-teki sains dan matematika, lalu ungkap kebenaran di balik setiap berkas kasus tak terpecahkan.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {hasSaveData && (
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-6 py-3.5 rounded bg-[#D9AD75] text-[#22243D] font-bold text-sm hover:bg-[#E7DDF5] hover:text-[#22243D] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-title tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Lanjutkan Investigasi</span>
            </button>
          )}

          <button
            onClick={() => setShowNameModal(true)}
            className={`w-full sm:w-auto px-6 py-3.5 rounded font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-title tracking-wider ${
              hasSaveData
                ? 'bg-[#22243D]/80 border border-[#7776A8] text-[#F4EEDC] hover:border-[#D9AD75] hover:bg-[#7776A8]/30'
                : 'bg-[#D9AD75] text-[#22243D] hover:bg-[#E7DDF5]'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{hasSaveData ? 'Investigasi Baru' : 'Mulai Investigasi'}</span>
          </button>
        </div>

        {/* Secondary Navigation Links */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs sm:text-sm text-[#A9B8DF]">
          <button
            onClick={onOpenArchive}
            className="flex items-center gap-1.5 hover:text-[#D9AD75] transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>Arsip Kasus ({progress.completedCases.length}/3 Selesai)</span>
          </button>
          <span className="text-[#7776A8]" aria-hidden="true">·</span>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 hover:text-[#D9AD75] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan & Lencana</span>
          </button>
        </div>
      </main>

      {/* Footer Status */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-data text-[#A9B8DF]/70 gap-2 border-t border-[#7776A8]/20">
        <div>
          <span>Penyelidik Aktif: </span>
          <span className="text-[#F4EEDC] font-semibold">{progress.investigatorName}</span>
          <span className="mx-2 text-[#7776A8]">/</span>
          <span className="text-[#D9AD75]">{progress.rank}</span>
        </div>
        <div>
          <span>MYS-001: Tetes Terakhir · Matematika · IPA · Bahasa Indonesia</span>
        </div>
      </footer>

      {/* Investigator Name Modal */}
      {showNameModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-name-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22243D]/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-md bg-[#22243D] border border-[#7776A8]/60 p-6 md:p-8 rounded-lg shadow-2xl text-left">
            <h2 id="modal-name-title" className="font-serif-title text-xl font-bold text-[#F4EEDC] mb-2">
              Buku Registrasi Penyelidik
            </h2>
            <p className="text-sm text-[#A9B8DF] mb-5">
              Sebelum melangkah ke ruang arsip rahasia, tuliskan nama atau sebutan penyelidikmu:
            </p>

            <form onSubmit={handleStartSubmit} className="space-y-4">
              <div>
                <label htmlFor="investigator-name-input" className="block text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-1.5">
                  Nama Penyelidik
                </label>
                <input
                  id="investigator-name-input"
                  type="text"
                  maxLength={24}
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Contoh: Detektif Rangga"
                  className="w-full px-4 py-2.5 rounded bg-[#22243D] border border-[#7776A8] text-[#F4EEDC] focus:outline-none focus:border-[#D9AD75] text-sm"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#7776A8]/30">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#A9B8DF] hover:text-[#F4EEDC] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#D9AD75] text-[#22243D] font-bold text-xs hover:bg-[#E7DDF5] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Masuki Akademi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
