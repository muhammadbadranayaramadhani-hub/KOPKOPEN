import { loadEnvFile, loadConfig } from './config.js';
import { createGroq } from './services/groq.js';
import { createApp } from './app.js';

loadEnvFile();

const config = loadConfig();
const ai = createGroq(config);
const app = createApp({ ai, config });

app.listen(config.port, config.host, () => {
  console.log(`[mysteria] server http://${config.host}:${config.port}`);

  console.log(
    ai.isConfigured
      ? `[mysteria] Groq aktif (model ${config.model})`
      : '[mysteria] GROQ_API_KEY belum diisi: fitur AI nonaktif, game tetap bisa dimainkan.'
  );
});
