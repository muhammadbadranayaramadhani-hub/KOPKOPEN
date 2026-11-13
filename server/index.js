import { loadConfig } from './config.js';
import app from './app.js';

const config = loadConfig();

app.listen(config.port, config.host, () => {
  console.log(`[mysteria] server http://${config.host}:${config.port}`);
});
