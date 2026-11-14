import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend memanggil /api/* (satu origin). Saat dev, Vite meneruskannya ke backend Express,
// sehingga GEMINI_API_KEY tetap hanya ada di server dan HP/perangkat lain cukup membuka alamat Vite.
const API_TARGET = process.env.MYSTERIA_API_TARGET || 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: 5173, proxy: { '/api': { target: API_TARGET, changeOrigin: true } } },
  preview: { host: true, port: 4173, proxy: { '/api': { target: API_TARGET, changeOrigin: true } } },
});
