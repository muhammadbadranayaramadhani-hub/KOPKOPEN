import { CaseResolutionOption, EvidenceConnection } from '../types/game';

export interface WaterMathResult {
  normalLitres: number;
  observedLitres: number;
  differenceLitres: number;
  extraSessions: number;
  litresPerSession: number;
  calculatedSessionTotalLitres: number;
  isFullyExplainedBySessions: boolean;
  unexplainedVarianceLitres: number;
}

export function calculateWaterMetrics(
  normalLitres: number,
  observedLitres: number,
  extraSessions: number,
  litresPerSession: number
): WaterMathResult {
  const differenceLitres = observedLitres - normalLitres;
  const calculatedSessionTotalLitres = extraSessions * litresPerSession;
  const unexplainedVarianceLitres = Math.abs(differenceLitres - calculatedSessionTotalLitres);
  const isFullyExplainedBySessions = unexplainedVarianceLitres === 0;

  return {
    normalLitres,
    observedLitres,
    differenceLitres,
    extraSessions,
    litresPerSession,
    calculatedSessionTotalLitres,
    isFullyExplainedBySessions,
    unexplainedVarianceLitres,
  };
}

export interface DeductionValidationResult {
  isValid: boolean;
  isCorrectOption: boolean;
  feedback: string;
  unlockedInsight?: string;
}

export function validateDeductionLink(
  evidenceAId: string,
  evidenceBId: string,
  selectedOptionId: string,
  connection: EvidenceConnection
): DeductionValidationResult {
  // Check if connection matches the pair (order-independent)
  const isPairMatch =
    (connection.evidenceA === evidenceAId && connection.evidenceB === evidenceBId) ||
    (connection.evidenceA === evidenceBId && connection.evidenceB === evidenceAId);

  if (!isPairMatch) {
    return {
      isValid: false,
      isCorrectOption: false,
      feedback: 'Kedua bukti ini belum memiliki hubungan langsung yang terkonfirmasi dalam catatan investigasi saat ini.',
    };
  }

  const option = connection.options.find((opt) => opt.id === selectedOptionId);
  if (!option) {
    return {
      isValid: true,
      isCorrectOption: false,
      feedback: 'Pilihan hubungan tidak valid.',
    };
  }

  return {
    isValid: true,
    isCorrectOption: option.isCorrect,
    feedback: option.feedback,
    unlockedInsight: option.isCorrect ? connection.unlockedInsight : undefined,
  };
}

export interface CaseEvaluationResult {
  isCorrect: boolean;
  title: string;
  feedback: string;
  pointsEarned: number;
  supportingEvidenceValid: boolean;
  missingEvidenceTitles: string[];
}

export function evaluateCaseConclusion(
  selectedHypothesisId: string,
  selectedSupportingEvidenceIds: string[],
  resolutions: CaseResolutionOption[],
  allEvidenceTitlesMap: Record<string, string>
): CaseEvaluationResult {
  const chosenResolution = resolutions.find((r) => r.id === selectedHypothesisId);
  if (!chosenResolution) {
    return {
      isCorrect: false,
      title: 'Hipotesis Tidak Dikenal',
      feedback: 'Silakan pilih salah satu hipotesis yang tersedia.',
      pointsEarned: 0,
      supportingEvidenceValid: false,
      missingEvidenceTitles: [],
    };
  }

  // Check required evidence
  const missingEvidenceIds = chosenResolution.requiredEvidenceIds.filter(
    (reqId) => !selectedSupportingEvidenceIds.includes(reqId)
  );

  const missingEvidenceTitles = missingEvidenceIds.map(
    (id) => allEvidenceTitlesMap[id] || id
  );

  const supportingEvidenceValid = missingEvidenceIds.length === 0;

  if (chosenResolution.isCorrect && supportingEvidenceValid) {
    return {
      isCorrect: true,
      title: chosenResolution.title,
      feedback: chosenResolution.feedback,
      pointsEarned: 150,
      supportingEvidenceValid: true,
      missingEvidenceTitles: [],
    };
  } else if (chosenResolution.isCorrect && !supportingEvidenceValid) {
    return {
      isCorrect: false,
      title: chosenResolution.title,
      feedback: `Hipotesismu sudah mengarah ke kebenaran, namun bukti pendukung yang kamu sertakan masih kurang lengkap. Kamu belum menyertakan: ${missingEvidenceTitles.join(', ')}. Tinjau kembali bukti-bukti di jurnalmu!`,
      pointsEarned: 30,
      supportingEvidenceValid: false,
      missingEvidenceTitles,
    };
  } else {
    return {
      isCorrect: false,
      title: chosenResolution.title,
      feedback: chosenResolution.feedback,
      pointsEarned: 10,
      supportingEvidenceValid,
      missingEvidenceTitles,
    };
  }
}

export function computeInvestigatorRank(points: number): {
  rank: string;
  nextRankAt: number;
  progressPercent: number;
} {
  if (points < 100) {
    return {
      rank: 'Novis Pengarsip (Grade VII)',
      nextRankAt: 100,
      progressPercent: Math.min(100, Math.round((points / 100) * 100)),
    };
  } else if (points < 250) {
    return {
      rank: 'Penyelidik Muda (Grade VIII)',
      nextRankAt: 250,
      progressPercent: Math.min(100, Math.round(((points - 100) / 150) * 100)),
    };
  } else if (points < 450) {
    return {
      rank: 'Detektif Madya (Grade IX)',
      nextRankAt: 450,
      progressPercent: Math.min(100, Math.round(((points - 250) / 200) * 100)),
    };
  } else {
    return {
      rank: 'Master Arkivis Akademi',
      nextRankAt: 600,
      progressPercent: 100,
    };
  }
}
