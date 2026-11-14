import { createGemini } from './gemini.js';
import { createGroq } from './groq.js';

// Memilih penyedia AI dari AI_PROVIDER (gemini | groq). Kunci selalu hanya dibaca di server.
export function createAi(config, deps = {}) {
  return config.provider === 'groq' ? createGroq(config, deps.groq) : createGemini(config, deps.gemini);
}
