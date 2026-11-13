import { theLastDropCase } from './theLastDrop';
import { CaseData } from '../../types/game';

export interface CatalogCasePreview {
  code: string;
  title: string;
  subtitle: string;
  status: 'PLAYABLE' | 'COMING_SOON';
  difficulty: string;
  subjects: string[];
  synopsis: string;
}

export const CASE_CATALOG: CatalogCasePreview[] = [
  {
    code: 'MYS-001',
    title: 'Tetes Terakhir',
    subtitle: 'Misteri Lonjakan Konsumsi Air Akademi',
    status: 'PLAYABLE',
    difficulty: 'Tingkat Pemula (Kelas VII-IX)',
    subjects: ['Matematika', 'IPA', 'Bahasa Indonesia'],
    synopsis:
      'Konsumsi air melonjak dari 1.200L ke 1.560L dalam sehari. Selidiki apakah terjadi kebocoran pipa bawah tanah atau ada penggunaan khusus yang dirahasiakan!',
  },
  {
    code: 'MYS-002',
    title: 'Gema Jam Tua',
    subtitle: 'Kecepatan Bunyi dan Bayangan Menara Lonceng',
    status: 'COMING_SOON',
    difficulty: 'Tingkat Menengah (Kelas VIII)',
    subjects: ['Fisika / IPA', 'Geometri', 'Sejarah'],
    synopsis:
      'Lonceng menara utama berbunyi tepat saat matahari mencapai sudut 45 derajat, namun getaran gelombang bunyi tercatat lambat 3 detik di laboratorium bawah tanah.',
  },
  {
    code: 'MYS-003',
    title: 'Naskah Berwarna Emas',
    subtitle: 'Reaksi Kimia Tinta Simpatik di Ruang Naskah Kuno',
    status: 'COMING_SOON',
    difficulty: 'Tingkat Lanjutan (Kelas IX)',
    subjects: ['Kimia / IPA', 'Bahasa & Sastra', 'Matematika'],
    synopsis:
      'Halaman naskah kuno abad ke-18 mendadak memudar menjadi putih bersih setelah terpapar larutan asam misterius.',
  },
];

export const ALL_CASES: Record<string, CaseData> = {
  'the-last-drop': theLastDropCase,
};
