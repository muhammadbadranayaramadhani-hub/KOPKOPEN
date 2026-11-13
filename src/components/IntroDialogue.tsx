import React, { useState } from 'react';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { sound } from '../utils/audio';
import { ChevronRight, Sparkles, Compass } from 'lucide-react';

interface IntroDialogueProps {
  activeNodeId: string;
  setActiveNodeId: (nodeId: string) => void;
  onFinishIntro: () => void;
  investigatorName: string;
}

export const IntroDialogue: React.FC<IntroDialogueProps> = ({
  activeNodeId,
  setActiveNodeId,
  onFinishIntro,
  investigatorName,
}) => {
  const [selectedChoiceImpact, setSelectedChoiceImpact] = useState<string | null>(null);

  const currentNode = theLastDropCase.dialogues[activeNodeId] || theLastDropCase.dialogues['intro-1'];

  const handleNext = () => {
    sound.playPageTurn();
    setSelectedChoiceImpact(null);
    if (currentNode.nextNodeId === 'intro-end' || !currentNode.nextNodeId) {
      onFinishIntro();
    } else {
      setActiveNodeId(currentNode.nextNodeId);
    }
  };

  const handleChoice = (nextNodeId: string, impactText?: string) => {
    sound.playClick();
    if (impactText) {
      setSelectedChoiceImpact(impactText);
    }
    if (nextNodeId === 'intro-end') {
      onFinishIntro();
    } else {
      setActiveNodeId(nextNodeId);
    }
  };

  // Replace placeholder with investigator's name if needed
  const dialogueText = currentNode.text.replace('{name}', investigatorName);

  return (
    <div className="relative min-h-[calc(100vh-60px)] w-full flex flex-col justify-between bg-[#22243D] text-[#F4EEDC] overflow-hidden">
      {/* Background with moody archival library */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/mysteria_archive_hall_1793849661193.jpg"
          alt="Latar Ruang Arsip Misterius"
          className="w-full h-full object-cover object-center filter brightness-50 contrast-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#22243D] via-[#22243D]/70 to-[#22243D]/40" />
      </div>

      {/* Top Narrative Context Header */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-data text-[#D9AD75]">
          <Sparkles className="w-4 h-4" />
          <span>Prolog Investigasi: Masuknya Berkas MYS-001</span>
        </div>

        <button
          onClick={onFinishIntro}
          className="text-xs font-semibold text-[#A9B8DF] hover:text-[#F4EEDC] px-3 py-1.5 rounded bg-[#22243D]/80 border border-[#7776A8]/40 hover:border-[#D9AD75] transition-all cursor-pointer"
        >
          Lewati Prolog →
        </button>
      </div>

      {/* Character Center Stage */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 flex-1 flex flex-col justify-end items-center pb-4">
        {/* Aria Character Portrait with soft shadow and glow */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 -mb-6 pointer-events-none select-none">
          <img
            src={currentNode.portrait}
            alt={currentNode.speaker}
            className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(34,36,61,0.9)] animate-fade-in"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Visual Novel Dialogue Box */}
        <div className="relative w-full max-w-4xl bg-[#22243D]/95 border border-[#7776A8]/50 rounded-lg p-5 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Speaker Badge */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-[#7776A8]/30">
            <div className="flex items-center gap-2">
              <span className="font-serif-title font-bold text-base sm:text-lg text-[#D9AD75] tracking-wider">
                {currentNode.speaker}
              </span>
              <span className="text-xs text-[#A9B8DF]">· {currentNode.speakerTitle}</span>
            </div>
            <span className="text-[11px] font-data text-[#A9B8DF]/70">
              Penyelidik: {investigatorName}
            </span>
          </div>

          {/* Dialogue Text */}
          <div className="min-h-[72px] sm:min-h-[80px] flex items-center mb-5">
            <p className="text-sm sm:text-base text-[#F4EEDC] leading-relaxed">
              {dialogueText}
            </p>
          </div>

          {/* Impact Banner if choice was made */}
          {selectedChoiceImpact && (
            <div className="mb-4 px-3 py-1.5 bg-[#91B9B4]/15 border border-[#91B9B4]/40 rounded text-xs text-[#91B9B4] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{selectedChoiceImpact}</span>
            </div>
          )}

          {/* Branching Choices or Next Button */}
          {currentNode.choices && currentNode.choices.length > 0 ? (
            <div className="flex flex-col gap-2 pt-2">
              {currentNode.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice.nextNodeId, choice.impactText)}
                  className="w-full text-left px-4 py-3 rounded bg-[#22243D] border border-[#7776A8]/60 hover:border-[#D9AD75] hover:bg-[#7776A8]/20 transition-all text-xs sm:text-sm text-[#E7DDF5] flex items-center justify-between group cursor-pointer"
                >
                  <span>{choice.text}</span>
                  <ChevronRight className="w-4 h-4 text-[#D9AD75] group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded bg-[#D9AD75] text-[#22243D] font-bold text-xs sm:text-sm hover:bg-[#E7DDF5] transition-all flex items-center gap-2 cursor-pointer shadow-md font-serif-title tracking-wider"
              >
                <span>{currentNode.nextNodeId === 'intro-end' ? 'Mulai Eksplorasi Lokasi' : 'Lanjutkan'}</span>
                {currentNode.nextNodeId === 'intro-end' ? (
                  <Compass className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
