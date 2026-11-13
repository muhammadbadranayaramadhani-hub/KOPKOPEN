import { Badge } from '../types/game';

export const ALL_BADGES: Badge[] = [
  {
    id: 'badge-first-clue',
    title: 'Mata Elang',
    description: 'Menemukan dan mencatat bukti investigasi pertamamu ke dalam Jurnal Detektif.',
    icon: 'eye',
  },
  {
    id: 'badge-all-evidence',
    title: 'Arsiparis Teliti',
    description: 'Mengumpulkan seluruh 5 bukti kunci dalam Kasus MYS-001 tanpa ada yang terlewat.',
    icon: 'archive',
  },
  {
    id: 'badge-math-whiz',
    title: 'Pakar Kalkulasi',
    description: 'Menghitung anomali 360 liter dan volume penyiraman dengan presisi angka sempurna.',
    icon: 'calculator',
  },
  {
    id: 'badge-science-mind',
    title: 'Nalar Saintifik',
    description: 'Menganalisis prinsip konservasi air dan transpirasi tanaman secara ilmiah.',
    icon: 'flask-conical',
  },
  {
    id: 'badge-deduction-master',
    title: 'Arsitek Deduksi',
    description: 'Menghubungkan korelasi antar-bukti di Papan Deduksi untuk membongkar anomali.',
    icon: 'git-merge',
  },
  {
    id: 'badge-case-closed',
    title: 'Kebenaran Terungkap',
    description: 'Menyelesaikan Kasus MYS-001: Tetes Terakhir dengan hipotesis yang terbukti sah.',
    icon: 'award',
  },
];
