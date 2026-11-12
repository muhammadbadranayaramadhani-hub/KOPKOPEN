// Server uji E2E: menyajikan bundel statis + API sungguhan (createApp) dengan AI PALSU yang bisa diatur lewat POST /__mock.
// Hanya untuk pengujian. Jalankan: node --import ./tests/helpers/register.mjs tests/helpers/e2e-server.mjs <dirStatik> <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../../server/app.js';
import { loadConfig } from '../../server/config.js';
import { AppError } from '../../server/errors.js';
import { mockAi } from './mock-gemini.mjs';

const [dir, port = '4599'] = process.argv.slice(2);
const state = { mode: 'ok', configured: true, delay: 0, calls: [], nyx: 0 };
const astraOk = { reasoningQuality: 82, educationalUnderstanding: 74, strengths: ['Penjelasanmu runtut dan memakai bukti.'], weaknesses: ['Bisa lebih rinci menyingkirkan dugaan lain.'], suggestions: ['Sebut bukti yang menyingkirkan dugaan bocor.'], summary: 'Penalaranmu kuat dan bertumpu pada bukti. Terus pertahankan kebiasaan ini.' };

const ai = {
  get isConfigured() { return state.configured; },
  model: 'mock',
  async generate(args) {
    state.calls.push(args.system.slice(0, 40)); state.last = args.system; state.lastBy = state.lastBy || {}; state.lastBy[args.system.match(/Kamu adalah (\w+)/)?.[1] || '?'] = args.system;
    if (state.delay) await new Promise((r) => setTimeout(r, state.delay));
    if (state.mode === 'fail') throw new AppError('AI_UNAVAILABLE', 'Layanan AI sedang sibuk.', 503, { retryable: true });
    const sys = args.system;
    if (sys.includes('Kamu adalah RENNTZY')) return { text: state.mode === 'spoil' ? 'Penyebabnya penyiraman taman oleh Klub Kebun: 2 x 180 = 360.' : 'Mari lihat tabel BKT-01. Apa yang berbeda pada hari Rabu?' };
    if (sys.includes('Kamu adalah REI')) return { text: 'Biasanya 1.200 liter, hari itu 1.560 liter, Nak.' };
    if (sys.includes('Kamu adalah NOPAL')) return { text: 'Ingat: selisih dicari dengan pengurangan, besar dikurangi kecil.' };
    if (sys.includes('Kamu adalah ASTRA') && sys.includes('soal latihan')) return { text: JSON.stringify({ reasoningScore: 77, conceptScore: 81, misconceptions: [], whyCorrectOrNot: 'Jarak sama dengan kecepatan dikali waktu.', feedback: 'Langkahmu runtut dan tepat.', nextStep: 'Coba soal GLBB.' }) };
    if (sys.includes('Kamu adalah ASTRA')) return { text: JSON.stringify(astraOk) };
    if (sys.includes('Kamu adalah NYX')) {
      const a = 12 + state.nyx++;
      return { text: JSON.stringify({ type: 'numeric', topic: 'bilangan bulat', question: `Hitunglah ${a} + 8 x 3 berapa hasilnya?`, answer: a + 24, expression: `${a}+8*3`, unit: '', explanation: `Kali dulu: 8 x 3 = 24, lalu ${a} + 24 = ${a + 24}.`, hint: 'Ingat urutan operasi hitung.' }) };
    }
    throw new AppError('AI_BAD_OUTPUT', 'identitas tak dikenal', 502);
  },
};

const api = createApp({ ai, config: loadConfig({ GEMINI_API_KEY: 'x', RATE_LIMIT_PER_MIN: '500' }) });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
http.createServer((req, res) => {
  if (req.url === '/__mock' && req.method === 'POST') {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { Object.assign(state, JSON.parse(b || '{}')); res.end(JSON.stringify({ ok: true, state: { ...state, calls: state.calls.length } })); });
    return;
  }
  if (req.url === '/__last') { res.end(JSON.stringify(state.lastBy || {})); return; }
  if (req.url === '/__calls') { res.end(JSON.stringify(state.calls)); return; }
  if (req.url.startsWith('/api/')) return api(req, res);
  const file = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(file, (err, data) => { if (err) { res.statusCode = 404; res.end('nf'); } else { res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(data); } });
}).listen(Number(port), '127.0.0.1', () => console.log('listening', port));
