import React, { useState } from 'react';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { EvidenceItem, EvidenceConnection } from '../types/game';
import { sound } from '../utils/audio';
import {
  GitMerge,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  AlertCircle,
  X,
} from 'lucide-react';

interface DeductionBoardProps {
  collectedEvidenceIds: string[];
  unlockedDeductionIds: string[];
  onMakeDeduction: (
    evidenceAId: string,
    evidenceBId: string,
    selectedOptionId: string
  ) => { success: boolean; feedback: string; insight?: string };
  onOpenEvidenceInventory: () => void;
  onOpenCaseResolution: () => void;
}

export const DeductionBoard: React.FC<DeductionBoardProps> = ({
  collectedEvidenceIds,
  unlockedDeductionIds,
  onMakeDeduction,
  onOpenEvidenceInventory,
  onOpenCaseResolution,
}) => {
  const [selectedEvidenceA, setSelectedEvidenceA] = useState<string | null>(null);
  const [selectedEvidenceB, setSelectedEvidenceB] = useState<string | null>(null);
  const [activeConnection, setActiveConnection] = useState<EvidenceConnection | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<{
    success: boolean;
    feedback: string;
    insight?: string;
  } | null>(null);

  const collectedEvidenceList: EvidenceItem[] = theLastDropCase.evidence.filter((e) =>
    collectedEvidenceIds.includes(e.id)
  );

  const handleCardClick = (evidenceId: string) => {
    sound.playClick();
    setFeedbackResult(null);

    if (!selectedEvidenceA) {
      setSelectedEvidenceA(evidenceId);
    } else if (selectedEvidenceA === evidenceId) {
      setSelectedEvidenceA(null);
    } else if (!selectedEvidenceB) {
      setSelectedEvidenceB(evidenceId);
      // Check for connection
      checkConnection(selectedEvidenceA, evidenceId);
    } else if (selectedEvidenceB === evidenceId) {
      setSelectedEvidenceB(null);
      setActiveConnection(null);
    } else {
      // Replace B with new selection
      setSelectedEvidenceB(evidenceId);
      checkConnection(selectedEvidenceA, evidenceId);
    }
  };

  const checkConnection = (idA: string, idB: string) => {
    const conn = theLastDropCase.connections.find(
      (c) =>
        (c.evidenceA === idA && c.evidenceB === idB) ||
        (c.evidenceA === idB && c.evidenceB === idA)
    );
    setActiveConnection(conn || null);
    setSelectedOptionId(null);
  };

  const handleResetSelection = () => {
    sound.playClick();
    setSelectedEvidenceA(null);
    setSelectedEvidenceB(null);
    setActiveConnection(null);
    setSelectedOptionId(null);
    setFeedbackResult(null);
  };

  const handleSubmitDeduction = () => {
    if (!selectedEvidenceA || !selectedEvidenceB || !selectedOptionId) return;

    const result = onMakeDeduction(selectedEvidenceA, selectedEvidenceB, selectedOptionId);
    setFeedbackResult(result);
  };

  const isDeductionUnlocked = (connId: string) => unlockedDeductionIds.includes(connId);

  return (
    <div className="min-h-[calc(100vh-60px)] w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#7776A8]/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-1">
            <GitMerge className="w-4 h-4" />
            <span>Papan Deduksi & Hubungan Bukti</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#F4EEDC]">
            Menghubungkan Titik Temuan
          </h1>
          <p className="text-xs sm:text-sm text-[#A9B8DF] mt-1">
            Pilih 2 kartu bukti untuk menguji korelasi logisnya. Buktikan mengapa anomali terjadi
            secara matematis dan ilmiah!
          </p>
        </div>

        {/* Progress & Ready for Resolution */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-[#A9B8DF] block">Korelasi Terbukti</span>
            <span className="font-data text-sm font-bold text-[#D9AD75]">
              {unlockedDeductionIds.length} dari {theLastDropCase.connections.length} Hubungan
            </span>
          </div>

          <button
            onClick={onOpenCaseResolution}
            className={`px-5 py-2.5 rounded font-serif-title font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all ${
              unlockedDeductionIds.length >= 2
                ? 'bg-[#D9AD75] text-[#22243D] hover:bg-[#E7DDF5] animate-pulse'
                : 'bg-[#7776A8]/30 text-[#A9B8DF] border border-[#7776A8]/40 hover:text-[#F4EEDC]'
            }`}
          >
            <Award className="w-4 h-4 text-[#D9AD75]" />
            <span>Masuk Sidang Akhir</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Deduction Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: Collected Evidence Cards (6 columns) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-serif-title text-sm sm:text-base font-bold text-[#F4EEDC]">
              Bukti Terkumpul ({collectedEvidenceList.length})
            </h2>
            <button
              onClick={handleResetSelection}
              className="text-xs text-[#A9B8DF] hover:text-[#D9AD75] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pilihan</span>
            </button>
          </div>

          {collectedEvidenceList.length === 0 ? (
            <div className="p-8 rounded-lg border border-[#7776A8]/30 bg-[#22243D] text-center space-y-3">
              <BookOpen className="w-8 h-8 text-[#A9B8DF] mx-auto opacity-50" />
              <p className="text-sm text-[#A9B8DF]">
                Kamu belum mencatat bukti apapun dari lokasi investigasi.
              </p>
              <button
                onClick={onOpenEvidenceInventory}
                className="px-4 py-2 rounded bg-[#7776A8]/40 text-[#F4EEDC] text-xs font-semibold cursor-pointer"
              >
                Kunjungi Lokasi Investigasi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {collectedEvidenceList.map((ev) => {
                const isSelectedA = selectedEvidenceA === ev.id;
                const isSelectedB = selectedEvidenceB === ev.id;
                const isSelected = isSelectedA || isSelectedB;

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleCardClick(ev.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#7776A8]/40 border-[#D9AD75] shadow-[0_0_15px_rgba(217,173,117,0.3)] ring-1 ring-[#D9AD75]'
                        : 'bg-[#22243D] border-[#7776A8]/30 hover:border-[#7776A8] hover:bg-[#7776A8]/10'
                    }`}
                  >
                    {/* Selection Pill indicator */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-data bg-[#D9AD75] text-[#22243D] font-bold">
                        {isSelectedA ? 'Bukti 1' : 'Bukti 2'}
                      </span>
                    )}

                    <div className="text-[11px] font-data text-[#A9B8DF] mb-1">
                      {ev.category}
                    </div>

                    <h3 className="font-serif-title font-bold text-xs sm:text-sm text-[#F4EEDC] mb-2 pr-12 line-clamp-2">
                      {ev.title}
                    </h3>

                    <p className="text-[11px] font-data text-[#D9AD75] bg-[#22243D]/80 p-1.5 rounded border border-[#7776A8]/30 line-clamp-2">
                      {ev.keyData}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unlocked Deductions Showcase */}
          <div className="mt-4 pt-4 border-t border-[#7776A8]/30">
            <h3 className="text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-2">
              Korelasi yang Telah Terpecahkan:
            </h3>
            <div className="space-y-2">
              {theLastDropCase.connections.map((conn) => {
                const unlocked = isDeductionUnlocked(conn.id);
                return (
                  <div
                    key={conn.id}
                    className={`p-3 rounded border text-xs flex items-center justify-between gap-3 ${
                      unlocked
                        ? 'bg-[#91B9B4]/10 border-[#91B9B4]/40 text-[#F4EEDC]'
                        : 'bg-[#22243D]/60 border-[#7776A8]/20 text-[#A9B8DF]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          unlocked ? 'text-[#91B9B4]' : 'text-[#7776A8]/40'
                        }`}
                      />
                      <span>{conn.relationTitle}</span>
                    </div>
                    <span className="font-data text-[10px] text-[#D9AD75]">
                      {unlocked ? 'Terverifikasi' : 'Terkunci'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Synthesis Workbench (6 columns) */}
        <div className="lg:col-span-6">
          <div className="bg-[#22243D] border border-[#7776A8]/50 rounded-lg p-5 sm:p-7 shadow-xl h-full flex flex-col justify-between">
            {/* Workbench Header */}
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#7776A8]/30 mb-4">
                <span className="text-xs font-data text-[#D9AD75] uppercase tracking-wider">
                  Meja Sintesis Deduksi
                </span>
                <span className="text-xs text-[#A9B8DF]">
                  {selectedEvidenceA && selectedEvidenceB ? '2 Bukti Terpilih' : 'Menunggu Pilihan'}
                </span>
              </div>

              {/* Slot Displays for Selected Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div
                  className={`p-3 rounded border text-left min-h-[70px] flex flex-col justify-center ${
                    selectedEvidenceA
                      ? 'bg-[#7776A8]/30 border-[#D9AD75]'
                      : 'bg-[#22243D]/60 border-dashed border-[#7776A8]/40 text-[#A9B8DF]'
                  }`}
                >
                  <span className="text-[10px] font-data text-[#D9AD75] uppercase block mb-1">
                    Bukti Pertama
                  </span>
                  <span className="font-serif-title font-bold text-xs text-[#F4EEDC] line-clamp-2">
                    {selectedEvidenceA
                      ? theLastDropCase.evidence.find((e) => e.id === selectedEvidenceA)?.title
                      : 'Pilih kartu di kiri'}
                  </span>
                </div>

                <div
                  className={`p-3 rounded border text-left min-h-[70px] flex flex-col justify-center ${
                    selectedEvidenceB
                      ? 'bg-[#7776A8]/30 border-[#D9AD75]'
                      : 'bg-[#22243D]/60 border-dashed border-[#7776A8]/40 text-[#A9B8DF]'
                  }`}
                >
                  <span className="text-[10px] font-data text-[#D9AD75] uppercase block mb-1">
                    Bukti Kedua
                  </span>
                  <span className="font-serif-title font-bold text-xs text-[#F4EEDC] line-clamp-2">
                    {selectedEvidenceB
                      ? theLastDropCase.evidence.find((e) => e.id === selectedEvidenceB)?.title
                      : 'Pilih kartu di kiri'}
                  </span>
                </div>
              </div>

              {/* Connection Interaction Area */}
              {selectedEvidenceA && selectedEvidenceB ? (
                activeConnection ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded bg-[#7776A8]/20 border border-[#7776A8]/40">
                      <h4 className="font-serif-title font-bold text-xs sm:text-sm text-[#D9AD75] mb-1">
                        {activeConnection.relationTitle}
                      </h4>
                      <p className="text-xs text-[#E7DDF5]">
                        Bagaimanakah korelasi logis yang paling tepat antara kedua bukti ini?
                      </p>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-2">
                      {activeConnection.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded border text-xs cursor-pointer transition-all ${
                            selectedOptionId === opt.id
                              ? 'bg-[#D9AD75]/15 border-[#D9AD75] text-[#F4EEDC]'
                              : 'bg-[#22243D] border-[#7776A8]/30 hover:border-[#7776A8] text-[#A9B8DF]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deduction-option"
                            value={opt.id}
                            checked={selectedOptionId === opt.id}
                            onChange={() => {
                              sound.playClick();
                              setSelectedOptionId(opt.id);
                              setFeedbackResult(null);
                            }}
                            className="mt-0.5 text-[#D9AD75] focus:ring-[#D9AD75]"
                          />
                          <span className="leading-relaxed">{opt.text}</span>
                        </label>
                      ))}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmitDeduction}
                      disabled={!selectedOptionId}
                      className={`w-full py-2.5 px-4 rounded font-serif-title font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                        selectedOptionId
                          ? 'bg-[#D9AD75] text-[#22243D] hover:bg-[#E7DDF5]'
                          : 'bg-[#7776A8]/30 text-[#A9B8DF]/50 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Uji Nalar Deduksi</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-[#22243D]/60 border border-[#7776A8]/30 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-[#A9B8DF] mx-auto" />
                    <h4 className="font-serif-title font-bold text-sm text-[#F4EEDC]">
                      Belum Ada Korelasi Langsung
                    </h4>
                    <p className="text-xs text-[#A9B8DF] max-w-sm mx-auto">
                      Kedua bukti ini sah, namun dalam penyelidikan saat ini belum terdapat hubungan
                      langsung yang saling membuktikan. Coba pasangkan dengan bukti lain!
                    </p>
                  </div>
                )
              ) : (
                <div className="py-12 px-4 text-center text-[#A9B8DF] space-y-2">
                  <GitMerge className="w-8 h-8 mx-auto opacity-40 text-[#D9AD75]" />
                  <p className="text-xs sm:text-sm">
                    Silakan klik dua kartu bukti pada kolom sebelah kiri untuk mulai menguji
                    hubungannya.
                  </p>
                </div>
              )}

              {/* Feedback Display */}
              {feedbackResult && (
                <div
                  className={`mt-4 p-4 rounded-lg border text-xs sm:text-sm leading-relaxed animate-fade-in ${
                    feedbackResult.success
                      ? 'bg-[#91B9B4]/20 border-[#91B9B4] text-[#F4EEDC]'
                      : 'bg-[#C8A9C8]/15 border-[#C8A9C8]/60 text-[#E7DDF5]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {feedbackResult.success ? (
                      <CheckCircle className="w-5 h-5 text-[#91B9B4] shrink-0 mt-0.5" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-[#C8A9C8] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold mb-1">
                        {feedbackResult.success ? 'Deduksi Berhasil!' : 'Perlu Dipertimbangkan Kembali'}
                      </p>
                      <p>{feedbackResult.feedback}</p>
                      {feedbackResult.insight && (
                        <p className="mt-2 font-data text-xs text-[#D9AD75]">
                          {feedbackResult.insight}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tip */}
            <div className="pt-4 mt-6 border-t border-[#7776A8]/30 text-[11px] text-[#A9B8DF] flex items-center justify-between">
              <span>Tips: Hubungkan Laporan Konsumsi Air dengan Jadwal Penyiraman.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
