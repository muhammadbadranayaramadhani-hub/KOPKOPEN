// Karakter global MYSTERIA. Tampilan potret digambar oleh CharacterPortrait.jsx
// berdasarkan properti di sini, sehingga karakter baru cukup ditambahkan sebagai data.

export const EXPRESSIONS = ['neutral', 'happy', 'worried', 'thinking', 'surprised'];

export const CHARACTERS = {
  nara: {
    id: 'nara',
    name: 'Nara',
    title: 'Penjaga Arsip',
    side: 'left',
    skin: '#EBCDB0',
    hair: '#4B4272',
    hairStyle: 'bun',
    outfit: '#3A3D6E',
    accent: '#D9AD75',
    accessory: 'glasses',
  },
  darmo: {
    id: 'darmo',
    name: 'Pak Darmo',
    title: 'Petugas Pemeliharaan',
    side: 'right',
    skin: '#C99B76',
    hair: '#2B2B3A',
    hairStyle: 'cap',
    outfit: '#5D7F7B',
    accent: '#F4EEDC',
    accessory: 'cap',
  },
  sari: {
    id: 'sari',
    name: 'Sari',
    title: 'Ketua Klub Kebun',
    side: 'right',
    skin: '#E3B792',
    hair: '#2A2438',
    hairStyle: 'braid',
    outfit: '#91B9B4',
    accent: '#E7DDF5',
    accessory: 'ribbon',
  },
  player: {
    id: 'player',
    name: '{player}',
    title: 'Penyelidik Baru',
    side: 'left',
    skin: '#E6C3A2',
    hair: '#1D1E36',
    hairStyle: 'hood',
    outfit: '#2D3052',
    accent: '#D9AD75',
    accessory: 'none',
  },
};

// Pembicara khusus tanpa potret.
export const NARRATOR = 'narrator';

export function speakerName(speakerId, playerName) {
  if (speakerId === NARRATOR || !speakerId) return '';
  const c = CHARACTERS[speakerId];
  if (!c) return '';
  return c.name.replace('{player}', playerName || 'Penyelidik');
}
