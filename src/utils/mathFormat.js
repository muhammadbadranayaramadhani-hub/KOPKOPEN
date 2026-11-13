// Pemformat rumus: mengubah teks soal/jawaban yang berisi notasi matematika mentah
// (mis. "K(t) = (2t^2 + 8t) / (t + 2)" atau sisa LaTeX seperti "\frac{a}{b}", "$x^2$")
// menjadi pohon node yang mudah dirender (pecahan bertumpuk, pangkat, indeks, akar, simbol).
// Tanpa dependensi; murni fungsi sehingga bisa diuji dengan node --test.
//
// Node: {t:'text',v} | {t:'var',v} | {t:'sup',c} | {t:'sub',c} | {t:'sqrt',c}
//     | {t:'frac',n,d} | {t:'math',display,raw,c}

const GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ', sigma: 'σ', phi: 'φ', omega: 'ω', Delta: 'Δ', Sigma: 'Σ', Omega: 'Ω' };
const SYMS = { cdot: '·', times: '×', div: '÷', pm: '±', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', infty: '∞', rightarrow: '→', to: '→', circ: '°', degree: '°', ldots: '…', dots: '…', angle: '∠' };
const FN_RE = /^(sqrt|sin|cos|tan|log|ln|exp|lim)(?![A-Za-z])/;
const ALLOWED_WORDS = new Set(['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'lim', 'pi']);

function matchClose(s, i, open, close) {
  let d = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === open) d++;
    else if (s[k] === close) { d--; if (d === 0) return k; }
  }
  return -1;
}
function matchOpenBack(s, i) {
  let d = 0;
  for (let k = i; k >= 0; k--) {
    if (s[k] === ')') d++;
    else if (s[k] === '(') { d--; if (d === 0) return k; }
  }
  return -1;
}

// ---------- LaTeX -> notasi teks biasa ----------
export function normalizeLatex(src) {
  let s = String(src);
  for (let g = 0; g < 30; g++) {
    const m = /\\[dt]?frac\s*\{/.exec(s);
    if (!m) break;
    const a0 = m.index + m[0].length - 1;
    const a1 = matchClose(s, a0, '{', '}');
    if (a1 < 0) break;
    let b0 = a1 + 1;
    while (s[b0] === ' ') b0++;
    if (s[b0] !== '{') { s = s.slice(0, m.index) + s.slice(a0 + 1, a1) + s.slice(a1 + 1); continue; }
    const b1 = matchClose(s, b0, '{', '}');
    if (b1 < 0) break;
    s = `${s.slice(0, m.index)}(${s.slice(a0 + 1, a1)})/(${s.slice(b0 + 1, b1)})${s.slice(b1 + 1)}`;
  }
  for (let g = 0; g < 30; g++) {
    const m = /\\sqrt\s*\{/.exec(s);
    if (!m) break;
    const a0 = m.index + m[0].length - 1;
    const a1 = matchClose(s, a0, '{', '}');
    if (a1 < 0) break;
    s = `${s.slice(0, m.index)}sqrt(${s.slice(a0 + 1, a1)})${s.slice(a1 + 1)}`;
  }
  s = s
    .replace(/\\(?:text|textbf|textit|mathrm|mathbf|operatorname|mbox)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\(?:left|right)\s*([()[\]|.])/g, (_, d) => (d === '.' ? '' : d))
    .replace(/\\!/g, '')
    .replace(/\\(?:,|;|:|quad|qquad)|\\ /g, ' ')
    .replace(/\\\\/g, ' ')
    .replace(/\\([%$&#_{}])/g, '$1')
    .replace(/\\([A-Za-z]+)/g, (_, name) => GREEK[name] ?? SYMS[name] ?? name);
  return s;
}

// ---------- Pemindai ekspresi di dalam teks biasa ----------
function isMathToken(tok) {
  if (!tok) return false;
  if (/^[+\-−*/^=<>≤≥×·÷±]+$/.test(tok)) return true;
  if (!/^[\w.()^{}_+\-−*/×·÷√π°%<>=≤≥,'′]*$/.test(tok)) return false;
  const words = tok.match(/[A-Za-z]{2,}/g) || [];
  return words.every((w) => ALLOWED_WORDS.has(w));
}

// Berjalan token demi token setelah "=" selama token masih berbentuk ekspresi.
function walkEquation(s, from) {
  const tokRe = /\s*(\S+)/y;
  let pos = from, end = -1, depth = 0;
  for (;;) {
    tokRe.lastIndex = pos;
    const m = tokRe.exec(s);
    if (!m) break;
    let tok = m[1];
    const tokStart = m.index + m[0].length - tok.length;
    const pm = /[.,;:?!]+$/.exec(tok);
    if (pm) tok = tok.slice(0, pm.index);
    let stop = !!pm;
    let d = depth, cut = tok.length;
    for (let k = 0; k < tok.length; k++) {
      if (tok[k] === '(') d++;
      else if (tok[k] === ')') {
        if (d === 0) { cut = k; stop = true; break; }
        d--;
      }
    }
    tok = tok.slice(0, cut);
    if (!tok || !isMathToken(tok)) break;
    depth = d;
    end = tokStart + tok.length;
    pos = end;
    if (stop) break;
  }
  return end;
}

const EQ_LHS = /(?<![A-Za-z0-9_À-￿])[A-Za-z][A-Za-z0-9]?['′]?(?:\([A-Za-z0-9, ]{1,10}\))?\s*=(?![=>])\s*/g;
const PAREN_FRAC = /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g;

function mathyText(str) {
  const toks = str.trim().split(/\s+/);
  return toks.every(isMathToken) && /[\d+\-−*^=]/.test(str);
}

function nextSpan(s, pos) {
  let eq = null;
  EQ_LHS.lastIndex = pos;
  let m;
  while ((m = EQ_LHS.exec(s))) {
    const end = walkEquation(s, m.index + m[0].length);
    if (end > m.index + m[0].length - 1) { eq = { start: m.index, end }; break; }
    EQ_LHS.lastIndex = m.index + 1;
  }
  let pf = null;
  PAREN_FRAC.lastIndex = pos;
  while ((m = PAREN_FRAC.exec(s))) {
    if (mathyText(m[1]) && mathyText(m[2])) { pf = { start: m.index, end: m.index + m[0].length }; break; }
  }
  if (eq && pf) return pf.start < eq.start ? pf : eq;
  return eq || pf;
}

// ---------- Ekspresi -> node ----------
function findTopSlash(s) {
  let p = 0, b = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') p++;
    else if (c === ')') p--;
    else if (c === '{') b++;
    else if (c === '}') b--;
    else if (c === '/' && p <= 0 && b <= 0) return i;
  }
  return -1;
}

function leftAtom(s, slash) {
  let e = slash;
  while (e > 0 && s[e - 1] === ' ') e--;
  if (e === 0) return null;
  const head = s.slice(0, e);
  const ex = /\^(?:\{[^}]*\}|\([^()]*\)|[-+−]?[A-Za-z0-9.]+)$/.exec(head);
  const be = ex ? ex.index : e;
  let st, keep = !!ex, inner = null;
  if (s[be - 1] === ')') {
    const j = matchOpenBack(s, be - 1);
    if (j < 0) return null;
    st = j;
    const fn = /[A-Za-z]+$/.exec(s.slice(0, j));
    if (fn) { st = j - fn[0].length; keep = true; }
    else if (!ex) inner = s.slice(j + 1, be - 1);
  } else {
    const r = /[A-Za-z0-9.'′]+$/.exec(s.slice(0, be));
    if (!r) return null;
    st = r.index;
  }
  return { start: st, end: e, text: s.slice(st, e), inner: keep ? null : inner };
}

function rightAtom(s, slash) {
  let i = slash + 1;
  while (s[i] === ' ') i++;
  if (i >= s.length) return null;
  let end, inner = null, keep = false;
  const fn = /^[A-Za-z]+(?=\()/.exec(s.slice(i));
  if (s[i] === '(' || fn) {
    const o = s.indexOf('(', i);
    const c = matchClose(s, o, '(', ')');
    if (c < 0) return null;
    end = c + 1;
    if (fn) keep = true; else inner = s.slice(o + 1, c);
  } else {
    const r = /^[A-Za-z0-9.'′]+/.exec(s.slice(i));
    if (!r) return null;
    end = i + r[0].length;
  }
  const ex = /^\^(?:\{[^}]*\}|\([^()]*\)|[-+−]?[A-Za-z0-9.]+)/.exec(s.slice(end));
  if (ex) { end += ex[0].length; keep = true; }
  return { start: i, end, text: s.slice(i, end), inner: keep ? null : inner };
}

function build(src) {
  const s = src.replace(/\s+/g, ' ');
  const slash = findTopSlash(s);
  if (slash < 0) return inline(s);
  const L = leftAtom(s, slash);
  const R = rightAtom(s, slash);
  const unit = L && R && /^[A-Za-z]+$/.test(L.text) && /^[A-Za-z]+$/.test(R.text); // m/s, km/jam: bukan pecahan
  if (unit) { // satuan ditulis tegak, bukan variabel miring
    return [...build(s.slice(0, L.start)), { t: 'text', v: `${L.text}/${R.text}` }, ...build(s.slice(R.end))];
  }
  if (!L || !R) {
    return [...build(s.slice(0, slash)), { t: 'text', v: '/' }, ...build(s.slice(slash + 1))];
  }
  return [
    ...build(s.slice(0, L.start)),
    { t: 'frac', n: build((L.inner ?? L.text).trim()), d: build((R.inner ?? R.text).trim()) },
    ...build(s.slice(R.end)),
  ];
}

function readScript(s, i, isSup) {
  if (s[i] === '{') {
    const c = matchClose(s, i, '{', '}');
    return c < 0 ? null : { content: s.slice(i + 1, c), end: c + 1 };
  }
  if (isSup && s[i] === '(') {
    const c = matchClose(s, i, '(', ')');
    return c < 0 ? null : { content: s.slice(i + 1, c), end: c + 1 };
  }
  const m = (isSup ? /^[-+−]?(?:\d+(?:[.,]\d+)?|[A-Za-z])/ : /^(?:[A-Za-z0-9]+)/).exec(s.slice(i));
  return m ? { content: m[0], end: i + m[0].length } : null;
}

const UNARY_PREV = '(=+−*·×/^<>≤≥≠,±';

function inline(s) {
  const out = [];
  let buf = '', last = '', i = 0;
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  while (i < s.length) {
    const c = s[i];
    if (c === '^' || c === '_') {
      const r = readScript(s, i + 1, c === '^');
      if (r) {
        flush();
        out.push({ t: c === '^' ? 'sup' : 'sub', c: inline(r.content) });
        last = 'x'; i = r.end; continue;
      }
    }
    if (/[A-Za-z]/.test(c) && !/[A-Za-z]/.test(s[i - 1] || '')) {
      const rest = s.slice(i);
      if (/^pi(?![A-Za-z])/.test(rest)) { buf += 'π'; last = 'x'; i += 2; continue; }
      const fm = FN_RE.exec(rest);
      if (fm) {
        if (fm[1] === 'sqrt' && rest[4] === '(') {
          const close = matchClose(s, i + 4, '(', ')');
          if (close > 0) {
            flush();
            out.push({ t: 'sqrt', c: build(s.slice(i + 5, close).trim()) });
            last = 'x'; i = close + 1; continue;
          }
        }
        buf += fm[1]; last = 'x'; i += fm[1].length; continue;
      }
    }
    if (/[A-Za-z]/.test(c)) { flush(); out.push({ t: 'var', v: c }); last = 'x'; i++; continue; }
    if (c === ' ') { if (buf && !buf.endsWith(' ')) buf += ' '; i++; continue; }

    let op = c;
    if (c === '-') op = '−';
    if (c === '*') op = /\d/.test(s[i - 1] || '') && /\d/.test(s[i + 1] || '') ? '×' : '·';
    if (c === '<' && s[i + 1] === '=') { op = '≤'; i++; }
    else if (c === '>' && s[i + 1] === '=') { op = '≥'; i++; }
    else if (c === '!' && s[i + 1] === '=') { op = '≠'; i++; }
    if ('+−=<>≤≥≠×±'.includes(op)) {
      const unary = (op === '+' || op === '−' || op === '±') && (last === '' || UNARY_PREV.includes(last));
      if (unary) { buf += op; last = op; i++; continue; }
      buf = `${buf.replace(/ +$/, '')} ${op} `;
      last = op; i++;
      while (s[i] === ' ') i++;
      continue;
    }
    buf += op; last = op; i++;
  }
  flush();
  return out;
}

function mathNode(raw, display) {
  const body = raw.trim();
  return { t: 'math', display, raw: body, c: build(body) };
}
const hasFrac = (nodes) => nodes.some((n) => n.t === 'frac');

// ---------- Teks biasa: pangkat/indeks + simbol ----------
function pushPlain(out, text) {
  if (!text) return;
  const t = text.replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/!=/g, '≠').replace(/(\d)\s*\*\s*(?=\d)/g, '$1 × ');
  const re = /\^(\{[^}]*\}|\([^)]*\)|[-+−]?\d+(?:[.,]\d+)?|[-+−]?[A-Za-z])|(?<=[A-Za-z])_(\{[^}]*\}|\d+|[A-Za-z])(?![A-Za-z0-9_])/g;
  let last = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push({ t: 'text', v: t.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: 'sup', c: inline(m[1].replace(/^[{(]|[})]$/g, '')) });
    else out.push({ t: 'sub', c: inline(m[2].replace(/^\{|\}$/g, '')) });
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push({ t: 'text', v: t.slice(last) });
}

function pushProse(out, src) {
  const s = src.includes('\\') ? normalizeLatex(src) : src;
  let pos = 0;
  while (pos < s.length) {
    const span = nextSpan(s, pos);
    if (!span) { pushPlain(out, s.slice(pos)); break; }
    if (span.start > pos) pushPlain(out, s.slice(pos, span.start));
    const node = mathNode(s.slice(span.start, span.end), false);
    let next = span.end;
    if (hasFrac(node.c)) {
      node.display = true; // rumus berpecahan tampil di baris sendiri agar mudah dibaca
      const tail = /^[.,;:](?=\s|$)/.exec(s.slice(next));
      if (tail) next += 1;
    }
    out.push(node);
    pos = next;
  }
}

const DELIM = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)([^$\n]+?)(?<!\s)\$/g;

export function parseMathText(input) {
  const text = String(input ?? '');
  if (!/[\^_\\$=/<>*]/.test(text)) return [{ t: 'text', v: text }];
  const out = [];
  let last = 0, m;
  DELIM.lastIndex = 0;
  while ((m = DELIM.exec(text))) {
    if (m.index > last) pushProse(out, text.slice(last, m.index));
    const display = m[1] !== undefined || m[2] !== undefined;
    out.push(mathNode(normalizeLatex(m[1] ?? m[2] ?? m[3] ?? m[4]), display));
    last = m.index + m[0].length;
  }
  if (last < text.length) pushProse(out, text.slice(last));
  return out;
}

// Versi teks polos (mis. untuk aria-label / pembacaan layar): "t²", "(2t² + 8t) ÷ (t + 2)".
export function mathToPlain(nodes) {
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '−': '⁻', '+': '⁺' };
  return nodes.map((n) => {
    switch (n.t) {
      case 'text': case 'var': return n.v;
      case 'sup': { const p = mathToPlain(n.c); return [...p].every((ch) => SUP[ch]) ? [...p].map((ch) => SUP[ch]).join('') : `^(${p})`; }
      case 'sub': return `_${mathToPlain(n.c)}`;
      case 'sqrt': return `√(${mathToPlain(n.c)})`;
      case 'frac': return `(${mathToPlain(n.n)}) ÷ (${mathToPlain(n.d)})`;
      case 'math': return mathToPlain(n.c);
      default: return '';
    }
  }).join('');
}
