/** Décors vectoriels de l'univers : îles flottantes, nuages, refuge et accessoires. */

export function FloatingIsland({ color = '#38B8AC', size = 120, detail = 'tree', className = '' }: { color?: string; size?: number; detail?: 'tree' | 'hut' | 'flag' | 'rocks'; className?: string }) {
  return (
    <svg viewBox="0 0 140 110" width={size} height={(size * 110) / 140} aria-hidden className={`island ${className}`}>
      <ellipse cx={70} cy={104} rx={34} ry={4} fill="#25345B" opacity={0.08} />
      {/* Roche */}
      <path d="M18 56 Q70 64 122 56 Q112 78 92 88 Q78 100 70 102 Q60 96 48 88 Q28 78 18 56Z" fill="#B98D6A" />
      <path d="M40 70 Q70 76 100 70 Q90 84 76 92 Q66 90 56 84Z" fill="#9C7254" />
      {/* Herbe */}
      <ellipse cx={70} cy={55} rx={54} ry={12} fill={color} />
      <ellipse cx={70} cy={52} rx={50} ry={9} fill="#fff" opacity={0.18} />
      {detail === 'tree' && (
        <g>
          <rect x={83} y={28} width={5} height={24} rx={2} fill="#7A5236" />
          <circle cx={86} cy={26} r={14} fill="#5FA35A" />
          <circle cx={78} cy={30} r={9} fill="#6DB667" />
        </g>
      )}
      {detail === 'hut' && (
        <g>
          <rect x={56} y={32} width={28} height={20} rx={3} fill="#E8B67A" />
          <path d="M50 34 L70 18 L90 34Z" fill="#D65A2E" />
          <rect x={66} y={40} width={8} height={12} rx={2} fill="#7A5236" />
          <circle cx={80} cy={40} r={2.5} fill="#F6C65B" />
        </g>
      )}
      {detail === 'flag' && (
        <g>
          <rect x={68} y={18} width={3} height={36} fill="#7A5236" />
          <path d="M71 18 L92 24 L71 31Z" fill="#F6C65B" />
        </g>
      )}
      {detail === 'rocks' && (
        <g>
          <ellipse cx={58} cy={48} rx={10} ry={7} fill="#C9C1B5" />
          <ellipse cx={80} cy={47} rx={7} ry={5} fill="#D9D2C6" />
        </g>
      )}
    </svg>
  );
}

export function Cloud({ className = '', width = 90 }: { className?: string; width?: number }) {
  return (
    <svg viewBox="0 0 90 40" width={width} height={(width * 40) / 90} aria-hidden className={`cloud ${className}`}>
      <path d="M14 34 Q2 34 4 24 Q6 16 16 18 Q18 6 32 8 Q40 0 52 6 Q66 2 70 14 Q86 14 86 26 Q86 34 76 34Z" fill="#fff" opacity={0.9} />
    </svg>
  );
}

/* ------------------------- Accessoires du refuge ------------------------- */

const items: Record<string, (p: { x: number; y: number }) => React.ReactElement> = {
  lanterne: ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M14 0 V8" stroke="#5B4636" strokeWidth={2} />
      <rect x={4} y={8} width={20} height={4} rx={2} fill="#5B4636" />
      <rect x={6} y={12} width={16} height={22} rx={4} fill="#F6C65B" />
      <rect x={9} y={15} width={10} height={16} rx={3} fill="#FFF3C4" />
      <rect x={4} y={34} width={20} height={4} rx={2} fill="#5B4636" />
      <circle cx={14} cy={22} r={18} fill="#F6C65B" opacity={0.18} />
    </g>
  ),
  coussin: ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M2 18 Q0 4 14 4 L46 4 Q60 4 58 18 Q60 30 46 30 L14 30 Q0 30 2 18Z" fill="#8B78D8" />
      <path d="M10 17 H50" stroke="#B3A5EA" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 6" />
    </g>
  ),
  plante: ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M8 38 L28 38 L25 56 L11 56Z" fill="#D65A2E" />
      <path d="M18 38 Q14 22 4 16 M18 38 Q20 18 30 8 M18 38 Q24 28 34 26" stroke="#3E8C43" strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={5} cy={15} rx={6} ry={4} fill="#5FA35A" />
      <ellipse cx={30} cy={8} rx={6} ry={4} fill="#5FA35A" />
      <ellipse cx={34} cy={26} rx={6} ry={4} fill="#6DB667" />
      <ellipse cx={14} cy={26} rx={5} ry={3.5} fill="#6DB667" />
    </g>
  ),
  etagere: ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={28} width={70} height={5} rx={2} fill="#8F5A2C" />
      <rect x={4} y={6} width={9} height={22} rx={1.5} fill="#38B8AC" />
      <rect x={14} y={10} width={8} height={18} rx={1.5} fill="#F6C65B" />
      <rect x={23} y={4} width={10} height={24} rx={1.5} fill="#8B78D8" />
      <rect x={36} y={12} width={18} height={16} rx={1.5} fill="#D65A2E" transform="rotate(-12 45 20)" />
      <circle cx={62} cy={22} r={6} fill="#B98D6A" />
    </g>
  ),
  'longue-vue': ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M18 22 L8 52 M18 22 L28 52 M18 22 L18 52" stroke="#5B4636" strokeWidth={3} strokeLinecap="round" />
      <rect x={0} y={10} width={44} height={11} rx={5} fill="#25345B" transform="rotate(-20 22 15)" />
      <rect x={30} y={3} width={14} height={13} rx={4} fill="#F6C65B" transform="rotate(-20 37 9)" />
    </g>
  ),
  hamac: ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 L12 18 M90 0 L78 18" stroke="#8F5A2C" strokeWidth={3} strokeLinecap="round" />
      <path d="M10 16 Q45 44 80 16 Q45 34 10 16Z" fill="#38B8AC" />
      <path d="M18 22 Q45 38 72 22" stroke="#fff" strokeWidth={2} fill="none" opacity={0.6} />
    </g>
  ),
};

export function RefugeScene({ shown, children }: { shown: string[]; children?: React.ReactNode }) {
  const has = (id: string) => shown.includes(id);
  return (
    <div className="refuge-scene">
      <svg viewBox="0 0 360 240" className="refuge-svg" role="img" aria-label={`Intérieur du refuge${shown.length ? `, avec : ${shown.join(', ')}` : ''}`}>
        {/* Murs en bois et fenêtre ronde */}
        <rect x={0} y={0} width={360} height={240} fill="#F3DFC1" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={i * 40} y={0} width={1.5} height={170} fill="#E2C59E" />
        ))}
        <circle cx={250} cy={70} r={42} fill="#25345B" />
        <circle cx={250} cy={70} r={36} fill="#3A4C7E" />
        <circle cx={236} cy={58} r={2} fill="#FFF8EC" />
        <circle cx={262} cy={80} r={1.5} fill="#FFF8EC" />
        <circle cx={258} cy={52} r={1.2} fill="#F6C65B" />
        <path d="M232 92 Q250 74 270 92" fill="#38B8AC" opacity={0.6} />
        <path d="M214 70 H286 M250 34 V106" stroke="#B98D6A" strokeWidth={4} />
        <circle cx={250} cy={70} r={42} fill="none" stroke="#B98D6A" strokeWidth={7} />
        {/* Sol et tapis */}
        <rect x={0} y={170} width={360} height={70} fill="#C99A6B" />
        <ellipse cx={170} cy={205} rx={110} ry={20} fill="#D65A2E" opacity={0.85} />
        <ellipse cx={170} cy={205} rx={90} ry={14} fill="none" stroke="#F6C65B" strokeWidth={3} strokeDasharray="4 6" />
        {has('etagere') && items.etagere({ x: 30, y: 60 })}
        {has('lanterne') && items.lanterne({ x: 120, y: 20 })}
        {has('hamac') && items.hamac({ x: 200, y: 120 })}
        {has('plante') && items.plante({ x: 310, y: 118 })}
        {has('longue-vue') && items['longue-vue']({ x: 300, y: 60 })}
        {has('coussin') && items.coussin({ x: 40, y: 178 })}
      </svg>
      {children}
    </div>
  );
}

export function RefugeItemPreview({ id }: { id: string }) {
  const draw = items[id];
  return (
    <svg viewBox="-6 -6 102 72" width={72} height={52} aria-hidden>
      {draw?.({ x: 0, y: 0 })}
    </svg>
  );
}
