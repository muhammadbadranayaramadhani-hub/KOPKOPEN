import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Menampilkan teks yang mungkin berisi rumus LaTeX ($...$, $$...$$, \(...\), \[...\]) sebagai rumus yang rapi.
// Teks di luar rumus tetap teks biasa (React meng-escape-nya). Keluaran KaTeX dengan trust:false aman dipasang sebagai HTML.
const PATTERN = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^\s$](?:[^$\n]*?[^\s$])?)\$/g;

export function splitMath(text) {
  const out = [];
  let last = 0;
  const s = String(text ?? '');
  for (const m of s.matchAll(PATTERN)) {
    if (m.index > last) out.push({ kind: 'text', value: s.slice(last, m.index) });
    const display = m[1] !== undefined || m[2] !== undefined;
    out.push({ kind: 'math', display, value: (m[1] ?? m[2] ?? m[3] ?? m[4]).trim(), raw: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ kind: 'text', value: s.slice(last) });
  return out;
}

function renderTex(tex, display) {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'ignore', trust: false, output: 'htmlAndMathml' });
  } catch {
    return null; // rumus tidak valid: tampilkan teks aslinya, jangan merusak halaman
  }
}

export default function MathText({ text }) {
  const parts = useMemo(() => splitMath(text).map((p) => (p.kind === 'math' ? { ...p, html: renderTex(p.value, p.display) } : p)), [text]);
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === 'text') return <span key={i}>{p.value}</span>;
        if (!p.html) return <span key={i}>{p.raw}</span>;
        return <span key={i} className={p.display ? 'math-block' : 'math-inline'} dangerouslySetInnerHTML={{ __html: p.html }} />;
      })}
    </>
  );
}
