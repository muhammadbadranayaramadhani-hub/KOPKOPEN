// Klien AI palsu HANYA untuk pengujian. Tidak pernah dipakai di kode produksi.
export function mockAi(handler, { configured = true } = {}) {
  const calls = [];
  return {
    isConfigured: configured,
    model: 'mock',
    calls,
    async generate(args) {
      calls.push(args);
      const r = await handler(args, calls.length);
      if (r instanceof Error) throw r;
      return { text: typeof r === 'string' ? r : JSON.stringify(r) };
    },
  };
}
