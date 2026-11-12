import { loadEnvFile, loadConfig } from './config.js';
import { createGemini } from './services/gemini.js';
import { createApp } from './app.js';

loadEnvFile();
const config = loadConfig();
const ai = createGemini(config);
const app = createApp({ ai, config });
app.listen(config.port, config.host, () => {
  console.log(`[mysteria] server http://${config.host}:${config.port}`);
  console.log(ai.isConfigured ? `[mysteria] Gemini aktif (model ${config.model})` : '[mysteria] GEMINI_API_KEY belum diisi: fitur AI nonaktif, game tetap bisa dimainkan.');
});
