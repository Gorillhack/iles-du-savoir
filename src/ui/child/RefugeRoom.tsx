import { useCompanion } from '../../companion/CompanionProvider';
import { CompanionBubble } from '../../companion/Pepin';
import { PepinFigure } from '../../companion/PepinFigure';
import type { Child } from '../../domain/types';
import { Icon } from '../components/Icon';
import { refugeItemArt } from '../components/Illustrations';

/** Positions des accessoires débloqués dans la pièce (coordonnées du décor 360 × 240). */
const PLACES: Record<string, { x: number; y: number }> = {
  etagere: { x: 142, y: 66 },
  lanterne: { x: 112, y: 14 },
  hamac: { x: 262, y: 126 },
  plante: { x: 318, y: 150 },
  'longue-vue': { x: 206, y: 116 },
  coussin: { x: 236, y: 190 },
};

/**
 * Décor du refuge : vectoriel avec traitement « peinture » (grain, bords irréguliers,
 * dégradés chauds) pour se rapprocher des illustrations de la planche.
 */
function RoomArt({ shown }: { shown: string[] }) {
  return (
    <svg viewBox="0 0 360 240" className="refuge-room__art" aria-hidden focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="r-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EBD3AE" /><stop offset="1" stopColor="#F6E6CC" /></linearGradient>
        <linearGradient id="r-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B98455" /><stop offset="1" stopColor="#9C6C45" /></linearGradient>
        <radialGradient id="r-glow" cx="0.34" cy="0.18" r="0.55"><stop offset="0" stopColor="#FFE7A8" stopOpacity="0.55" /><stop offset="1" stopColor="#FFE7A8" stopOpacity="0" /></radialGradient>
        <radialGradient id="r-sky" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#5A6BA8" /><stop offset="1" stopColor="#25345B" /></radialGradient>
        <linearGradient id="r-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF6E2" /><stop offset="1" stopColor="#EED9B0" /></linearGradient>
      </defs>
      <g filter="url(#paint-soft)">
        {/* Murs en planches arrondies, comme l'intérieur d'un arbre */}
        <rect width="360" height="240" fill="url(#r-wall)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M${i * 38 + 6} 0 Q${i * 38 + 10} 85 ${i * 38 + 4} 172`} stroke="#D9B98F" strokeWidth="2" fill="none" opacity="0.7" />
        ))}
        <path d="M0 0 H360 V14 Q180 30 0 14Z" fill="#8F5A2C" opacity="0.85" />

        {/* Fenêtre ronde sur le ciel du soir */}
        <circle cx="282" cy="66" r="40" fill="url(#r-sky)" />
        <circle cx="268" cy="52" r="1.8" fill="#FFF8EC" /><circle cx="296" cy="78" r="1.4" fill="#FFF8EC" /><circle cx="290" cy="46" r="1.4" fill="#F6C65B" />
        <path d="M250 96 Q268 78 288 92 Q300 84 314 94 L314 106 L250 106Z" fill="#38B8AC" opacity="0.55" />
        <path d="M242 66 H322 M282 26 V106" stroke="#A9774D" strokeWidth="4" />
        <circle cx="282" cy="66" r="40" fill="none" stroke="#A9774D" strokeWidth="8" />

        {/* Carte des îles punaisée au mur */}
        <g transform="rotate(-3 72 62)">
          <rect x="26" y="30" width="92" height="64" rx="4" fill="url(#r-paper)" stroke="#C9A878" strokeWidth="1.5" />
          <ellipse cx="50" cy="52" rx="12" ry="5" fill="#38B8AC" opacity="0.75" />
          <ellipse cx="88" cy="46" rx="10" ry="4" fill="#8B78D8" opacity="0.7" />
          <ellipse cx="76" cy="76" rx="14" ry="5" fill="#D65A2E" opacity="0.65" />
          <path d="M50 52 Q66 66 76 76 M76 76 Q84 60 88 46" stroke="#25345B" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
          <path d="M100 74 l6 6 m0 -6 l-6 6" stroke="#B3261E" strokeWidth="1.8" />
          <circle cx="32" cy="35" r="2.6" fill="#B3261E" /><circle cx="112" cy="35" r="2.6" fill="#B3261E" />
        </g>

        {/* Sol, tapis */}
        <rect y="168" width="360" height="72" fill="url(#r-floor)" />
        {[186, 204, 222].map((y) => <path key={y} d={`M0 ${y} H360`} stroke="#8A5C3A" strokeWidth="1" opacity="0.35" />)}
        <ellipse cx="170" cy="208" rx="112" ry="20" fill="#D65A2E" opacity="0.9" />
        <ellipse cx="170" cy="208" rx="92" ry="14" fill="none" stroke="#F6C65B" strokeWidth="3" strokeDasharray="4 6" />

        {/* Caisse et carnet de bord ouvert */}
        <rect x="18" y="160" width="74" height="40" rx="4" fill="#A9774D" />
        <path d="M18 172 H92 M18 186 H92" stroke="#7E5532" strokeWidth="1.5" />
        <g transform="translate(22 140) rotate(-4)">
          <path d="M2 10 Q18 2 34 8 L34 30 Q18 24 2 32Z" fill="#FFF6E2" stroke="#8B78D8" strokeWidth="2" />
          <path d="M34 8 Q50 2 66 10 L66 32 Q50 24 34 30Z" fill="#FFF0D4" stroke="#8B78D8" strokeWidth="2" />
          <path d="M8 14 H28 M8 19 H26 M8 24 H24 M40 14 H60 M40 19 H58" stroke="#8C95B3" strokeWidth="1.3" />
          <path d="M34 8 V30" stroke="#5640AE" strokeWidth="1.5" />
          <path d="M60 30 L62 42 L57 38 L53 42 L55 30Z" fill="#38B8AC" />
        </g>
        <rect width="360" height="240" fill="url(#r-glow)" />
      </g>

      {/* Accessoires débloqués, dans la pièce */}
      <g filter="url(#paint-soft)">
        {shown.map((id) => (PLACES[id] && refugeItemArt[id] ? <g key={id}>{refugeItemArt[id](PLACES[id])}</g> : null))}
      </g>
    </svg>
  );
}

export function RefugeRoom({ child, onCarnet, onIles }: { child: Child; onCarnet: () => void; onIles: () => void }) {
  const c = useCompanion();
  const poke = () => c?.emit({ type: 'poke' });
  const name = child.companionName;

  return (
    <div>
      <div className="refuge-room" role="group" aria-label={`Le refuge de ${name}`}>
        <RoomArt shown={child.refugeShown} />

        <button type="button" className="hotspot" style={{ left: '4%', top: '54%', width: '24%', height: '30%' }} onClick={onCarnet} aria-label="Ouvrir mon carnet de bord">
          <span className="hotspot__tag"><Icon name="list" size={14} /> Carnet</span>
        </button>
        <button type="button" className="hotspot" style={{ left: '6%', top: '11%', width: '28%', height: '30%' }} onClick={onIles} aria-label="Ouvrir la carte des îles">
          <span className="hotspot__tag"><Icon name="map" size={14} /> Carte des îles</span>
        </button>

        <div className="refuge-room__pepin">
          <button type="button" className="hotspot hotspot--pepin" onClick={poke} aria-label={`Toucher ${name}`}>
            {c && <PepinFigure state={c.state} size={100} still={c.still} seq={c.seq} fluid />}
            <span className="hotspot__tag">{name}</span>
          </button>
        </div>
      </div>

      {/* Bulle sous le décor : la scène reste lisible, même sur téléphone. */}
      <div className="refuge-room__say" aria-live="polite">
        {c?.message && <CompanionBubble key={c.seq} message={c.message} name={name} voice={c.voice} onClose={c.dismiss} />}
      </div>

      {/* Raccourcis explicites, utiles sur petit écran */}
      <div className="refuge-shortcuts">
        <button type="button" className="refuge-shortcut" onClick={onCarnet}><Icon name="list" size={22} /> Ouvrir le carnet</button>
        <button type="button" className="refuge-shortcut" onClick={onIles}><Icon name="map" size={22} /> Voir les îles</button>
        <button type="button" className="refuge-shortcut" onClick={poke}><Icon name="sparkle" size={22} /> Coucou {name} !</button>
      </div>
    </div>
  );
}
