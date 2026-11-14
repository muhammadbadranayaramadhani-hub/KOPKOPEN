import { CHARACTERS } from '../data/characters.js';

// Potret setengah badan bergaya semi-flat, digambar dari data karakter.
// Ekspresi: neutral | happy | worried | thinking | surprised

function Face({ expr, ink }) {
  const eye = (cx, cy, rx = 5, ry = 6) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ink} />;
  switch (expr) {
    case 'happy':
      return (
        <g>
          <path d="M119 210 Q126 202 133 210" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M167 210 Q174 202 181 210" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M114 192 Q126 187 138 192 M162 192 Q174 187 186 192" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M132 241 Q150 261 168 241" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="112" cy="232" r="9" fill="#C8A9C8" opacity=".45" />
          <circle cx="188" cy="232" r="9" fill="#C8A9C8" opacity=".45" />
        </g>
      );
    case 'worried':
      return (
        <g>
          {eye(126, 210)}
          {eye(174, 210)}
          <path d="M114 196 L138 189 M186 196 L162 189" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M136 251 Q150 243 164 251" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'thinking':
      return (
        <g>
          {eye(130, 209)}
          {eye(178, 209)}
          <path d="M114 186 Q126 178 138 186" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M162 192 L186 192" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M138 250 L160 246" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'surprised':
      return (
        <g>
          {eye(126, 208, 6.5, 8)}
          {eye(174, 208, 6.5, 8)}
          <path d="M113 187 Q126 179 139 187 M161 187 Q174 179 187 187" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="150" cy="250" rx="7" ry="9" fill={ink} opacity=".85" />
        </g>
      );
    default:
      return (
        <g>
          {eye(126, 208)}
          {eye(174, 208)}
          <path d="M114 193 Q126 189 138 193 M162 193 Q174 189 186 193" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M136 247 Q150 253 164 247" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function HairFront({ c }) {
  switch (c.hairStyle) {
    case 'bun':
      return (
        <g fill={c.hair}>
          <circle cx="150" cy="116" r="26" />
          <path d="M86 196 C84 118 216 118 214 196 C196 162 104 162 86 196 Z" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M86 184 C84 112 216 112 214 184 Z" fill={c.hair} />
          <path d="M82 184 L240 188 Q244 200 226 202 L84 198 Z" fill={c.hair} />
          <rect x="96" y="150" width="108" height="8" fill={c.accent} opacity=".7" />
        </g>
      );
    case 'braid':
      return (
        <g>
          <path d="M86 196 C84 118 216 118 214 196 C196 162 104 162 86 196 Z" fill={c.hair} />
          <path d="M206 204 C232 244 218 296 230 348" stroke={c.hair} strokeWidth="24" fill="none" strokeLinecap="round" />
          <circle cx="230" cy="352" r="9" fill={c.accent} />
        </g>
      );
    case 'hood':
      return (
        <g>
          <path d="M70 250 C62 120 238 120 230 250 C214 190 86 190 70 250 Z" fill={c.outfit} />
          <path d="M70 250 C62 120 238 120 230 250" fill="none" stroke={c.accent} strokeWidth="3" opacity=".8" />
        </g>
      );
    default:
      return null;
  }
}

export default function CharacterPortrait({ id, expression = 'neutral', dim = false, side }) {
  const c = CHARACTERS[id];
  if (!c) return null;
  const ink = '#22243D';
  const isHood = c.hairStyle === 'hood';
  return (
    <div className={`portrait ${dim ? 'is-dim' : ''} side-${side || c.side}`} data-expression={expression}>
      <svg viewBox="0 0 300 420" role="img" aria-label={`${c.name.replace('{player}', 'Penyelidik')}, ekspresi ${expression}`}>
        <defs>
          <radialGradient id={`aura-${id}`} cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor="#A9B8DF" stopOpacity=".45" />
            <stop offset="1" stopColor="#A9B8DF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="150" cy="200" rx="150" ry="190" fill={`url(#aura-${id})`} />
        {/* Rambut belakang */}
        {c.hairStyle === 'bun' && <path d="M90 200 C80 300 100 320 150 320 C200 320 220 300 210 200 Z" fill={c.hair} />}
        {/* Badan */}
        <path d="M14 420 C14 330 76 298 150 294 C224 298 286 330 286 420 Z" fill={c.outfit} />
        <path d="M110 298 L150 352 L190 298 Z" fill={c.accent} opacity=".9" />
        <path d="M14 420 C14 330 76 298 150 294" fill="none" stroke={c.accent} strokeWidth="2.5" opacity=".6" />
        {/* Leher */}
        <rect x="132" y="262" width="36" height="42" fill={c.skin} />
        <rect x="132" y="284" width="36" height="14" fill="#000" opacity=".12" />
        {/* Kepala */}
        {!isHood && (
          <>
            <ellipse cx="88" cy="214" rx="9" ry="14" fill={c.skin} />
            <ellipse cx="212" cy="214" rx="9" ry="14" fill={c.skin} />
          </>
        )}
        <ellipse cx="150" cy="208" rx="62" ry="76" fill={c.skin} />
        {isHood ? (
          <g>
            <HairFront c={c} />
            <ellipse cx="150" cy="222" rx="50" ry="56" fill="#15162b" opacity=".92" />
            <circle cx="132" cy="214" r="5" fill="#D9AD75" />
            <circle cx="168" cy="214" r="5" fill="#D9AD75" />
          </g>
        ) : (
          <>
            <Face expr={expression} ink={ink} />
            <HairFront c={c} />
            {c.accessory === 'glasses' && (
              <g fill="none" stroke="#D9AD75" strokeWidth="3.5">
                <circle cx="126" cy="208" r="17" />
                <circle cx="174" cy="208" r="17" />
                <path d="M143 206 Q150 202 157 206" />
              </g>
            )}
            {c.accessory === 'ribbon' && (
              <g fill={c.accent}>
                <path d="M150 112 L132 100 L132 124 Z" />
                <path d="M150 112 L168 100 L168 124 Z" />
              </g>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
