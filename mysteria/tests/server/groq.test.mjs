import test from 'node:test';
import assert from 'node:assert/strict';
import { createGroq, mapGroqError, schemaHint, toMessages } from '../../server/services/groq.js';
import { createAi } from '../../server/services/provider.js';
import { loadConfig } from '../../server/config.js';
import { ASTRA_SCHEMA } from '../../server/prompts/astraPrompt.js';

const cfg = (o = {}) => loadConfig({ AI_PROVIDER: 'groq', GROQ_API_KEY: 'gsk_test_RAHASIA', ...o });
const reply = (content, extra = {}, status = 200) => async () => new Response(JSON.stringify(status === 200 ? { choices: [{ message: { content }, finish_reason: 'stop', ...extra }] } : { error: { message: content } }), { status });

test('konfigurasi: provider dipilih dari env, bawaan gemini', () => {
  assert.equal(loadConfig({}).provider, 'gemini');
  assert.equal(cfg().provider, 'groq');
  assert.equal(cfg().groqModel, 'openai/gpt-oss-120b');
  assert.equal(createAi(cfg(), { groq: { fetchImpl: reply('x') } }).provider, 'groq');
  assert.equal(createAi(loadConfig({ GEMINI_API_KEY: 'k' }), { gemini: { sdkLoader: async () => ({}) } }).provider, undefined);
});

test('tanpa kunci: AI_NOT_CONFIGURED dan tidak memanggil jaringan', async () => {
  let called = false;
  const g = createGroq(cfg({ GROQ_API_KEY: '' }), { fetchImpl: async () => { called = true; return new Response('{}'); } });
  assert.equal(g.isConfigured, false);
  await assert.rejects(g.generate({ system: 's', contents: [] }), (e) => e.code === 'AI_NOT_CONFIGURED');
  assert.equal(called, false);
});

test('bentuk permintaan: URL, header Authorization, pesan, model, json_object, batas token', async () => {
  let seen;
  const g = createGroq(cfg(), { fetchImpl: async (url, init) => { seen = { url, init, body: JSON.parse(init.body) }; return reply('{"a":1}')(); } });
  const r = await g.generate({ system: 'SISTEM', contents: [{ role: 'user', parts: [{ text: 'hai' }] }, { role: 'model', parts: [{ text: 'halo' }] }, { role: 'user', parts: [{ text: 'lagi' }] }], json: true, schema: ASTRA_SCHEMA, maxOutputTokens: 300 });
  assert.equal(r.text, '{"a":1}');
  assert.equal(seen.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(seen.init.headers.Authorization, 'Bearer gsk_test_RAHASIA');
  assert.deepEqual(seen.body.messages.map((m) => m.role), ['system', 'user', 'assistant', 'user']);
  assert.match(seen.body.messages[0].content, /SISTEM/);
  assert.match(seen.body.messages[0].content, /"reasoningQuality": integer/);
  assert.deepEqual(seen.body.response_format, { type: 'json_object' });
  assert.equal(seen.body.max_completion_tokens, 1800);
  assert.equal(seen.body.reasoning_effort, 'low');
  assert.equal(seen.body.model, 'openai/gpt-oss-120b');
});

test('model non-penalar: tanpa tambahan token dan tanpa reasoning_effort; teks biasa tanpa response_format', async () => {
  let body;
  const g = createGroq(cfg({ GROQ_MODEL: 'llama-3.1-8b-instant' }), { fetchImpl: async (u, i) => { body = JSON.parse(i.body); return reply('jawab')(); } });
  await g.generate({ system: 's', contents: [{ role: 'user', parts: [{ text: 'x' }] }], maxOutputTokens: 400 });
  assert.equal(body.max_completion_tokens, 400);
  assert.equal(body.reasoning_effort, undefined);
  assert.equal(body.response_format, undefined);
});

test('pemetaan galat', async () => {
  assert.equal(mapGroqError(401).code, 'AI_AUTH_FAILED');
  assert.equal(mapGroqError(429).code, 'AI_RATE_LIMITED');
  assert.equal(mapGroqError(404).code, 'AI_MODEL_NOT_FOUND');
  assert.equal(mapGroqError(400, 'The model `x` has been decommissioned').code, 'AI_MODEL_NOT_FOUND');
  assert.equal(mapGroqError(400, 'bad').code, 'AI_BAD_REQUEST');
  assert.equal(mapGroqError(503).code, 'AI_UNAVAILABLE');
  const g = createGroq(cfg(), { fetchImpl: reply('nope', {}, 401) });
  await assert.rejects(g.generate({ system: 's', contents: [] }), (e) => e.code === 'AI_AUTH_FAILED' && !JSON.stringify(e).includes('gsk_test'));
});

test('timeout, jaringan putus, jawaban kosong, terpotong', async () => {
  const slow = createGroq(cfg({ AI_TIMEOUT_MS: '3000' }), { fetchImpl: (u, i) => new Promise((_, rej) => i.signal.addEventListener('abort', () => rej(Object.assign(new Error('x'), { name: 'AbortError' })))) });
  await assert.rejects(slow.generate({ system: 's', contents: [] }), (e) => e.code === 'AI_TIMEOUT');
  const down = createGroq(cfg(), { fetchImpl: async () => { throw new TypeError('fetch failed'); } });
  await assert.rejects(down.generate({ system: 's', contents: [] }), (e) => e.code === 'AI_UNAVAILABLE');
  await assert.rejects(createGroq(cfg(), { fetchImpl: reply('') }).generate({ system: 's', contents: [] }), (e) => e.code === 'AI_EMPTY_RESPONSE');
  await assert.rejects(createGroq(cfg(), { fetchImpl: reply('teks panjang', { finish_reason: 'length' }) }).generate({ system: 's', contents: [] }), (e) => e.code === 'AI_BAD_OUTPUT');
}, { timeout: 10000 });

test('helper: schemaHint & toMessages', () => {
  assert.match(schemaHint(ASTRA_SCHEMA), /"strengths": array of string \(wajib\)/);
  assert.equal(schemaHint(null), '');
  assert.equal(toMessages('s', [{ role: 'model', parts: [{ text: 'a' }, { text: 'b' }] }])[1].content, 'ab');
});
