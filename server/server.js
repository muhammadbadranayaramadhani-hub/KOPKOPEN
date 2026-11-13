import express from 'express';
import { loadEnvFile, loadConfig } from './config.js';
import { createGroq } from './services/groq.js';
import { createApp } from './create-app.js';

loadEnvFile();

const config = loadConfig();
const ai = createGroq(config);
const app = createApp({ ai, config });

export default app;
