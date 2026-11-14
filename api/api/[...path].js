import { loadConfig } from '../server/config.js';
import { createGroq } from '../server/services/groq.js';
import { createApp } from '../server/create-app.js';

const config = loadConfig();
const ai = createGroq(config);
const app = createApp({ ai, config });

export default function handler(req, res) {
  return app(req, res);
}