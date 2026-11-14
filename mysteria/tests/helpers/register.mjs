import { register } from 'node:module';
register('./shim-loader.mjs', import.meta.url);
