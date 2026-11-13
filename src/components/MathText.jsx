import { Fragment, useMemo } from 'react';
import { parseMathText, mathToPlain } from '../utils/mathFormat.js';

function renderNodes(nodes) {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text': return <Fragment key={i}>{n.v}</Fragment>;
      case 'var': return <i key={i} className="mv">{n.v}</i>;
      case 'sup': return <sup key={i}>{renderNodes(n.c)}</sup>;
      case 'sub': return <sub key={i}>{renderNodes(n.c)}</sub>;
      case 'sqrt': return <span key={i} className="msqrt"><span className="mrad">√</span><span className="mradicand">{renderNodes(n.c)}</span></span>;
      case 'frac': return (
        <span key={i} className="mfrac">
          <span className="mnum">{renderNodes(n.n)}</span>
          <span className="mden">{renderNodes(n.d)}</span>
        </span>
      );
      case 'math': return (
        <span key={i} className={n.display ? 'math math-display' : 'math'} role="img" aria-label={mathToPlain(n.c)}>
          <span aria-hidden="true">{renderNodes(n.c)}</span>
        </span>
      );
      default: return null;
    }
  });
}

// Menampilkan teks yang mungkin berisi rumus (pangkat, pecahan, akar, sisa LaTeX) secara rapi.
// Teks biasa tanpa rumus dikembalikan apa adanya.
export default function MathText({ children }) {
  const text = typeof children === 'string' ? children : null;
  const nodes = useMemo(() => (text === null ? null : parseMathText(text)), [text]);
  if (nodes === null) return children ?? null;
  return <>{renderNodes(nodes)}</>;
}
