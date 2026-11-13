import React, { useState } from 'react';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { EvidenceItem } from '../types/game';
import { sound } from '../utils/audio';
import {
  BookOpen,
  Search,
  Lock,
  CheckCircle,
  FileText,
  MapPin,
  GitMerge,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface EvidenceInventoryProps {
  collectedEvidenceIds: string[];
  onOpenDeductionBoard: () => void;
  onNavigateToLocation: (locationId: string) => void;
}

export const EvidenceInventory: React.FC<EvidenceInventoryProps> = ({
  collectedEvidenceIds,
  onOpenDeductionBoard,
  onNavigateToLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [activeEvidenceId, setActiveEvidenceId] = useState<string>(
    collectedEvidenceIds[0] || theLastDropCase.evidence[0].id
  );

  const categories = ['SEMUA', 'Dokumen', 'Observasi', 'Kesaksian', 'Fisik'];

  const filteredEvidence = theLastDropCase.evidence.filter((e) => {
    if (selectedCategory === 'SEMUA') return true;
    return e.category === selectedCategory;
  });

  const activeEvidence: EvidenceItem | undefined = theLastDropCase.evidence.find(
    (e) => e.id === activeEvidenceId
  );

  const isCollected = (id: string) => collectedEvidenceIds.includes(id);

  return (
    <div className="min-h-[calc(100vh-60px)] w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Journal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#7776A8]/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Jurnal Penyelidik Kasus MYS-001</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#F4EEDC]">
            Koleksi Bukti & Berkas Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-[#A9B8DF] mt-1">
            Catatan bukti terverifikasi untuk menyusun deduksi logis. Terkumpul{' '}
            <span className="font-bold text-[#D9AD75]">
              {collectedEvidenceIds.length} dari {theLastDropCase.evidence.length}
            </span>{' '}
            bukti utama.
          </p>
        </div>

        {/* Action Button to Deduction Board */}
        <button
          onClick={onOpenDeductionBoard}
          className="self-start md:self-center px-5 py-2.5 rounded bg-[#D9AD75] text-[#22243D] hover:bg-[#E7DDF5] transition-all font-serif-title font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
        >
          <GitMerge className="w-4 h-4" />
          <span>Buka Papan Deduksi ({collectedEvidenceIds.length} Bukti Siap)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#7776A8]/60 text-[#F4EEDC] border border-[#D9AD75]'
                  : 'bg-[#22243D] border border-[#7776A8]/30 text-[#A9B8DF] hover:text-[#F4EEDC]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Journal Layout: Split Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: List of Evidence Cards (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredEvidence.map((ev) => {
            const collected = isCollected(ev.id);
            const isSelected = activeEvidenceId === ev.id;

            return (
              <div
                key={ev.id}
                onClick={() => {
                  sound.playPageTurn();
                  setActiveEvidenceId(ev.id);
                }}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#7776A8]/30 border-[#D9AD75] shadow-md'
                    : 'bg-[#22243D] border-[#7776A8]/30 hover:border-[#7776A8] hover:bg-[#7776A8]/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A9B8DF] font-data">
                      {ev.category}
                    </span>
                    <span className="text-[#7776A8] text-xs">·</span>
                    <span className="text-xs text-[#91B9B4] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ev.locationSource.split('(')[0].trim()}
                    </span>
                  </div>

                  {collected ? (
                    <span className="text-[11px] font-data text-[#91B9B4] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Tercatat
                    </span>
                  ) : (
                    <span className="text-[11px] font-data text-[#C8A9C8] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Belum Dicatat
                    </span>
                  )}
                </div>

                <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#F4EEDC] mb-1">
                  {collected ? ev.title : `Berkas Misterius #${theLastDropCase.evidence.indexOf(ev) + 1}`}
                </h3>

                <p className="text-xs text-[#A9B8DF] line-clamp-2">
                  {collected
                    ? ev.description
                    : `Petunjuk ini berada di ${ev.locationSource}. Kunjungi lokasi untuk mencatatnya.`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Evidence Dossier (7 columns) */}
        <div className="lg:col-span-7">
          {activeEvidence ? (
            <div className="bg-[#22243D] border border-[#7776A8]/50 rounded-lg p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full">
              <div>
                {/* Dossier Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#7776A8]/30 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-1">
                      <span>Kategori: {activeEvidence.category}</span>
                      <span className="text-[#7776A8]">·</span>
                      <span>Kasus MYS-001</span>
                    </div>
                    <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#F4EEDC]">
                      {isCollected(activeEvidence.id)
                        ? activeEvidence.title
                        : 'Bukti Belum Ditemukan'}
                    </h2>
                  </div>

                  <div className="p-3 rounded-lg bg-[#7776A8]/20 border border-[#7776A8]/40 text-[#D9AD75]">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                {/* Dossier Body */}
                {isCollected(activeEvidence.id) ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-data text-[#A9B8DF] uppercase tracking-wider mb-2">
                        Deskripsi Penemuan & Lokasi
                      </h4>
                      <p className="text-sm text-[#E7DDF5] leading-relaxed bg-[#22243D]/60 p-4 rounded border border-[#7776A8]/20">
                        {activeEvidence.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-data text-[#D9AD75] uppercase tracking-wider mb-2">
                        Data Kunci & Fakta Kuantitatif
                      </h4>
                      <div className="p-4 rounded-lg bg-[#22243D] border border-[#D9AD75]/60 text-sm font-data text-[#F4EEDC] shadow-inner">
                        {activeEvidence.keyData}
                      </div>
                    </div>

                    <div className="text-xs text-[#A9B8DF] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#91B9B4]" />
                      <span>Sumber Penyelidikan: {activeEvidence.locationSource}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#7776A8]/20 flex items-center justify-center mx-auto text-[#C8A9C8]">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-title text-lg font-bold text-[#F4EEDC]">
                      Bukti ini Belum Tercatat dalam Jurnal
                    </h3>
                    <p className="text-sm text-[#A9B8DF] max-w-md mx-auto">
                      Kamu belum memeriksa objek ini di lapangan. Silakan kunjungi{' '}
                      <span className="text-[#D9AD75] font-semibold">
                        {activeEvidence.locationSource}
                      </span>{' '}
                      pada layar Investigasi dan periksa titik temuan terkait.
                    </p>
                    <button
                      onClick={() => {
                        const locId = activeEvidence.id.includes('garden')
                          ? 'garden'
                          : activeEvidence.id.includes('witness')
                          ? 'hallway'
                          : 'maintenance';
                        onNavigateToLocation(locId);
                      }}
                      className="px-5 py-2.5 rounded bg-[#7776A8]/40 border border-[#D9AD75] text-[#F4EEDC] hover:bg-[#7776A8]/70 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer font-serif-title"
                    >
                      <MapPin className="w-4 h-4 text-[#D9AD75]" />
                      <span>Kunjungi Lokasi Sekarang</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              {isCollected(activeEvidence.id) && (
                <div className="pt-6 mt-6 border-t border-[#7776A8]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#91B9B4] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Dapat dihubungkan dengan bukti lain di Papan Deduksi.</span>
                  </div>

                  <button
                    onClick={onOpenDeductionBoard}
                    className="w-full sm:w-auto px-4 py-2 rounded bg-[#7776A8]/30 border border-[#D9AD75] text-[#F4EEDC] hover:bg-[#7776A8]/60 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-title"
                  >
                    <GitMerge className="w-4 h-4 text-[#D9AD75]" />
                    <span>Gunakan di Papan Deduksi</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#22243D] border border-[#7776A8]/30 rounded-lg p-12 text-center text-[#A9B8DF]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Pilih salah satu bukti di sisi kiri untuk membaca telaah berkas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
