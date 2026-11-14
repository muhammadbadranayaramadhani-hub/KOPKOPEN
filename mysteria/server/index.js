import { loadEnvFile, loadConfig } from './config.js';
import { createAi } from './services/provider.js';
import { createApp } from './app.js';

loadEnvFile();
const config = loadConfig();
const ai = createAi(config);
const app = createApp({ ai, config });
app.listen(config.port, config.host, () => {
  console.log(`[mysteria] server http://${config.host}:${config.port}`);
  const name = config.provider === 'groq' ? 'Groq' : 'Gemini';
  const keyVar = config.provider === 'groq' ? 'GROQ_API_KEY' : 'GEMINI_API_KEY';
  console.log(ai.isConfigured ? `[mysteria] ${name} aktif (model ${ai.model})` : `[mysteria] ${keyVar} belum diisi: fitur AI nonaktif, game tetap bisa dimainkan.`);
});
