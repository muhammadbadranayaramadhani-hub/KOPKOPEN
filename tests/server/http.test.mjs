// Pengujian lapisan HTTP. Dijalankan dengan Express asli bila terpasang; jika tidak, memakai shim (lihat tests/helpers).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mockAi } from '../helpers/mock-gemini.mjs';
import { loadConfig } from '../../server/config.js';

let createApp;
try { ({ createApp } = await import('../../server/app.js')); } catch (e) { console.error('app import failed', e.message); throw e; }

const early = { collected: ['E1'], solved: [], connections: [] };
async function boot(ai, env = {}) {
  const config = loadConfig({ GEMINI_API_KEY: ai.isConfigured ? 'test' : '', ...env });
  const app = createApp({ ai, config });
  const server = await new Promise((res) => { const s = app.listen(0, '127.0.0.1', () => res(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (path, body, raw) => {
    const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: raw ?? JSON.stringify(body) });
    return { status: r.status, json: await r.json(), headers: r.headers };
  };
  return { base, post, close: () => { server.closeAllConnections?.(); server.close(); }, get: (p) => fetch(base + p).then(async (r) => ({ status: r.status, json: await r.json() })) };
}

test('health tidak membocorkan kunci', async () => {
  const s = await boot(mockAi(() => 'x'), { GEMINI_API_KEY: 'RAHASIA-123' });
  const r = await s.get('/api/health');
  assert.equal(r.json.data.ai.configured, true);
  assert.ok(!JSON.stringify(r.json).includes('RAHASIA'));
  s.close();
});

test('companion: format {success,data,error}', async () => {
  const s = await boot(mockAi(() => 'Coba amati tabelnya.'));
  const r = await s.post('/api/ai/companion', { message: 'halo', progress: early });
  assert.equal(r.status, 200);
  assert.equal(r.json.success, true);
  assert.equal(r.json.error, null);
  assert.equal(r.json.data.reply, 'Coba amati tabelnya.');
  s.close();
});

test('error: tanpa kunci 503, JSON rusak 400, terlalu besar 413, rute tak ada 404', async () => {
  const s = await boot(mockAi(() => 'x', { configured: false }));
  let r = await s.post('/api/ai/companion', { message: 'halo', progress: early });
  assert.equal(r.status, 503);
  assert.equal(r.json.success, false);
  assert.equal(r.json.error.code, 'AI_NOT_CONFIGURED');
  r = await s.post('/api/ai/companion', null, '{rusak');
  assert.equal(r.status, 400);
  r = await s.post('/api/ai/companion', { message: 'x'.repeat(40000), progress: early });
  assert.equal(r.status, 413);
  r = await s.post('/api/ai/nope', {});
  assert.equal(r.status, 404);
  s.close();
});

test('timeout AI → 504 retryable', async () => {
  const { AppError } = await import('../../server/errors.js');
  const s = await boot(mockAi(() => new AppError('AI_TIMEOUT', 'lama', 504, { retryable: true })));
  const r = await s.post('/api/ai/companion', { message: 'halo', progress: early });
  assert.equal(r.status, 504);
  assert.equal(r.json.error.retryable, true);
  s.close();
});

test('rate limit: 429 dengan Retry-After', async () => {
  const s = await boot(mockAi(() => 'ok'), { RATE_LIMIT_PER_MIN: '3' });
  const codes = [];
  let last;
  for (let i = 0; i < 5; i++) { last = await s.post('/api/ai/companion', { message: 'halo', progress: early }); codes.push(last.status); }
  assert.deepEqual(codes, [200, 200, 200, 429, 429]);
  assert.equal(last.json.error.code, 'RATE_LIMITED');
  assert.ok(last.headers.get('retry-after'));
  s.close();
});

test('semua endpoint terpasang', async () => {
  const ai = mockAi(() => ({}));
  const s = await boot(ai);
  for (const p of ['interrogate', 'tutor', 'evaluate', 'generate-challenge']) {
    const r = await s.post(`/api/ai/${p}`, {});
    assert.notEqual(r.status, 404, p);
    assert.equal(r.json.success, false);
  }
  s.close();
});
