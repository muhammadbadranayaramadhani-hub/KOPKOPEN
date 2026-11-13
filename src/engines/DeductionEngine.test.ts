import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWaterMetrics,
  validateDeductionLink,
  evaluateCaseConclusion,
  computeInvestigatorRank,
} from './DeductionEngine';
import { CaseResolutionOption, EvidenceConnection } from '../types/game';

test('calculateWaterMetrics computes exact 360L difference for Case MYS-001', () => {
  const result = calculateWaterMetrics(1200, 1560, 2, 180);
  assert.equal(result.differenceLitres, 360);
  assert.equal(result.calculatedSessionTotalLitres, 360);
  assert.equal(result.isFullyExplainedBySessions, true);
  assert.equal(result.unexplainedVarianceLitres, 0);
});

test('calculateWaterMetrics detects discrepancies when numbers do not match', () => {
  const result = calculateWaterMetrics(1200, 1600, 2, 180);
  assert.equal(result.differenceLitres, 400);
  assert.equal(result.calculatedSessionTotalLitres, 360);
  assert.equal(result.isFullyExplainedBySessions, false);
  assert.equal(result.unexplainedVarianceLitres, 40);
});

test('validateDeductionLink returns correct feedback on valid pair and correct choice', () => {
  const mockConnection: EvidenceConnection = {
    id: 'conn-water-garden',
    evidenceA: 'ev-water-report',
    evidenceB: 'ev-garden-schedule',
    relationTitle: 'Analisis Peningkatan Konsumsi vs Sesi Tambahan',
    options: [
      {
        id: 'opt-exact-match',
        text: 'Selisih 360 liter persis sama dengan 2 sesi x 180 liter penyiraman.',
        isCorrect: true,
        feedback: 'Tepat sekali! Selisih konsumsi air 360 liter terjawab sempurna.',
      },
      {
        id: 'opt-coincidence',
        text: 'Keduanya hanya kebetulan dan tidak berkaitan.',
        isCorrect: false,
        feedback: 'Kurang tepat. Angka 360 liter berhubungan erat dengan jadwal.',
      },
    ],
    deductionExplanation: 'Kenaikan 360L berasal dari 2 sesi penyiraman ekstra.',
    unlockedInsight: 'Insight terbuka: Angka konsumsi air tidak mengindikasikan kebocoran.',
  };

  // Test forward match
  const res1 = validateDeductionLink('ev-water-report', 'ev-garden-schedule', 'opt-exact-match', mockConnection);
  assert.equal(res1.isValid, true);
  assert.equal(res1.isCorrectOption, true);
  assert.match(res1.unlockedInsight || '', /Insight terbuka/);

  // Test reverse match
  const res2 = validateDeductionLink('ev-garden-schedule', 'ev-water-report', 'opt-exact-match', mockConnection);
  assert.equal(res2.isValid, true);
  assert.equal(res2.isCorrectOption, true);

  // Test wrong option
  const resWrong = validateDeductionLink('ev-water-report', 'ev-garden-schedule', 'opt-coincidence', mockConnection);
  assert.equal(resWrong.isValid, true);
  assert.equal(resWrong.isCorrectOption, false);
});

test('evaluateCaseConclusion validates correct hypothesis and required evidence', () => {
  const mockResolutions: CaseResolutionOption[] = [
    {
      id: 'res-garden-watering',
      title: 'Penyiraman Taman Tambahan',
      summary: 'Kenaikan konsumsi air sebesar 360L berasal dari 2 sesi ekstra.',
      isCorrect: true,
      requiredEvidenceIds: ['ev-water-report', 'ev-garden-schedule', 'ev-witness-statement'],
      feedback: 'Deduksimu sempurna! Semua data numerik dan kesaksian konsisten.',
    },
    {
      id: 'res-hidden-leak',
      title: 'Kebocoran Pipa Tersembunyi',
      summary: 'Ada pipa pecah di bawah tanah yang bocor terus menerus.',
      isCorrect: false,
      requiredEvidenceIds: ['ev-water-meter'],
      feedback: 'Salah. Checklist pemeliharaan dan uji tekanan menunjukkan pipa normal.',
    },
  ];

  const titlesMap = {
    'ev-water-report': 'Laporan Konsumsi Air Harian',
    'ev-garden-schedule': 'Jadwal Penyiraman Tambahan',
    'ev-witness-statement': 'Kesaksian Klub Tanaman',
    'ev-water-meter': 'Observasi Meteran Air',
  };

  // Correct hypothesis with all required evidence
  const successRes = evaluateCaseConclusion(
    'res-garden-watering',
    ['ev-water-report', 'ev-garden-schedule', 'ev-witness-statement'],
    mockResolutions,
    titlesMap
  );
  assert.equal(successRes.isCorrect, true);
  assert.equal(successRes.supportingEvidenceValid, true);
  assert.equal(successRes.pointsEarned, 150);

  // Correct hypothesis but missing witness statement
  const partialRes = evaluateCaseConclusion(
    'res-garden-watering',
    ['ev-water-report', 'ev-garden-schedule'],
    mockResolutions,
    titlesMap
  );
  assert.equal(partialRes.isCorrect, false);
  assert.equal(partialRes.supportingEvidenceValid, false);
  assert.equal(partialRes.missingEvidenceTitles.length, 1);
  assert.equal(partialRes.missingEvidenceTitles[0], 'Kesaksian Klub Tanaman');

  // Wrong hypothesis
  const wrongRes = evaluateCaseConclusion(
    'res-hidden-leak',
    ['ev-water-meter'],
    mockResolutions,
    titlesMap
  );
  assert.equal(wrongRes.isCorrect, false);
});

test('computeInvestigatorRank scales ranks by point milestones', () => {
  const rank1 = computeInvestigatorRank(50);
  assert.match(rank1.rank, /Novis Pengarsip/);

  const rank2 = computeInvestigatorRank(150);
  assert.match(rank2.rank, /Penyelidik Muda/);

  const rank3 = computeInvestigatorRank(300);
  assert.match(rank3.rank, /Detektif Madya/);

  const rank4 = computeInvestigatorRank(550);
  assert.match(rank4.rank, /Master Arkivis/);
});
