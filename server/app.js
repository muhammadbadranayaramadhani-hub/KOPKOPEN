import express from 'express';
import { loadEnvFile, loadConfig } from './config.js';
import { createGroq } from './services/groq.js';
import { securityHeaders, cors } from './middleware/security.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { handler } from './routes/util.js';
import { runCompanion } from './routes/companion.js';
import { runInterrogate } from './routes/interrogation.js';
import { runTutor } from './routes/tutor.js';
import { runEvaluate } from './routes/evaluation.js';
import { runGenerateChallenge } from './routes/challenge.js';

export function createApp({ ai, config }) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);
  app.use(securityHeaders);
  app.use(cors(config.allowedOrigins));
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (req, res) =>
    res.json({
      success: true,
      data: {
        status: 'ok',
        ai: {
          configured: ai.isConfigured,
          model: ai.isConfigured ? ai.model : null
        }
      },
      error: null
    })
  );

  const router = express.Router();
  router.use(createRateLimiter({
    max: config.rateLimitPerMin,
    name: 'umum'
  }));

  const heavy = createRateLimiter({
    max: config.rateLimitHeavyPerMin,
    name: 'berat'
  });

  router.post('/companion', handler(runCompanion, ai));
  router.post('/interrogate', handler(runInterrogate, ai));
  router.post('/tutor', handler(runTutor, ai));
  router.post('/evaluate', heavy, handler(runEvaluate, ai));
  router.post('/generate-challenge', heavy, handler(runGenerateChallenge, ai));

  app.use('/api/ai', router);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

loadEnvFile();
const config = loadConfig();
const ai = createGroq(config);

const app = createApp({ ai, config });

export default app;
