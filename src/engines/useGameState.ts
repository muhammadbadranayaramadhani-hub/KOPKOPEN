import { useState, useEffect, useCallback } from 'react';
import { GameScreen, PlayerProgress } from '../types/game';
import { theLastDropCase } from '../data/cases/theLastDrop';
import { ALL_BADGES } from '../data/badges';
import { sound } from '../utils/audio';
import {
  computeInvestigatorRank,
  evaluateCaseConclusion,
  validateDeductionLink,
  CaseEvaluationResult,
} from './DeductionEngine';

const STORAGE_KEY = 'mysteria_investigator_save_v1';

const defaultProgress: PlayerProgress = {
  investigatorName: 'Detektif Muda',
  rank: 'Novis Pengarsip (Grade VII)',
  knowledgePoints: 0,
  completedCases: [],
  collectedEvidenceIds: [],
  solvedChallengeIds: [],
  unlockedDeductionIds: [],
  badges: [],
  activeCaseId: 'the-last-drop',
  currentLocationId: 'garden',
  inspectedHotspotIds: [],
  caseResolved: false,
  soundEnabled: true,
};

export function useGameState() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MAIN_MENU');
  const [activeDialogueId, setActiveDialogueId] = useState<string>('intro-1');
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [inspectedHotspotId, setInspectedHotspotId] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<{ message: string; type: 'success' | 'info' | 'award' } | null>(null);

  // Load progress from localStorage or default
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultProgress, ...parsed };
      }
    } catch {
      // ignore
    }
    return defaultProgress;
  });

  // Check URL parameters (e.g. ?autostart=1 skips straight to investigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        setCurrentScreen('INVESTIGATION');
      }
    }
  }, []);

  // Sync sound settings with audio utility
  useEffect(() => {
    sound.setMuted(!progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Save to localStorage whenever progress updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'award' = 'info') => {
    setLastNotification({ message, type });
    setTimeout(() => {
      setLastNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const awardBadge = useCallback((badgeId: string) => {
    setProgress((prev) => {
      if (prev.badges.includes(badgeId)) return prev;
      const badgeData = ALL_BADGES.find((b) => b.id === badgeId);
      if (badgeData) {
        sound.playSuccess();
        showToast(`Lencana Terbuka: "${badgeData.title}"!`, 'award');
      }
      return {
        ...prev,
        badges: [...prev.badges, badgeId],
      };
    });
  }, [showToast]);

  const addKnowledgePoints = useCallback((pts: number, reason?: string) => {
    setProgress((prev) => {
      const newPoints = prev.knowledgePoints + pts;
      const { rank: newRank } = computeInvestigatorRank(newPoints);
      if (newRank !== prev.rank) {
        showToast(`Kenaikan Pangkat Penyelidik: ${newRank}!`, 'award');
      }
      if (reason) {
        showToast(`+${pts} Poin Pengetahuan (${reason})`, 'success');
      }
      return {
        ...prev,
        knowledgePoints: newPoints,
        rank: newRank,
      };
    });
  }, [showToast]);

  const startNewInvestigation = useCallback((name?: string) => {
    sound.playClick();
    setProgress((prev) => ({
      ...prev,
      investigatorName: name && name.trim().length > 0 ? name.trim() : 'Detektif Muda',
      collectedEvidenceIds: [],
      solvedChallengeIds: [],
      unlockedDeductionIds: [],
      inspectedHotspotIds: [],
      caseResolved: false,
      finalHypothesisId: undefined,
      currentLocationId: 'garden',
    }));
    setActiveDialogueId('intro-1');
    setCurrentScreen('INTRO_STORY');
  }, []);

  const continueStory = useCallback(() => {
    sound.playClick();
    if (progress.caseResolved) {
      setCurrentScreen('CASE_RESOLUTION');
    } else if (progress.collectedEvidenceIds.length > 0) {
      setCurrentScreen('INVESTIGATION');
    } else {
      setActiveDialogueId('intro-1');
      setCurrentScreen('INTRO_STORY');
    }
  }, [progress]);

  const inspectHotspot = useCallback((hotspotId: string) => {
    sound.playPageTurn();
    setInspectedHotspotId(hotspotId);
    setProgress((prev) => {
      if (!prev.inspectedHotspotIds.includes(hotspotId)) {
        return {
          ...prev,
          inspectedHotspotIds: [...prev.inspectedHotspotIds, hotspotId],
        };
      }
      return prev;
    });
  }, []);

  const collectEvidence = useCallback((evidenceId: string) => {
    const evidenceItem = theLastDropCase.evidence.find((e) => e.id === evidenceId);
    if (!evidenceItem) return;

    setProgress((prev) => {
      if (prev.collectedEvidenceIds.includes(evidenceId)) return prev;

      sound.playClueFound();
      showToast(`Bukti Baru Dicatat: "${evidenceItem.title}"`, 'success');

      const updated = [...prev.collectedEvidenceIds, evidenceId];
      if (updated.length === 1) {
        awardBadge('badge-first-clue');
      }
      if (updated.length === theLastDropCase.evidence.length) {
        awardBadge('badge-all-evidence');
      }

      return {
        ...prev,
        collectedEvidenceIds: updated,
      };
    });
    addKnowledgePoints(25, 'Bukti Ditemukan');
  }, [awardBadge, addKnowledgePoints, showToast]);

  const solveChallenge = useCallback((challengeId: string) => {
    setProgress((prev) => {
      if (prev.solvedChallengeIds.includes(challengeId)) return prev;

      sound.playSuccess();
      const updated = [...prev.solvedChallengeIds, challengeId];

      if (challengeId.startsWith('challenge-math')) {
        awardBadge('badge-math-whiz');
      } else if (challengeId === 'challenge-ipa') {
        awardBadge('badge-science-mind');
      }

      return {
        ...prev,
        solvedChallengeIds: updated,
      };
    });
    addKnowledgePoints(40, 'Tantangan Terpecahkan');
  }, [awardBadge, addKnowledgePoints]);

  const makeDeduction = useCallback(
    (evidenceAId: string, evidenceBId: string, selectedOptionId: string) => {
      const connection = theLastDropCase.connections.find(
        (c) =>
          (c.evidenceA === evidenceAId && c.evidenceB === evidenceBId) ||
          (c.evidenceA === evidenceBId && c.evidenceB === evidenceAId)
      );

      if (!connection) {
        sound.playFailure();
        return {
          success: false,
          feedback: 'Kedua bukti ini belum memiliki korelasi langsung dalam catatan.',
        };
      }

      const result = validateDeductionLink(
        evidenceAId,
        evidenceBId,
        selectedOptionId,
        connection
      );

      if (result.isCorrectOption) {
        sound.playSuccess();
        setProgress((prev) => {
          if (prev.unlockedDeductionIds.includes(connection.id)) return prev;
          const updated = [...prev.unlockedDeductionIds, connection.id];
          if (updated.length >= 2) {
            awardBadge('badge-deduction-master');
          }
          return {
            ...prev,
            unlockedDeductionIds: updated,
          };
        });
        addKnowledgePoints(50, 'Korelasi Deduksi Terbukti');
        showToast(result.feedback, 'success');
        return {
          success: true,
          feedback: result.feedback,
          insight: result.unlockedInsight,
        };
      } else {
        sound.playFailure();
        return {
          success: false,
          feedback: result.feedback,
        };
      }
    },
    [awardBadge, addKnowledgePoints, showToast]
  );

  const submitFinalCaseHypothesis = useCallback(
    (hypothesisId: string, supportingEvidenceIds: string[]): CaseEvaluationResult => {
      const titlesMap: Record<string, string> = {};
      theLastDropCase.evidence.forEach((e) => {
        titlesMap[e.id] = e.title;
      });

      const evaluation = evaluateCaseConclusion(
        hypothesisId,
        supportingEvidenceIds,
        theLastDropCase.resolutions,
        titlesMap
      );

      if (evaluation.isCorrect) {
        sound.playSuccess();
        awardBadge('badge-case-closed');
        addKnowledgePoints(evaluation.pointsEarned, 'Kasus MYS-001 Terselesaikan');
        setProgress((prev) => ({
          ...prev,
          caseResolved: true,
          finalHypothesisId: hypothesisId,
          completedCases: prev.completedCases.includes('the-last-drop')
            ? prev.completedCases
            : [...prev.completedCases, 'the-last-drop'],
        }));
      } else {
        sound.playFailure();
      }

      return evaluation;
    },
    [awardBadge, addKnowledgePoints]
  );

  const toggleSound = useCallback(() => {
    setProgress((prev) => {
      const next = !prev.soundEnabled;
      sound.setMuted(!next);
      return { ...prev, soundEnabled: next };
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setProgress(defaultProgress);
    setCurrentScreen('MAIN_MENU');
    showToast('Seluruh progres penyelidikan telah diatur ulang.', 'info');
  }, [showToast]);

  return {
    currentScreen,
    setCurrentScreen,
    progress,
    activeDialogueId,
    setActiveDialogueId,
    activeChallengeId,
    setActiveChallengeId,
    inspectedHotspotId,
    setInspectedHotspotId,
    lastNotification,
    showToast,
    startNewInvestigation,
    continueStory,
    inspectHotspot,
    collectEvidence,
    solveChallenge,
    makeDeduction,
    submitFinalCaseHypothesis,
    toggleSound,
    resetAllProgress,
  };
}
