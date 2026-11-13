import React, { useState } from 'react';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { CaseResolutionOption, PlayerProgress } from '../types/game';
import { CaseEvaluationResult } from '../engines/DeductionEngine';
import { sound } from '../utils/audio';
import {
  Award,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface CaseResolutionProps {
  progress: PlayerProgress;
  onSubmitHypothesis: (
    hypothesisId: string,
    supportingEvidenceIds: string[]
  ) => CaseEvaluationResult;
  onReturnToMainMenu: () => void;
  onOpenInvestigation: () => void;
}

export const CaseResolution: React.FC<CaseResolutionProps> = ({
  progress,
  onSubmitHypothesis,
  onReturnToMainMenu,
  onOpenInvestigation,
}) => {
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>(
    progress.finalHypothesisId || 'res-garden-watering'
  );
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>(
    progress.collectedEvidenceIds
  );
  const [evaluationResult, setEvaluationResult] = useState<CaseEvaluationResult | null>(
    progress.caseResolved
      ? {
          isCorrect: true,
          title: 'Penyiraman Taman Ekstra untuk Anggrek Langka',
          feedback:
            'Deduksi Sempurna! Kamu telah menggunakan matematika, analisis data, dan verifikasi saksi untuk mengungkap kebenaran secara ilmiah tanpa terjebak kepanikan!',
          pointsEarned: 150,
          supportingEvidenceValid: true,
          missingEvidenceTitles: [],
        }
      : null
  );

  const handleToggleEvidence = (id: string) => {
    sound.playClick();
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmitHypothesis(selectedHypothesisId, selectedEvidenceIds);
    setEvaluationResult(result);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto pb-4 border-b border-[#7776A8]/30">
        <div className="inline-flex items-center gap-2 text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-2">
          <Award className="w-4 h-4" />
          <span>Sidang Resolusi Kasus MYS-001</span>
        </div>
        <h1 className="font-serif-title text-2xl sm:text-4xl font-bold text-[#F4EEDC]">
          Kebenaran di Balik Tetes Terakhir
        </h1>
        <p className="text-xs sm:text-sm text-[#A9B8DF] mt-2">
          Seluruh berkas telah diperiksa. Saatnya memaparkan kesimpulan final di hadapan Dewan Arsip
          Akademi Mysteria berdasarkan bukti dan penalaran ilmiah.
        </p>
      </div>

      {/* Case Solved Victory Showcase */}
      {evaluationResult?.isCorrect ? (
        <div className="bg-[#22243D] border border-[#D9AD75] rounded-xl p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in text-left">
          {/* Top Victory Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#7776A8]/40">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D9AD75]/20 border-2 border-[#D9AD75] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(217,173,117,0.4)]">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[#D9AD75]" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <span className="font-data text-xs text-[#91B9B4] uppercase tracking-wider font-semibold">
                Kasus MYS-001 Resmi Ditutup · Status: Terpecahkan
              </span>
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#F4EEDC]">
                Selamat, {progress.investigatorName}!
              </h2>
              <p className="text-xs sm:text-sm text-[#E7DDF5] leading-relaxed">
                {evaluationResult.feedback}
              </p>
            </div>
          </div>

          {/* Detailed Truth Reconstruction */}
          <div className="space-y-4">
            <h3 className="font-serif-title font-bold text-base sm:text-lg text-[#D9AD75] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#91B9B4]" />
              <span>Rekonstruksi Kebenaran Berdasarkan Fakta</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
                <span className="font-data text-xs font-bold text-[#D9AD75] block">
                  1. Hubungan Matematika Konsisten:
                </span>
                <p className="text-[#A9B8DF] leading-relaxed">
                  Konsumsi hari ini (1.560 L) dikurangi konsumsi normal (1.200 L) menghasilkan selisih tepat{' '}
                  <span className="text-[#F4EEDC] font-semibold">360 liter</span>. Catatan log membuktikan adanya 2 sesi penyiraman ekstra, masing-masing 180 liter (2 × 180 L ={' '}
                  <span className="text-[#F4EEDC] font-semibold">360 liter</span>). Seluruh lonjakan air terjawab 100%.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#22243D]/80 border border-[#7776A8]/30 space-y-2">
                <span className="font-data text-xs font-bold text-[#91B9B4] block">
                  2. Bukti Fisik & Manometer Stabil:
                </span>
                <p className="text-[#A9B8DF] leading-relaxed">
                  Observasi langsung meteran air menunjukkan jarum diam total saat katup ditutup. Uji tekanan membuktikan tekanan pipa konstan 2,4 bar tanpa rembesan, membantah kepanikan kebocoran pipa bawah tanah.
                </p>
              </div>
            </div>
          </div>

          {/* Educational Learnings Summary */}
          <div className="p-5 rounded-lg bg-[#7776A8]/15 border border-[#7776A8]/40 space-y-3">
            <h4 className="font-serif-title font-bold text-sm text-[#F4EEDC] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D9AD75]" />
              <span>Pondasi Pembelajaran Lintas Mata Pelajaran (SMP):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#E7DDF5]">
              <div className="p-3 rounded bg-[#22243D]/60 border border-[#7776A8]/20">
                <span className="font-data text-[#D9AD75] block font-semibold mb-1">Matematika</span>
                <span>Operasi pengurangan bilangan bulat untuk mencari selisih data, dan perkalian kuota agregat.</span>
              </div>
              <div className="p-3 rounded bg-[#22243D]/60 border border-[#7776A8]/20">
                <span className="font-data text-[#91B9B4] block font-semibold mb-1">IPA (Biologi & Fisika)</span>
                <span>Prinsip konservasi air, evaporasi tanaman anggrek di cuaca panas, dan tekanan hidrolik tertutup.</span>
              </div>
              <div className="p-3 rounded bg-[#22243D]/60 border border-[#7776A8]/20">
                <span className="font-data text-[#C8A9C8] block font-semibold mb-1">Bahasa Indonesia</span>
                <span>Kemampuan membaca kritis, memisahkan fakta kuantitatif dari opini kecurigaan subjektif.</span>
              </div>
            </div>
          </div>

          {/* Rewards & Rank Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-[#22243D] border border-[#D9AD75]/40 text-xs sm:text-sm">
            <div>
              <span className="text-[#A9B8DF] block">Pencapaian Penyelidikan:</span>
              <span className="font-serif-title font-bold text-[#F4EEDC] text-base">
                {progress.rank}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#A9B8DF] block">Total Poin Pengetahuan:</span>
              <span className="font-data text-lg font-bold text-[#D9AD75]">
                {progress.knowledgePoints} Poin
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#7776A8]/30">
            <button
              onClick={onReturnToMainMenu}
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#D9AD75] text-[#22243D] font-bold text-xs sm:text-sm hover:bg-[#E7DDF5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-serif-title tracking-wider"
            >
              <span>Simpan ke Arsip & Kembali ke Menu Utama</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Hypothesis Selection & Submission Form */
        <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
          {/* Evaluation Error/Warning Notice if submitted incorrectly */}
          {evaluationResult && !evaluationResult.isCorrect && (
            <div className="p-4 rounded-lg bg-[#C8A9C8]/15 border border-[#C8A9C8] text-xs sm:text-sm text-[#F4EEDC] space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-[#C8A9C8]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Kesimpulan Belum Didukung Bukti yang Cukup</span>
              </div>
              <p>{evaluationResult.feedback}</p>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onOpenInvestigation}
                  className="text-xs text-[#D9AD75] underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Kembali ke Investigasi untuk Melengkapi Bukti</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Choose Primary Hypothesis */}
          <div className="bg-[#22243D] border border-[#7776A8]/40 rounded-lg p-5 sm:p-7 shadow-lg space-y-4">
            <h2 className="font-serif-title font-bold text-base sm:text-lg text-[#F4EEDC]">
              1. Pilih Penjelasan Paling Masuk Akal
            </h2>
            <p className="text-xs text-[#A9B8DF]">
              Berdasarkan seluruh data yang kamu temukan, faktor apakah yang sebenarnya menyebabkan
              lonjakan konsumsi air harian sebesar 360 liter?
            </p>

            <div className="space-y-3 pt-1">
              {theLastDropCase.resolutions.map((res) => (
                <label
                  key={res.id}
                  className={`flex items-start gap-3.5 p-4 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                    selectedHypothesisId === res.id
                      ? 'bg-[#D9AD75]/15 border-[#D9AD75] text-[#F4EEDC] shadow-sm'
                      : 'bg-[#22243D] border-[#7776A8]/30 hover:border-[#7776A8] text-[#A9B8DF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="case-hypothesis"
                    value={res.id}
                    checked={selectedHypothesisId === res.id}
                    onChange={() => {
                      sound.playClick();
                      setSelectedHypothesisId(res.id);
                    }}
                    className="mt-1 text-[#D9AD75] focus:ring-[#D9AD75]"
                  />
                  <div>
                    <span className="font-serif-title font-bold text-[#F4EEDC] block mb-1">
                      {res.title}
                    </span>
                    <span className="leading-relaxed block text-xs sm:text-sm">
                      {res.summary}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Select Supporting Evidence */}
          <div className="bg-[#22243D] border border-[#7776A8]/40 rounded-lg p-5 sm:p-7 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-title font-bold text-base sm:text-lg text-[#F4EEDC]">
                  2. Pilih Bukti Pendukung dari Jurnalmu
                </h2>
                <p className="text-xs text-[#A9B8DF]">
                  Centang bukti-bukti yang menjadi landasan ilmiah untuk mendukung hipotesismu:
                </p>
              </div>
              <span className="text-xs font-data text-[#D9AD75]">
                {selectedEvidenceIds.length} Terpilih
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {theLastDropCase.evidence.map((ev) => {
                const isCollected = progress.collectedEvidenceIds.includes(ev.id);
                const isChecked = selectedEvidenceIds.includes(ev.id);

                return (
                  <label
                    key={ev.id}
                    className={`flex items-start gap-3 p-3.5 rounded border text-xs cursor-pointer transition-all ${
                      !isCollected
                        ? 'opacity-40 bg-[#22243D]/40 border-[#7776A8]/20 cursor-not-allowed'
                        : isChecked
                        ? 'bg-[#7776A8]/30 border-[#D9AD75] text-[#F4EEDC]'
                        : 'bg-[#22243D] border-[#7776A8]/30 text-[#A9B8DF]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!isCollected}
                      onChange={() => handleToggleEvidence(ev.id)}
                      className="mt-0.5 rounded text-[#D9AD75] focus:ring-[#D9AD75]"
                    />
                    <div>
                      <span className="font-serif-title font-semibold block text-[#F4EEDC] mb-0.5">
                        {ev.title}
                      </span>
                      <span className="text-[11px] text-[#A9B8DF] line-clamp-1">
                        {isCollected ? ev.keyData : '(Belum ditemukan di lokasi)'}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#7776A8]/30">
            <button
              type="button"
              onClick={onOpenInvestigation}
              className="text-xs text-[#A9B8DF] hover:text-[#F4EEDC] flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Kembali Menyelidiki Lokasi</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#D9AD75] text-[#22243D] font-bold text-xs sm:text-sm hover:bg-[#E7DDF5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg font-serif-title tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              <span>Serahkan Kesimpulan Akhir</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
