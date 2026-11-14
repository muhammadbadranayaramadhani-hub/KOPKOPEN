import { loadConfig } from './config.js';
import { loadEnvFile } from './dev-env.js';
import { createGroq } from './services/groq.js';
import { createApp } from './create-app.js';

// Load local environment when available.
// Existing Vercel environment variables take priority.
loadEnvFile();

const config = loadConfig();
const ai = createGroq(config);

const app = createApp({ ai, config });

export default app;
