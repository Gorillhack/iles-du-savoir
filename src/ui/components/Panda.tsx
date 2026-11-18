import imgAccueil from '../../assets/panda-accueil.webp';
import imgCelebration from '../../assets/panda-celebration.webp';
import imgExplication from '../../assets/panda-explication.webp';
import imgReflexion from '../../assets/panda-reflexion.webp';

/**
 * Compagnon panda roux.
 * Les illustrations viennent de la planche visuelle (recadrées, bords fondus).
 * Le dessin SVG ci-dessous sert de repli et pour les expressions absentes de la planche.
 */
export type PandaMood = 'accueil' | 'reflexion' | 'encouragement' | 'explication' | 'celebration';

const C = {
  fur: '#D65A2E',
  furDark: '#A9431F',
  ring: '#8E3618',
  cream: '#FFF3E0',
  paw: '#3B2219',
  eye: '#24160F',
  scarf: '#38B8AC',
  scarfDark: '#27877E',
  bag: '#B9773F',
  bagDark: '#8F5A2C',
  strap: '#C98B4E',
  sun: '#F6C65B',
  violet: '#8B78D8',
  blush: '#F28B82',
};

interface Props {
  mood?: PandaMood;
  size?: number;
  /** Texte alternatif ; vide si purement décoratif. */
  label?: string;
  animated?: boolean;
  className?: string;
}

const Arm = ({ d, paw }: { d: string; paw: [number, number] }) => (
  <g>
    <path d={d} stroke={C.paw} strokeWidth={17} strokeLinecap="round" fill="none" />
    <circle cx={paw[0]} cy={paw[1]} r={9.5} fill={C.paw} />
  </g>
);

const Sparkle = ({ x, y, s = 1, color = C.sun }: { x: number; y: number; s?: number; color?: string }) => (
  <path
    className="panda-sparkle"
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -9 Q2 -2 9 0 Q2 2 0 9 Q-2 2 -9 0 Q-2 -2 0 -9Z"
    fill={color}
  />
);

/** Illustrations disponibles. « Encouragement » n'a pas de pose dédiée sur la planche : on réutilise les poings levés. */
const ART: Partial<Record<PandaMood, { src: string; ratio: number }>> = {
  accueil: { src: imgAccueil, ratio: 390 / 360 },
  reflexion: { src: imgReflexion, ratio: 293 / 260 },
  explication: { src: imgExplication, ratio: 292 / 260 },
  encouragement: { src: imgCelebration, ratio: 285 / 260 },
  celebration: { src: imgCelebration, ratio: 285 / 260 },
};

export function Panda(props: Props & { vector?: boolean }) {
  const { mood = 'accueil', size = 160, label, animated = true, className = '', vector } = props;
  const art = ART[mood];
  if (art && !vector) {
    return (
      <img
        src={art.src}
        width={size}
        height={Math.round(size * art.ratio)}
        alt={label ?? ''}
        aria-hidden={label ? undefined : true}
        draggable={false}
        className={`panda panda-img panda--${mood} ${animated ? 'panda--anim' : ''} ${className}`}
      />
    );
  }
  return <PandaVector {...props} />;
}

function PandaVector({ mood = 'accueil', size = 160, label, animated = true, className = '' }: Props) {
  const happyEyes = mood === 'celebration';
  const lookUp = mood === 'reflexion';
  const openMouth = mood === 'celebration' || mood === 'explication';

  const leftArm =
    mood === 'celebration' ? <Arm d="M70 130 Q44 108 38 76" paw={[38, 74]} />
    : mood === 'explication' ? <Arm d="M70 130 Q52 126 38 114" paw={[36, 112]} />
    : <Arm d="M70 130 Q60 150 66 170" paw={[66, 172]} />;

  const rightArm =
    mood === 'accueil' ? <Arm d="M130 130 Q160 116 166 84" paw={[166, 82]} />
    : mood === 'reflexion' ? <Arm d="M130 130 Q132 116 118 108" paw={[116, 106]} />
    : mood === 'encouragement' ? <Arm d="M130 130 Q158 124 158 98" paw={[158, 96]} />
    : mood === 'celebration' ? <Arm d="M130 130 Q156 108 162 76" paw={[162, 74]} />
    : <Arm d="M130 130 Q140 148 136 164" paw={[136, 166]} />;

  return (
    <svg
      viewBox="0 0 200 210"
      width={size}
      height={(size * 210) / 200}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`panda panda--${mood} ${animated ? 'panda--anim' : ''} ${className}`}
    >
      {/* Queue rayée */}
      <g className="panda-tail">
        <path d="M128 176 Q176 172 178 128 Q180 96 160 86" stroke={C.fur} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d="M128 176 Q176 172 178 128 Q180 96 160 86" stroke={C.ring} strokeWidth={30} strokeDasharray="9 13" strokeDashoffset={-6} fill="none" />
        <circle cx={160} cy={86} r={11} fill={C.ring} />
      </g>

      <g className="panda-body">
        {/* Corps */}
        <ellipse cx={100} cy={152} rx={42} ry={40} fill={C.fur} />
        <ellipse cx={100} cy={162} rx={25} ry={25} fill={C.paw} opacity={0.85} />
        {/* Pieds */}
        <ellipse cx={80} cy={190} rx={17} ry={9} fill={C.paw} />
        <ellipse cx={120} cy={190} rx={17} ry={9} fill={C.paw} />

        {/* Sacoche et bandoulière */}
        <path d="M72 118 L130 166" stroke={C.strap} strokeWidth={5} strokeLinecap="round" />
        <rect x={116} y={154} width={28} height={23} rx={6} fill={C.bag} />
        <path d="M116 160 Q130 170 144 160 L144 158 Q144 154 140 154 L120 154 Q116 154 116 158Z" fill={C.bagDark} />
        <rect x={127} y={162} width={6} height={5} rx={1.5} fill={C.sun} />


        {/* Livret tenu pendant l'explication */}
        {mood === 'explication' && (
          <g>
            <rect x={122} y={134} width={32} height={26} rx={3} fill={C.violet} transform="rotate(-8 138 147)" />
            <rect x={125} y={136} width={26} height={21} rx={2} fill={C.cream} transform="rotate(-8 138 147)" />
            <path d="M129 143 L146 140 M130 148 L147 145 M131 153 L141 151" stroke={C.violet} strokeWidth={2} strokeLinecap="round" />
            <circle cx={136} cy={166} r={9.5} fill={C.paw} />
          </g>
        )}

        {/* Foulard turquoise */}
        <path d="M62 112 Q100 134 138 112 Q141 122 136 128 Q100 148 64 128 Q59 122 62 112Z" fill={C.scarf} />
        <path d="M80 128 L70 154 Q76 156 86 150 L92 131Z" fill={C.scarfDark} />
        <path d="M82 128 L94 150 Q100 148 102 142 L96 130Z" fill={C.scarf} />
      </g>

      <g className="panda-head">
        {/* Oreilles */}
        <path d="M50 66 Q44 26 76 32 Q86 46 84 58Z" fill={C.fur} stroke={C.cream} strokeWidth={4} strokeLinejoin="round" />
        <path d="M57 58 Q55 38 73 40 Q78 48 77 55Z" fill={C.paw} />
        <path d="M150 66 Q156 26 124 32 Q114 46 116 58Z" fill={C.fur} stroke={C.cream} strokeWidth={4} strokeLinejoin="round" />
        <path d="M143 58 Q145 38 127 40 Q122 48 123 55Z" fill={C.paw} />

        {/* Tête */}
        <ellipse cx={100} cy={80} rx={52} ry={43} fill={C.fur} />
        {/* Masque crème */}
        <ellipse cx={64} cy={94} rx={15} ry={13} fill={C.cream} />
        <ellipse cx={136} cy={94} rx={15} ry={13} fill={C.cream} />
        <ellipse cx={100} cy={98} rx={21} ry={16} fill={C.cream} />
        <ellipse cx={82} cy={60} rx={8} ry={5} fill={C.cream} transform="rotate(-12 82 60)" />
        <ellipse cx={118} cy={60} rx={8} ry={5} fill={C.cream} transform="rotate(12 118 60)" />
        {/* Joues rosées */}
        <ellipse cx={66} cy={99} rx={7} ry={4} fill={C.blush} opacity={0.45} />
        <ellipse cx={134} cy={99} rx={7} ry={4} fill={C.blush} opacity={0.45} />

        {/* Yeux */}
        {happyEyes ? (
          <g stroke={C.eye} strokeWidth={4} strokeLinecap="round" fill="none">
            <path d="M77 79 Q84 70 91 79" />
            <path d="M109 79 Q116 70 123 79" />
          </g>
        ) : (
          <g className="panda-eyes">
            <ellipse cx={84} cy={78} rx={6.5} ry={7.5} fill={C.eye} />
            <ellipse cx={116} cy={78} rx={6.5} ry={7.5} fill={C.eye} />
            <circle cx={lookUp ? 87 : 86} cy={lookUp ? 73 : 75} r={2.4} fill="#fff" />
            <circle cx={lookUp ? 119 : 118} cy={lookUp ? 73 : 75} r={2.4} fill="#fff" />
          </g>
        )}
        {mood === 'encouragement' && (
          <g stroke={C.paw} strokeWidth={3} strokeLinecap="round">
            <path d="M76 64 Q83 60 90 63" />
            <path d="M110 63 Q117 60 124 64" />
          </g>
        )}
        {mood === 'reflexion' && (
          <g stroke={C.paw} strokeWidth={3} strokeLinecap="round">
            <path d="M77 66 Q84 64 91 66" />
            <path d="M109 63 Q116 59 123 62" />
          </g>
        )}

        {/* Truffe */}
        <path d="M92 89 Q100 84 108 89 Q105 96 100 97 Q95 96 92 89Z" fill={C.eye} />
        {/* Bouche */}
        {openMouth ? (
          <g>
            <path d="M92 101 Q100 100 108 101 Q106 112 100 112 Q94 112 92 101Z" fill={C.eye} />
            <path d="M95 108 Q100 104 105 108 Q103 112 100 112 Q97 112 95 108Z" fill={C.blush} />
          </g>
        ) : mood === 'reflexion' ? (
          <path d="M96 104 Q101 102 105 105" stroke={C.eye} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        ) : (
          <path d="M100 97 Q100 102 93 103 M100 97 Q100 102 107 103" stroke={C.eye} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        )}
      </g>

      {leftArm}
      {mood !== 'reflexion' && mood !== 'explication' && rightArm}

      {/* Patte à la joue pendant la réflexion (devant la tête) */}
      {mood === 'reflexion' && (
        <g>
          <path d="M130 130 Q134 118 120 110" stroke={C.paw} strokeWidth={17} strokeLinecap="round" fill="none" />
          <circle cx={118} cy={108} r={9.5} fill={C.paw} />
          <circle className="panda-think" cx={156} cy={52} r={4} fill={C.violet} />
          <circle className="panda-think" cx={167} cy={39} r={5.5} fill={C.violet} />
          <circle className="panda-think" cx={181} cy={24} r={7.5} fill={C.violet} />
        </g>
      )}

      {mood === 'celebration' && (
        <g>
          <Sparkle x={24} y={60} s={1.1} />
          <Sparkle x={178} y={52} s={0.9} />
          <Sparkle x={30} y={128} s={0.6} color={C.scarf} />
          <Sparkle x={176} y={140} s={0.7} color={C.violet} />
        </g>
      )}
      {mood === 'accueil' && (
        <g stroke={C.sun} strokeWidth={3} strokeLinecap="round" className="panda-wave">
          <path d="M180 70 Q186 78 184 88" fill="none" />
          <path d="M188 64 Q196 76 193 90" fill="none" />
        </g>
      )}
    </svg>
  );
}
