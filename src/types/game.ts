export type GameScreen = 
  | 'MAIN_MENU'
  | 'INTRO_STORY'
  | 'INVESTIGATION'
  | 'EVIDENCE_INVENTORY'
  | 'DEDUCTION_BOARD'
  | 'CHALLENGE_MODAL'
  | 'CASE_RESOLUTION'
  | 'CASE_ARCHIVE'
  | 'SETTINGS';

export type SubjectType = 'Matematika' | 'Ilmu Pengetahuan Alam (IPA)' | 'Bahasa Indonesia' | 'Logika';

export interface Hotspot {
  id: string;
  name: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  icon: string;
  shortDesc: string;
  detailText: string;
  hasEvidence: boolean;
  evidenceId?: string;
  triggerChallengeId?: string;
  witnessDialogueNodeId?: string;
}

export interface LocationData {
  id: string;
  name: string;
  subtitle: string;
  sceneImage: string;
  description: string;
  hotspots: Hotspot[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'Dokumen' | 'Observasi' | 'Kesaksian' | 'Fisik';
  locationSource: string;
  description: string;
  keyData: string;
  iconName: string;
}

export interface KnowledgeChallenge {
  id: string;
  subject: SubjectType;
  grade: string;
  title: string;
  question: string;
  context: string;
  type: 'calculation' | 'multiple_choice';
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  expectedNumber?: number;
  tolerance?: number;
  unit?: string;
  hints: string[];
  educationalTakeaway: string;
  storyImpact: string;
}

export interface EvidenceConnection {
  id: string;
  evidenceA: string;
  evidenceB: string;
  relationTitle: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  deductionExplanation: string;
  unlockedInsight: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle: string;
  portrait: string;
  text: string;
  choices?: {
    text: string;
    nextNodeId: string;
    impactText?: string;
  }[];
  nextNodeId?: string;
  onEnterAction?: string;
}

export interface CaseResolutionOption {
  id: string;
  title: string;
  summary: string;
  isCorrect: boolean;
  requiredEvidenceIds: string[];
  feedback: string;
}

export interface CaseData {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  difficulty: string;
  duration: string;
  subjects: SubjectType[];
  synopsis: string;
  targetExplanation: string;
  locations: LocationData[];
  evidence: EvidenceItem[];
  challenges: KnowledgeChallenge[];
  connections: EvidenceConnection[];
  resolutions: CaseResolutionOption[];
  dialogues: Record<string, DialogueNode>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface PlayerProgress {
  investigatorName: string;
  rank: string;
  knowledgePoints: number;
  completedCases: string[];
  collectedEvidenceIds: string[];
  solvedChallengeIds: string[];
  unlockedDeductionIds: string[];
  badges: string[];
  activeCaseId: string;
  currentLocationId: string;
  inspectedHotspotIds: string[];
  caseResolved: boolean;
  finalHypothesisId?: string;
  soundEnabled: boolean;
}
