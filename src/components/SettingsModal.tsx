import React, { useState } from 'react';
import { PlayerProgress } from '../types/game';
import { sound } from '../utils/audio';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface SettingsModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onClose,
  onToggleSound,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'SETTINGS'>('GUIDE');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22243D]/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#22243D] border border-[#7776A8] rounded-lg shadow-2xl p-6 sm:p-8 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#7776A8]/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-[#7776A8]/20 border border-[#7776A8]/40 text-[#D9AD75]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="font-serif-title font-bold text-lg sm:text-xl text-[#F4EEDC]">
                Panduan & Pengaturan Investigasi
              </h2>
              <p className="text-xs text-[#A9B8DF]">Akademi Mysteria · Divisi Penyelidikan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A9B8DF] hover:text-[#F4EEDC] rounded hover:bg-[#7776A8]/20 cursor-pointer"
            aria-label="Tutup Pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#7776A8]/30 pb-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('GUIDE');
            }}
            className={`px-4 py-1.5 rounded text-xs font-semibold font-serif-title transition-all cursor-pointer ${
              activeTab === 'GUIDE'
                ? 'bg-[#D9AD75] text-[#22243D]'
                : 'text-[#A9B8DF] hover:text-[#F4EEDC]'
            }`}
          >
            Panduan Bermain (SMP)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('SETTINGS');
            }}
            className={`px-4 py-1.5 rounded text-xs font-semibold font-serif-title transition-all cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-[#D9AD75] text-[#22243D]'
                : 'text-[#A9B8DF] hover:text-[#F4EEDC]'
            }`}
          >
            Opsi & Data Progres
          </button>
        </div>

        {/* Guide Tab */}
        {activeTab === 'GUIDE' ? (
          <div className="space-y-4 text-xs sm:text-sm text-[#E7DDF5] leading-relaxed">
            <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
              <h4 className="font-serif-title font-bold text-[#D9AD75] flex items-center gap-2">
                <span>1. Eksplorasi & Temukan Petunjuk</span>
              </h4>
              <p className="text-[#A9B8DF]">
                Kunjungi 3 lokasi penyelidikan (Taman Akademi, Ruang Pemeliharaan, dan Lorong). Klik
                pin bercahaya untuk memeriksa benda, membaca dokumen, atau mewawancarai saksi. Setiap
                objek yang memuat fakta penting dapat kamu masukkan ke{' '}
                <span className="text-[#F4EEDC] font-semibold">Jurnal Bukti</span>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
              <h4 className="font-serif-title font-bold text-[#D9AD75] flex items-center gap-2">
                <span>2. Pecahkan Tantangan Pengetahuan</span>
              </h4>
              <p className="text-[#A9B8DF]">
                Beberapa objek memicu tantangan interaktif pelajaran Matematika (hitung selisih &
                perkalian), IPA (konservasi air & evaporasi), dan Bahasa Indonesia (membedakan fakta
                dan opini). Gunakan petunjuk bertingkat jika memerlukan bantuan.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
              <h4 className="font-serif-title font-bold text-[#D9AD75] flex items-center gap-2">
                <span>3. Hubungkan Bukti di Papan Deduksi</span>
              </h4>
              <p className="text-[#A9B8DF]">
                Buka Papan Deduksi, pilih 2 bukti dari jurnalmu, dan tentukan korelasi logis yang
                tepat. Deduksi yang benar akan membuka wawasan baru dan membantah dugaan palsu.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
              <h4 className="font-serif-title font-bold text-[#D9AD75] flex items-center gap-2">
                <span>4. Sidang Akhir Resolusi Kasus</span>
              </h4>
              <p className="text-[#A9B8DF]">
                Pilih hipotesis akhir yang didukung oleh perhitungan numerik dan bukti fisik. Serahkan
                kesimpulanmu untuk menyelesaikan kasus dan memperoleh lencana kehormatan!
              </p>
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30">
              <div>
                <span className="font-semibold text-[#F4EEDC] block">Efek Suara Sintetis (Web Audio)</span>
                <span className="text-xs text-[#A9B8DF]">
                  Bunyi lonceng penemuan bukti, perpindahan halaman, dan nada deduksi.
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleSound();
                }}
                className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                  progress.soundEnabled
                    ? 'bg-[#91B9B4]/20 border-[#91B9B4] text-[#91B9B4]'
                    : 'bg-[#C8A9C8]/20 border-[#C8A9C8] text-[#C8A9C8]'
                }`}
              >
                {progress.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="font-data text-xs">{progress.soundEnabled ? 'Aktif' : 'Senyap'}</span>
              </button>
            </div>

            {/* Profile Overview */}
            <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
              <span className="text-xs font-data text-[#D9AD75] uppercase tracking-wider block">
                Profil Penyelidik Aktif
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9B8DF]">Nama:</span>
                <span className="text-[#F4EEDC] font-semibold">{progress.investigatorName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9B8DF]">Pangkat:</span>
                <span className="text-[#D9AD75] font-semibold">{progress.rank}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9B8DF]">Poin Pengetahuan:</span>
                <span className="font-data text-[#F4EEDC]">{progress.knowledgePoints} Poin</span>
              </div>
            </div>

            {/* Reset Progress */}
            <div className="p-4 rounded-lg bg-[#C8A9C8]/10 border border-[#C8A9C8]/30 space-y-3">
              <span className="font-semibold text-[#E7DDF5] block">Atur Ulang Data Penyelidikan</span>
              <p className="text-xs text-[#A9B8DF]">
                Hapus seluruh catatan bukti, tantangan terpecahkan, dan skor dari penyimpanan lokal
                browser.
              </p>

              {showConfirmReset ? (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded bg-red-800/80 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Ya, Hapus Semua Progres
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-2 text-xs text-[#A9B8DF] hover:text-[#F4EEDC] cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="px-4 py-2 rounded bg-[#7776A8]/30 border border-[#C8A9C8] text-[#E7DDF5] hover:bg-[#C8A9C8]/30 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Atur Ulang Progres Permainan</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-6 mt-6 border-t border-[#7776A8]/30">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-[#7776A8]/30 border border-[#7776A8]/50 text-[#F4EEDC] hover:bg-[#7776A8]/50 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
