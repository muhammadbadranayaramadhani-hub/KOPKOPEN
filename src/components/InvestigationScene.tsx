import React, { useState } from 'react';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { Hotspot, LocationData } from '../types/game';
import { sound } from '../utils/audio';
import {
  Compass,
  MapPin,
  CheckCircle,
  Search,
  BookOpen,
  HelpCircle,
  X,
  Droplet,
  FileText,
  User,
  Wrench,
  Flower2,
  Gauge,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InvestigationSceneProps {
  currentLocationId: string;
  onSelectLocation: (locId: string) => void;
  inspectedHotspotIds: string[];
  collectedEvidenceIds: string[];
  solvedChallengeIds: string[];
  onInspectHotspot: (hotspotId: string) => void;
  onCollectEvidence: (evidenceId: string) => void;
  onOpenChallenge: (challengeId: string) => void;
  onOpenDeductionBoard: () => void;
  onOpenEvidenceInventory: () => void;
}

export const InvestigationScene: React.FC<InvestigationSceneProps> = ({
  currentLocationId,
  onSelectLocation,
  inspectedHotspotIds,
  collectedEvidenceIds,
  solvedChallengeIds,
  onInspectHotspot,
  onCollectEvidence,
  onOpenChallenge,
  onOpenDeductionBoard,
  onOpenEvidenceInventory,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const currentLocation: LocationData =
    theLastDropCase.locations.find((l) => l.id === currentLocationId) ||
    theLastDropCase.locations[0];

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    onInspectHotspot(hotspot.id);
  };

  const getHotspotIcon = (icon: string) => {
    switch (icon) {
      case 'droplet':
        return <Droplet className="w-4 h-4 text-[#91B9B4]" />;
      case 'clipboard-list':
      case 'book-open':
      case 'file-check':
        return <FileText className="w-4 h-4 text-[#D9AD75]" />;
      case 'flower':
        return <Flower2 className="w-4 h-4 text-[#C8A9C8]" />;
      case 'gauge':
        return <Gauge className="w-4 h-4 text-[#A9B8DF]" />;
      case 'wrench':
        return <Wrench className="w-4 h-4 text-[#A9B8DF]" />;
      case 'user-check':
      case 'user':
        return <User className="w-4 h-4 text-[#E7DDF5]" />;
      default:
        return <Search className="w-4 h-4 text-[#D9AD75]" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] w-full flex flex-col justify-between bg-[#22243D] text-[#F4EEDC]">
      {/* Location Bar & Quick Summary */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Location Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none" role="tablist" aria-label="Pilih Lokasi Investigasi">
          {theLastDropCase.locations.map((loc) => {
            const isActive = loc.id === currentLocation.id;
            const totalHotspots = loc.hotspots.length;
            const inspectedCount = loc.hotspots.filter((h) =>
              inspectedHotspotIds.includes(h.id)
            ).length;

            return (
              <button
                key={loc.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  sound.playClick();
                  onSelectLocation(loc.id);
                  setSelectedHotspot(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#7776A8]/50 text-[#F4EEDC] border border-[#D9AD75] shadow-md'
                    : 'bg-[#22243D]/80 border border-[#7776A8]/30 text-[#A9B8DF] hover:text-[#F4EEDC] hover:bg-[#7776A8]/20'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9AD75]' : 'text-[#A9B8DF]'}`} />
                <span className="font-serif-title">{loc.name}</span>
                <span className="font-data text-[10px] text-[#D9AD75] bg-[#22243D]/60 px-1.5 py-0.5 rounded">
                  {inspectedCount}/{totalHotspots}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEvidenceInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#22243D]/80 border border-[#7776A8]/40 hover:border-[#91B9B4] text-[#A9B8DF] hover:text-[#F4EEDC] transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#91B9B4]" />
            <span>Jurnal ({collectedEvidenceIds.length}/5)</span>
          </button>
          <button
            onClick={onOpenDeductionBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#D9AD75]/20 border border-[#D9AD75]/60 hover:bg-[#D9AD75]/30 text-[#D9AD75] hover:text-[#F4EEDC] transition-all cursor-pointer font-serif-title"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buka Papan Deduksi</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col justify-center">
        <div className="relative w-full aspect-[16/9] max-h-[68vh] rounded-lg overflow-hidden border border-[#7776A8]/40 shadow-2xl bg-[#22243D]">
          {/* Location Scene Backdrop */}
          <img
            src={currentLocation.sceneImage}
            alt={currentLocation.name}
            className="w-full h-full object-cover object-center select-none"
            referrerPolicy="no-referrer"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#22243D]/60 via-transparent to-[#22243D]/30 pointer-events-none" />

          {/* Scene Location Badge */}
          <div className="absolute top-3 left-3 z-10 bg-[#22243D]/85 backdrop-blur-sm border border-[#7776A8]/40 px-3 py-1.5 rounded pointer-events-none">
            <h2 className="font-serif-title font-bold text-xs sm:text-sm text-[#F4EEDC]">
              {currentLocation.name}
            </h2>
            <p className="text-[11px] text-[#A9B8DF]">{currentLocation.subtitle}</p>
          </div>

          {/* Interactive Hotspots Pins */}
          {currentLocation.hotspots.map((hotspot) => {
            const isInspected = inspectedHotspotIds.includes(hotspot.id);
            const isEvidenceCollected =
              hotspot.evidenceId && collectedEvidenceIds.includes(hotspot.evidenceId);

            return (
              <div
                key={hotspot.id}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                <button
                  onClick={() => handleHotspotClick(hotspot)}
                  aria-label={`Periksa ${hotspot.name}`}
                  className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-300 transform group-hover:scale-125 cursor-pointer flex items-center justify-center ${
                    isEvidenceCollected
                      ? 'bg-[#91B9B4] text-[#22243D] ring-2 ring-[#91B9B4]/50'
                      : isInspected
                      ? 'bg-[#7776A8] text-[#F4EEDC] ring-2 ring-[#D9AD75]/50'
                      : 'bg-[#22243D]/90 text-[#D9AD75] border-2 border-[#D9AD75] animate-pulse shadow-[0_0_15px_rgba(217,173,117,0.6)]'
                  }`}
                >
                  {isEvidenceCollected ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#22243D]" />
                  ) : (
                    getHotspotIcon(hotspot.icon)
                  )}

                  {/* Pulsing radar ring for uninspected spots */}
                  {!isInspected && (
                    <span className="absolute -inset-1 rounded-full border border-[#D9AD75] animate-ping pointer-events-none opacity-40" />
                  )}
                </button>

                {/* Hover Label */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden sm:group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
                  <div className="bg-[#22243D]/95 border border-[#7776A8] px-2.5 py-1 rounded shadow-lg text-[11px] text-[#F4EEDC] flex items-center gap-1.5 font-medium">
                    <span>{hotspot.name}</span>
                    {isEvidenceCollected && (
                      <span className="text-[#91B9B4] font-data text-[10px]">(Bukti Terdata)</span>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-[#22243D] border-r border-b border-[#7776A8] transform rotate-45 -mt-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Location Hint Strip */}
        <div className="mt-2 text-center text-xs text-[#A9B8DF]/80">
          <span>Sentuh atau klik pin berkilau di lokasi untuk memeriksa petunjuk, membaca catatan, atau mewawancarai saksi.</span>
        </div>
      </div>

      {/* Inspection Modal / Drawer when a Hotspot is clicked */}
      {selectedHotspot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hotspot-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22243D]/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-lg bg-[#22243D] border border-[#7776A8] rounded-lg shadow-2xl p-5 sm:p-7 text-left overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#7776A8]/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded bg-[#7776A8]/30 border border-[#7776A8]/60 text-[#D9AD75]">
                  {getHotspotIcon(selectedHotspot.icon)}
                </div>
                <div>
                  <h3 id="hotspot-detail-title" className="font-serif-title font-bold text-base sm:text-lg text-[#F4EEDC]">
                    {selectedHotspot.name}
                  </h3>
                  <p className="text-xs text-[#A9B8DF]">{selectedHotspot.shortDesc}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHotspot(null)}
                className="p-1.5 text-[#A9B8DF] hover:text-[#F4EEDC] rounded hover:bg-[#7776A8]/20 cursor-pointer"
                aria-label="Tutup Detail Pemeriksaan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Description */}
            <div className="mb-6 space-y-3">
              <p className="text-sm text-[#E7DDF5] leading-relaxed bg-[#22243D]/60 p-4 rounded border border-[#7776A8]/20">
                {selectedHotspot.detailText}
              </p>
            </div>

            {/* Evidence & Challenge Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* If contains evidence */}
              {selectedHotspot.hasEvidence && selectedHotspot.evidenceId && (
                <div>
                  {collectedEvidenceIds.includes(selectedHotspot.evidenceId) ? (
                    <div className="flex items-center gap-2 p-3 rounded bg-[#91B9B4]/15 border border-[#91B9B4]/40 text-xs text-[#91B9B4]">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Bukti penting ini telah tersimpan rapi dalam Jurnal Buktimu.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedHotspot.evidenceId) {
                          onCollectEvidence(selectedHotspot.evidenceId);
                        }
                      }}
                      className="w-full py-3 px-4 rounded bg-[#D9AD75] text-[#22243D] font-bold text-xs sm:text-sm hover:bg-[#E7DDF5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-serif-title tracking-wider"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Catat Bukti Ini ke Jurnal Detektif</span>
                    </button>
                  )}
                </div>
              )}

              {/* If triggers an educational challenge */}
              {selectedHotspot.triggerChallengeId && (
                <div>
                  {solvedChallengeIds.includes(selectedHotspot.triggerChallengeId) ? (
                    <div className="flex items-center gap-2 p-2.5 rounded bg-[#7776A8]/20 border border-[#7776A8]/40 text-xs text-[#A9B8DF]">
                      <CheckCircle className="w-4 h-4 text-[#91B9B4] shrink-0" />
                      <span>Tantangan pengetahuan di lokasi ini telah terpecahkan (+40 Poin).</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const cid = selectedHotspot.triggerChallengeId;
                        setSelectedHotspot(null);
                        if (cid) onOpenChallenge(cid);
                      }}
                      className="w-full py-2.5 px-4 rounded bg-[#7776A8]/30 border border-[#D9AD75] text-[#F4EEDC] hover:bg-[#7776A8]/50 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-title"
                    >
                      <HelpCircle className="w-4 h-4 text-[#D9AD75]" />
                      <span>Pecahkan Tantangan Pengetahuan Terkait</span>
                    </button>
                  )}
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#A9B8DF] hover:text-[#F4EEDC] cursor-pointer"
                >
                  Kembali ke Eksplorasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
