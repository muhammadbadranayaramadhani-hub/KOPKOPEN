/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameState } from './engines/useGameState';
import { TopNavigation } from './components/TopNavigation';
import { MainMenu } from './components/MainMenu';
import { IntroDialogue } from './components/IntroDialogue';
import { InvestigationScene } from './components/InvestigationScene';
import { EvidenceInventory } from './components/EvidenceInventory';
import { DeductionBoard } from './components/DeductionBoard';
import { KnowledgeChallengeModal } from './components/KnowledgeChallengeModal';
import { CaseResolution } from './components/CaseResolution';
import { CaseArchiveModal } from './components/CaseArchiveModal';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles, CheckCircle, Award } from 'lucide-react';

export default function App() {
  const {
    currentScreen,
    setCurrentScreen,
    progress,
    activeDialogueId,
    setActiveDialogueId,
    activeChallengeId,
    setActiveChallengeId,
    lastNotification,
    startNewInvestigation,
    continueStory,
    inspectHotspot,
    collectEvidence,
    solveChallenge,
    makeDeduction,
    submitFinalCaseHypothesis,
    toggleSound,
    resetAllProgress,
  } = useGameState();

  const [currentLocationId, setCurrentLocationId] = useState<string>('garden');
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#22243D] text-[#F4EEDC] flex flex-col font-sans selection:bg-[#7776A8] selection:text-[#F4EEDC]">
      {/* Toast Notification Banner */}
      {lastNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 animate-bounce max-w-md w-full px-4"
        >
          <div
            className={`py-2.5 px-4 rounded-lg shadow-2xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 backdrop-blur-md ${
              lastNotification.type === 'award'
                ? 'bg-[#D9AD75]/90 border-[#F4EEDC] text-[#22243D] font-bold'
                : lastNotification.type === 'success'
                ? 'bg-[#91B9B4]/90 border-[#F4EEDC] text-[#22243D] font-bold'
                : 'bg-[#22243D]/95 border-[#7776A8] text-[#F4EEDC]'
            }`}
          >
            {lastNotification.type === 'award' ? (
              <Award className="w-4 h-4 shrink-0" />
            ) : lastNotification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 text-[#D9AD75]" />
            )}
            <span className="flex-1">{lastNotification.message}</span>
          </div>
        </div>
      )}

      {/* Top Bar (visible on all screens except MAIN_MENU) */}
      <TopNavigation
        currentScreen={currentScreen}
        setCurrentScreen={(screen) => {
          if (screen === 'CASE_ARCHIVE') {
            setShowArchiveModal(true);
          } else if (screen === 'SETTINGS') {
            setShowSettingsModal(true);
          } else {
            setCurrentScreen(screen);
          }
        }}
        progress={progress}
        toggleSound={toggleSound}
      />

      {/* Main Viewport Router */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'MAIN_MENU' && (
          <MainMenu
            onStartNew={(name) => startNewInvestigation(name)}
            onContinue={continueStory}
            onOpenArchive={() => setShowArchiveModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            progress={progress}
            toggleSound={toggleSound}
          />
        )}

        {currentScreen === 'INTRO_STORY' && (
          <IntroDialogue
            activeNodeId={activeDialogueId}
            setActiveNodeId={setActiveDialogueId}
            onFinishIntro={() => setCurrentScreen('INVESTIGATION')}
            investigatorName={progress.investigatorName}
          />
        )}

        {currentScreen === 'INVESTIGATION' && (
          <InvestigationScene
            currentLocationId={currentLocationId}
            onSelectLocation={setCurrentLocationId}
            inspectedHotspotIds={progress.inspectedHotspotIds}
            collectedEvidenceIds={progress.collectedEvidenceIds}
            solvedChallengeIds={progress.solvedChallengeIds}
            onInspectHotspot={inspectHotspot}
            onCollectEvidence={collectEvidence}
            onOpenChallenge={(cid) => setActiveChallengeId(cid)}
            onOpenDeductionBoard={() => setCurrentScreen('DEDUCTION_BOARD')}
            onOpenEvidenceInventory={() => setCurrentScreen('EVIDENCE_INVENTORY')}
          />
        )}

        {currentScreen === 'EVIDENCE_INVENTORY' && (
          <EvidenceInventory
            collectedEvidenceIds={progress.collectedEvidenceIds}
            onOpenDeductionBoard={() => setCurrentScreen('DEDUCTION_BOARD')}
            onNavigateToLocation={(locId) => {
              setCurrentLocationId(locId);
              setCurrentScreen('INVESTIGATION');
            }}
          />
        )}

        {currentScreen === 'DEDUCTION_BOARD' && (
          <DeductionBoard
            collectedEvidenceIds={progress.collectedEvidenceIds}
            unlockedDeductionIds={progress.unlockedDeductionIds}
            onMakeDeduction={makeDeduction}
            onOpenEvidenceInventory={() => setCurrentScreen('EVIDENCE_INVENTORY')}
            onOpenCaseResolution={() => setCurrentScreen('CASE_RESOLUTION')}
          />
        )}

        {currentScreen === 'CASE_RESOLUTION' && (
          <CaseResolution
            progress={progress}
            onSubmitHypothesis={submitFinalCaseHypothesis}
            onReturnToMainMenu={() => setCurrentScreen('MAIN_MENU')}
            onOpenInvestigation={() => setCurrentScreen('INVESTIGATION')}
          />
        )}
      </main>

      {/* Interactive Modals */}
      {activeChallengeId && (
        <KnowledgeChallengeModal
          challengeId={activeChallengeId}
          onClose={() => setActiveChallengeId(null)}
          onSolveChallenge={solveChallenge}
          isAlreadySolved={progress.solvedChallengeIds.includes(activeChallengeId)}
        />
      )}

      {showArchiveModal && (
        <CaseArchiveModal
          progress={progress}
          onClose={() => setShowArchiveModal(false)}
          onPlayCase={(code) => {
            setShowArchiveModal(false);
            if (code === 'MYS-001') {
              startNewInvestigation();
            }
          }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          progress={progress}
          onClose={() => setShowSettingsModal(false)}
          onToggleSound={toggleSound}
          onResetProgress={resetAllProgress}
        />
      )}
    </div>
  );
}
