// Latar sinematik MYSTERIA, digambar dengan SVG + gradien (tanpa aset gambar).
// Semua adegan memakai viewBox 1200x900 (4:3) agar koordinat hotspot selalu sejajar.
const W = 1200;
const H = 900;

const arch = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`;

// Pseudo-acak deterministik agar bintang/rak selalu sama.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
const STARS = (() => {
  const r = rng(42);
  return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * 420, r: 0.8 + r() * 1.8, o: 0.4 + r() * 0.6 }));
})();

function Defs() {
  return (
    <defs>
      <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14152c" />
        <stop offset=".55" stopColor="#2e3060" />
        <stop offset="1" stopColor="#7776A8" />
      </linearGradient>
      <linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2c5a" />
        <stop offset=".5" stopColor="#7776A8" />
        <stop offset=".85" stopColor="#C8A9C8" />
        <stop offset="1" stopColor="#D9AD75" />
      </linearGradient>
      <radialGradient id="moonGlow">
        <stop offset="0" stopColor="#E7DDF5" stopOpacity=".55" />
        <stop offset="1" stopColor="#E7DDF5" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="warmGlow">
        <stop offset="0" stopColor="#D9AD75" stopOpacity=".75" />
        <stop offset="1" stopColor="#D9AD75" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="wallDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a1b36" />
        <stop offset="1" stopColor="#2f3159" />
      </linearGradient>
      <linearGradient id="floorDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b3b69" />
        <stop offset="1" stopColor="#1a1b34" />
      </linearGradient>
      <linearGradient id="woodFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a3f5e" />
        <stop offset="1" stopColor="#241f3a" />
      </linearGradient>
      <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A9B8DF" stopOpacity=".5" />
        <stop offset="1" stopColor="#A9B8DF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="groundGarden" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f5f5e" />
        <stop offset="1" stopColor="#1f2c3f" />
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F0CFA0" />
        <stop offset="1" stopColor="#B78A52" />
      </linearGradient>
    </defs>
  );
}

function Figure({ x, y, body, skin, hair, cap, braid }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="6" rx="48" ry="11" fill="#000" opacity=".35" />
      <path d="M-36 0 L-28 -118 Q0 -140 28 -118 L36 0 Z" fill={body} />
      <path d="M-14 -126 L0 -100 L14 -126 Z" fill="#F4EEDC" opacity=".8" />
      <circle cx="0" cy="-150" r="25" fill={skin} />
      <path d={`M-27 -152 Q0 -196 27 -152 ${cap ? 'L34 -150 L-34 -150' : 'Q0 -168 -27 -152'} Z`} fill={hair} />
      {braid && <path d="M24 -146 Q40 -110 30 -70" stroke={hair} strokeWidth="12" fill="none" strokeLinecap="round" />}
    </g>
  );
}

/* ------------------------------ GERBANG ------------------------------ */
function Gate() {
  const bars = Array.from({ length: 12 }, (_, i) => i);
  return (
    <g>
      <rect width={W} height={H} fill="url(#skyNight)" />
      {STARS.map((s, i) => (
        <circle key={i} className="twinkle" style={{ animationDelay: `${(i % 7) * 0.6}s` }} cx={s.x} cy={s.y} r={s.r} fill="#E7DDF5" opacity={s.o} />
      ))}
      <circle cx="930" cy="170" r="170" fill="url(#moonGlow)" />
      <circle cx="930" cy="170" r="64" fill="#E7DDF5" />
      <circle cx="912" cy="154" r="13" fill="#cfc3e6" opacity=".7" />
      <circle cx="948" cy="188" r="9" fill="#cfc3e6" opacity=".6" />
      <path d="M0 610 Q220 500 430 565 T820 540 T1200 585 V900 H0Z" fill="#23264a" />
      <path d="M0 660 Q300 590 600 640 T1200 630 V900 H0Z" fill="#1b1d3a" />
      {/* Bangunan akademi */}
      <g fill="#14152c">
        <rect x="300" y="450" width="600" height="250" />
        <rect x="248" y="380" width="112" height="320" />
        <polygon points="238,380 304,290 370,380" />
        <rect x="840" y="380" width="112" height="320" />
        <polygon points="830,380 896,290 962,380" />
        <rect x="540" y="320" width="120" height="200" />
        <polygon points="526,320 600,206 674,320" />
        <rect x="594" y="150" width="12" height="60" />
      </g>
      <circle cx="600" cy="382" r="30" fill="#D9AD75" />
      <path d="M600 360 V382 L616 392" stroke="#14152c" strokeWidth="4" fill="none" />
      <g fill="#D9AD75">
        {[330, 400, 470, 650, 720, 790].map((x) => (
          <path key={x} d={arch(x, 520, 40, 80)} />
        ))}
        <path d={arch(276, 440, 54, 100)} />
        <path d={arch(870, 440, 54, 100)} />
        <path d={arch(570, 560, 60, 140)} />
      </g>
      <circle cx="600" cy="600" r="260" fill="url(#warmGlow)" opacity=".28" />
      {/* Jalan setapak */}
      <polygon points="470,900 730,900 640,700 560,700" fill="#4e4f82" opacity=".85" />
      <polygon points="520,900 680,900 628,700 572,700" fill="#8f8fc2" opacity=".35" />
      {/* Pagar besi */}
      <g stroke="#0d0e20" strokeWidth="9" strokeLinecap="round">
        <line x1="0" y1="745" x2="430" y2="745" />
        <line x1="770" y1="745" x2="1200" y2="745" />
        {bars.map((i) => (
          <line key={i} x1={i * 36 + 10} y1="640" x2={i * 36 + 10} y2="900" />
        ))}
        {bars.map((i) => (
          <line key={`r${i}`} x1={780 + i * 36} y1="640" x2={780 + i * 36} y2="900" />
        ))}
      </g>
      <g fill="#0d0e20">
        {bars.map((i) => (
          <polygon key={i} points={`${i * 36 + 2},646 ${i * 36 + 10},620 ${i * 36 + 18},646`} />
        ))}
        {bars.map((i) => (
          <polygon key={`r${i}`} points={`${772 + i * 36},646 ${780 + i * 36},620 ${788 + i * 36},646`} />
        ))}
      </g>
    </g>
  );
}

/* ------------------------------ AULA ------------------------------ */
function Hall() {
  const books = (x0, x1) => {
    const r = rng(x0 + 7);
    const out = [];
    for (let row = 0; row < 6; row++) {
      let x = x0 + 8;
      while (x < x1 - 12) {
        const w = 8 + r() * 10;
        const h = 36 + r() * 22;
        const c = ['#7776A8', '#C8A9C8', '#91B9B4', '#D9AD75', '#A9B8DF'][Math.floor(r() * 5)];
        out.push(<rect key={`${row}-${x}`} x={x} y={190 + row * 96 + (62 - h)} width={w} height={h} fill={c} opacity=".75" />);
        x += w + 2;
      }
    }
    return out;
  };
  return (
    <g>
      <rect width={W} height={H} fill="url(#wallDark)" />
      <polygon points="0,660 1200,660 1200,900 0,900" fill="url(#floorDark)" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <line key={i} x1={i * 134 - 60} y1="900" x2={i * 100 + 100} y2="660" stroke="#7776A8" strokeOpacity=".25" strokeWidth="2" />
      ))}
      {[700, 750, 820].map((y) => (
        <line key={y} x1="0" y1={y} x2="1200" y2={y} stroke="#7776A8" strokeOpacity=".2" strokeWidth="2" />
      ))}
      {[170, 520, 870].map((x) => (
        <g key={x}>
          <polygon points={`${x},430 ${x + 160},430 ${x + 300},900 ${x - 140},900`} fill="url(#shaft)" opacity=".5" />
          <path d={arch(x, 110, 160, 340)} fill="#A9B8DF" opacity=".75" />
          <path d={arch(x, 110, 160, 340)} fill="none" stroke="#D9AD75" strokeWidth="5" />
          <line x1={x + 80} y1="190" x2={x + 80} y2="450" stroke="#D9AD75" strokeWidth="3" />
          <line x1={x} y1="300" x2={x + 160} y2="300" stroke="#D9AD75" strokeWidth="3" />
        </g>
      ))}
      {[340, 690].map((x) => (
        <rect key={x} x={x} y="80" width="34" height="590" fill="#15162c" opacity=".7" />
      ))}
      <rect x="0" y="170" width="150" height="500" fill="#1a1428" />
      <rect x="1050" y="170" width="150" height="500" fill="#1a1428" />
      {books(0, 150)}
      {books(1050, 1200)}
      <line x1="600" y1="0" x2="600" y2="70" stroke="#D9AD75" strokeWidth="3" />
      <ellipse cx="600" cy="84" rx="90" ry="16" fill="none" stroke="#D9AD75" strokeWidth="5" />
      {[-70, -35, 0, 35, 70].map((dx) => (
        <g key={dx}>
          <rect x={600 + dx - 3} y="62" width="6" height="22" fill="#F4EEDC" />
          <circle cx={600 + dx} cy="56" r="22" fill="url(#warmGlow)" />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------ ARSIP ------------------------------ */
function ArchiveScene() {
  const r = rng(99);
  const folders = [];
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 5; row++) {
      const lit = r() > 0.82;
      folders.push(
        <rect key={`${col}-${row}`} x={60 + col * 140} y={120 + row * 100} width="112" height="64" fill={lit ? '#D9AD75' : '#4a4676'} opacity={lit ? 0.9 : 0.8} />,
      );
    }
  }
  return (
    <g>
      <rect width={W} height={H} fill="url(#wallDark)" />
      <rect x="30" y="80" width="1140" height="560" fill="#151329" />
      {folders}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="30" y={110 + i * 100} width="1140" height="8" fill="#6b5a7e" />
      ))}
      <polygon points="0,640 1200,640 1200,900 0,900" fill="url(#woodFloor)" />
      <polygon points="330,900 870,900 760,640 440,640" fill="#8e7aa8" opacity=".25" />
      {[260, 600, 940].map((x) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="110" stroke="#D9AD75" strokeWidth="3" />
          <circle cx={x} cy="150" r="90" fill="url(#warmGlow)" opacity=".8" />
          <rect x={x - 18} y="110" width="36" height="52" fill="#D9AD75" opacity=".9" />
        </g>
      ))}
      <rect x="470" y="680" width="260" height="30" fill="#3b2f4f" />
      <rect x="490" y="710" width="16" height="120" fill="#2b2140" />
      <rect x="694" y="710" width="16" height="120" fill="#2b2140" />
      <ellipse cx="600" cy="675" rx="60" ry="14" fill="#D9AD75" opacity=".3" />
      <rect x="570" y="655" width="60" height="20" fill="#F4EEDC" opacity=".85" />
    </g>
  );
}

/* ------------------------------ MEJA ------------------------------ */
function Desk() {
  return (
    <g>
      <rect width={W} height={H} fill="url(#skyNight)" />
      <rect x="0" y="0" width={W} height="560" fill="#1a1b36" opacity=".75" />
      <path d={arch(430, 90, 340, 380)} fill="#2e3060" />
      <path d={arch(430, 90, 340, 380)} fill="none" stroke="#D9AD75" strokeWidth="6" />
      <circle cx="660" cy="230" r="120" fill="url(#moonGlow)" />
      <circle cx="660" cy="230" r="46" fill="#E7DDF5" />
      <line x1="600" y1="260" x2="600" y2="470" stroke="#D9AD75" strokeWidth="4" />
      <line x1="430" y1="330" x2="770" y2="330" stroke="#D9AD75" strokeWidth="4" />
      <rect x="0" y="560" width={W} height="340" fill="url(#woodFloor)" />
      <rect x="0" y="560" width={W} height="10" fill="#7776A8" opacity=".5" />
      <circle cx="220" cy="520" r="150" fill="url(#warmGlow)" opacity=".7" />
      <rect x="205" y="480" width="30" height="80" fill="#D9AD75" />
      <path d="M170 480 L200 430 H240 L270 480 Z" fill="#91B9B4" />
    </g>
  );
}

/* ------------------------------ LORONG ------------------------------ */
function Hallway({ figures }) {
  return (
    <g>
      <rect width={W} height={H} fill="url(#wallDark)" />
      <polygon points="0,0 1200,0 840,260 360,260" fill="#15162c" />
      <rect x="360" y="260" width="480" height="380" fill="#262850" />
      <polygon points="0,0 360,260 360,640 0,900" fill="#2a2c55" />
      <polygon points="1200,0 840,260 840,640 1200,900" fill="#24264b" />
      <polygon points="0,900 360,640 840,640 1200,900" fill="url(#floorDark)" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={i} x1={i * 150} y1="900" x2={360 + i * 60} y2="640" stroke="#7776A8" strokeOpacity=".22" strokeWidth="2" />
      ))}
      <polygon points="420,900 520,640 680,640 780,900" fill="#6d5a7a" opacity=".55" />
      <line x1="420" y1="900" x2="520" y2="640" stroke="#D9AD75" strokeOpacity=".6" strokeWidth="3" />
      <line x1="780" y1="900" x2="680" y2="640" stroke="#D9AD75" strokeOpacity=".6" strokeWidth="3" />
      {/* Dinding belakang */}
      {[400, 720].map((x) => (
        <g key={x}>
          <path d={arch(x, 300, 80, 170)} fill="#A9B8DF" opacity=".55" />
          <path d={arch(x, 300, 80, 170)} fill="none" stroke="#D9AD75" strokeWidth="3" />
        </g>
      ))}
      <path d={arch(540, 400, 120, 240)} fill="#14152c" />
      <path d={arch(540, 400, 120, 240)} fill="none" stroke="#D9AD75" strokeWidth="4" />
      <circle cx="640" cy="540" r="6" fill="#D9AD75" />
      {/* Papan pengumuman (dinding kiri) */}
      <polygon points="64,326 276,372 276,506 64,536" fill="#d9ad75" opacity=".35" />
      <polygon points="70,330 270,374 270,501 70,530" fill="#6b5a6e" />
      <polygon points="95,360 135,370 135,420 95,415" fill="#E7DDF5" opacity=".6" />
      <polygon points="150,376 195,386 195,431 150,425" fill="#C8A9C8" opacity=".7" />
      <polygon points="90,442 140,453 140,500 90,506" fill="#F4EEDC" opacity=".55" />
      <polygon points="212,389 258,400 258,470 212,462" fill="#F4EEDC" />
      <line x1="222" y1="406" x2="250" y2="412" stroke="#22243D" strokeWidth="3" />
      <line x1="222" y1="420" x2="250" y2="426" stroke="#22243D" strokeWidth="2" />
      <line x1="222" y1="432" x2="244" y2="437" stroke="#22243D" strokeWidth="2" />
      {/* Lukisan (dinding kanan) */}
      <polygon points="930,348 1080,305 1080,486 930,475" fill="url(#gold)" />
      <polygon points="942,360 1068,322 1068,472 942,463" fill="#2a2347" />
      <polygon points="975,400 1030,386 1030,440 975,446" fill="#7776A8" opacity=".7" />
      <circle cx="1002" cy="388" r="14" fill="#C8A9C8" opacity=".8" />
      {/* Lentera */}
      {[300, 900].map((x) => (
        <g key={x}>
          <line x1={x} y1="60" x2={x} y2="150" stroke="#D9AD75" strokeWidth="3" />
          <circle cx={x} cy="180" r="110" fill="url(#warmGlow)" opacity=".6" />
          <rect x={x - 16} y="150" width="32" height="46" fill="#D9AD75" />
        </g>
      ))}
      {figures && (
        <>
          <Figure x={880} y={720} body="#5D7F7B" skin="#C99B76" hair="#2B2B3A" cap />
          <Figure x={330} y={740} body="#91B9B4" skin="#E3B792" hair="#2A2438" braid />
        </>
      )}
    </g>
  );
}

/* ------------------------------ TAMAN ------------------------------ */
function Garden() {
  const r = rng(7);
  const flowers = Array.from({ length: 26 }, () => ({ x: 170 + r() * 320, y: 610 + r() * 60, c: ['#C8A9C8', '#D9AD75', '#E7DDF5', '#A9B8DF'][Math.floor(r() * 4)] }));
  return (
    <g>
      <rect width={W} height={H} fill="url(#skyDusk)" />
      <circle cx="600" cy="430" r="260" fill="url(#warmGlow)" opacity=".5" />
      <path d="M0 470 Q250 390 520 450 T1200 430 V620 H0Z" fill="#4b4c82" />
      <rect x="0" y="540" width={W} height="60" fill="#3a5a5a" />
      {[40, 190, 330, 820, 960, 1100].map((x) => (
        <ellipse key={x} cx={x} cy="545" rx="95" ry="55" fill="#6f9c96" />
      ))}
      <polygon points="0,560 1200,560 1200,900 0,900" fill="url(#groundGarden)" />
      <polygon points="520,900 690,900 635,560 570,560" fill="#b9a8c9" opacity=".45" />
      {/* Rumah kaca */}
      <polygon points="420,330 600,250 780,330" fill="#A9B8DF" opacity=".55" stroke="#E7DDF5" strokeWidth="3" />
      <rect x="420" y="330" width="360" height="230" fill="#A9B8DF" opacity=".35" stroke="#E7DDF5" strokeWidth="3" />
      {[480, 540, 660, 720].map((x) => (
        <line key={x} x1={x} y1="330" x2={x} y2="560" stroke="#E7DDF5" strokeWidth="2" opacity=".7" />
      ))}
      <line x1="420" y1="440" x2="780" y2="440" stroke="#E7DDF5" strokeWidth="2" opacity=".7" />
      <rect x="565" y="440" width="70" height="120" fill="#22243d" opacity=".75" stroke="#D9AD75" strokeWidth="3" />
      <rect x="585" y="486" width="30" height="34" fill="#F5E58A" />
      <circle cx="600" cy="400" r="70" fill="url(#warmGlow)" opacity=".35" />
      {/* Petak bunga */}
      <ellipse cx="330" cy="650" rx="200" ry="64" fill="#3a2a3f" />
      {flowers.map((f, i) => (
        <g key={i}>
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 40} stroke="#6f9c96" strokeWidth="3" />
          <circle cx={f.x} cy={f.y} r="10" fill={f.c} />
          <circle cx={f.x} cy={f.y} r="4" fill="#22243D" opacity=".55" />
        </g>
      ))}
      {/* Papan jadwal di balik semak */}
      <rect x="150" y="372" width="10" height="150" fill="#5a4a5e" />
      <rect x="112" y="380" width="94" height="72" fill="#2f3159" stroke="#D9AD75" strokeWidth="3" />
      <line x1="126" y1="404" x2="192" y2="404" stroke="#E7DDF5" strokeWidth="3" opacity=".8" />
      <line x1="126" y1="424" x2="178" y2="424" stroke="#E7DDF5" strokeWidth="3" opacity=".8" />
      <ellipse cx="128" cy="440" rx="40" ry="26" fill="#6f9c96" />
      <ellipse cx="190" cy="392" rx="32" ry="20" fill="#5d8a85" />
      {/* Selang */}
      {[56, 44, 32, 20].map((rx, i) => (
        <ellipse key={rx} cx="216" cy="760" rx={rx * 1.5} ry={rx * 0.5} fill="none" stroke="#3f8f7e" strokeWidth="9" opacity={1 - i * 0.12} />
      ))}
      <path d="M268 760 Q340 790 420 800" stroke="#3f8f7e" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* Tangki penyiram */}
      <rect x="880" y="470" width="110" height="150" fill="#5d7f9b" />
      <ellipse cx="935" cy="470" rx="55" ry="14" fill="#7da0be" />
      <ellipse cx="935" cy="620" rx="55" ry="14" fill="#4a6a85" />
      <rect x="896" y="520" width="78" height="40" fill="#F4EEDC" />
      <text x="935" y="548" textAnchor="middle" fontSize="22" fontFamily="DM Mono, monospace" fill="#22243D">180 L</text>
      <path d="M990 600 H1030 V570" stroke="#D9AD75" strokeWidth="7" fill="none" />
      {/* Tiang lentera */}
      {[80, 1110].map((x) => (
        <g key={x}>
          <rect x={x - 4} y="480" width="8" height="150" fill="#14152c" />
          <circle cx={x} cy="470" r="62" fill="url(#warmGlow)" opacity=".7" />
          <rect x={x - 12} y="452" width="24" height="34" fill="#D9AD75" />
        </g>
      ))}
      {[200, 450, 760, 1010, 880].map((x, i) => (
        <circle key={i} className="firefly" style={{ animationDelay: `${i * 0.9}s` }} cx={x} cy={600 + (i % 3) * 50} r="4" fill="#F5E58A" />
      ))}
    </g>
  );
}

/* ------------------------------ RUANG PERAWATAN ------------------------------ */
function Maintenance() {
  return (
    <g>
      <rect width={W} height={H} fill="#1b1f3d" />
      <rect width={W} height="640" fill="url(#wallDark)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1="0" y1={90 * i + 40} x2={W} y2={90 * i + 40} stroke="#7776A8" strokeOpacity=".12" strokeWidth="2" />
      ))}
      <polygon points="0,640 1200,640 1200,900 0,900" fill="url(#woodFloor)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={i * 170} y1="900" x2={i * 150 + 40} y2="640" stroke="#241f3a" strokeWidth="3" />
      ))}
      {/* Pipa */}
      <g stroke="#6877b8" strokeLinecap="round" fill="none">
        <path d="M0 175 H1200" strokeWidth="28" />
        <path d="M0 168 H1200" strokeWidth="6" stroke="#A9B8DF" opacity=".5" />
        <path d="M240 175 V330" strokeWidth="22" />
        <path d="M450 175 V330" strokeWidth="22" />
        <path d="M980 175 V240" strokeWidth="22" />
      </g>
      {[240, 560, 980].map((x) => (
        <circle key={x} cx={x} cy="175" r="22" fill="url(#gold)" />
      ))}
      {/* Meteran */}
      <circle cx="360" cy="360" r="108" fill="url(#gold)" />
      <circle cx="360" cy="360" r="90" fill="#F4EEDC" />
      <g fontFamily="DM Mono, monospace" fontSize="30" fill="#22243D">
        {['1', '5', '6', '0'].map((d, i) => (
          <g key={i}>
            <rect x={296 + i * 36} y="338" width="30" height="40" fill="#22243D" />
            <text x={311 + i * 36} y="368" textAnchor="middle" fill="#F4EEDC">{d}</text>
          </g>
        ))}
      </g>
      <circle cx="360" cy="296" r="14" fill="none" stroke="#22243D" strokeWidth="3" />
      <line x1="360" y1="296" x2="368" y2="284" stroke="#22243D" strokeWidth="3" />
      <text x="360" y="420" textAnchor="middle" fontSize="16" fontFamily="DM Mono, monospace" fill="#4a4c72">LITER</text>
      {/* Rak peralatan */}
      <rect x="40" y="410" width="220" height="14" fill="#6b5a7e" />
      <rect x="40" y="520" width="220" height="14" fill="#6b5a7e" />
      {[60, 110, 160, 210].map((x, i) => (
        <rect key={x} x={x} y={450 - (i % 2) * 6} width="26" height={40 + (i % 2) * 6} fill={['#91B9B4', '#C8A9C8', '#D9AD75', '#A9B8DF'][i]} />
      ))}
      {[70, 130, 190].map((x, i) => (
        <rect key={x} x={x} y="560" width="40" height={34 + i * 4} fill="#4a4676" />
      ))}
      {/* Papan klip */}
      <rect x="1000" y="260" width="108" height="150" fill="#6b5a7e" />
      <rect x="1012" y="276" width="84" height="122" fill="#F4EEDC" />
      <rect x="1034" y="252" width="40" height="22" fill="url(#gold)" />
      {[300, 322, 344, 366].map((y) => (
        <g key={y}>
          <rect x="1022" y={y - 6} width="10" height="10" fill="none" stroke="#22243D" strokeWidth="2" />
          <line x1="1040" y1={y} x2="1086" y2={y} stroke="#22243D" strokeWidth="3" />
        </g>
      ))}
      {/* Meja */}
      <rect x="640" y="600" width="480" height="26" fill="#4a3f5e" />
      <rect x="660" y="626" width="22" height="190" fill="#352c4a" />
      <rect x="1080" y="626" width="22" height="190" fill="#352c4a" />
      <rect x="840" y="574" width="130" height="28" fill="#F4EEDC" />
      <rect x="850" y="552" width="120" height="24" fill="#E7DDF5" />
      <rect x="700" y="578" width="90" height="24" fill="#6a85b8" />
      <circle cx="1060" cy="560" r="100" fill="url(#warmGlow)" />
      <path d="M1040 600 V540 L1090 520" stroke="#D9AD75" strokeWidth="7" fill="none" />
      <path d="M1070 510 L1120 530 L1090 560 Z" fill="#91B9B4" />
    </g>
  );
}

const SCENES = { gate: Gate, hall: Hall, archive: ArchiveScene, desk: Desk, hallway: Hallway, garden: Garden, maintenance: Maintenance };

export default function SceneBackground({ id = 'hall', figures = false, className = '' }) {
  const Scene = SCENES[id] || Hall;
  return (
    <div className={`scene-bg scene-${id} ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <Defs />
        <Scene figures={figures} />
      </svg>
      <div className="scene-fog" />
      <div className="scene-dust" />
      <div className="scene-vignette" />
    </div>
  );
}
