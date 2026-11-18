import accBody from '../assets/pepin/accueil-body.webp';
import accArm from '../assets/pepin/accueil-arm.webp';
import accTail from '../assets/pepin/accueil-tail.webp';
import poseCelebration from '../assets/pepin/celebration.webp';
import poseExplication from '../assets/pepin/explication.webp';
import poseReflexion from '../assets/pepin/reflexion.webp';
import { POSE_OF, type PepinPose, type PepinState } from './types';

/**
 * Rendu de Pépin, sans logique.
 *
 * Ce qui est réellement animé avec les ressources actuelles :
 * - pose d'accueil découpée en 3 calques (corps, bras levé, queue) :
 *   le bras fait coucou en pivotant à l'épaule, la queue se balance à sa base ;
 * - clignement : paupières vectorielles posées sur les yeux de l'illustration ;
 * - respiration : légère dilatation verticale depuis les pieds.
 * Les autres poses (réflexion, encouragement, célébration) sont des images entières :
 * elles apparaissent en fondu et ne font qu'un petit mouvement d'ensemble.
 */
const POSES: Record<Exclude<PepinPose, 'accueil'>, { src: string; w: number; h: number }> = {
  reflexion: { src: poseReflexion, w: 320, h: 333 },
  explication: { src: poseExplication, w: 320, h: 305 },
  celebration: { src: poseCelebration, w: 320, h: 332 },
};

/** Boîte commune (ratio de la pose d'accueil, 440 × 460) : pas de saut de mise en page entre états. */
const RATIO = 460 / 440;

function Lids({ closed }: { closed: boolean }) {
  // Coordonnées dans l'illustration source (630 × 660).
  return (
    <svg className={`pepin__lids ${closed ? 'pepin__lids--closed' : ''}`} viewBox="0 0 630 660" aria-hidden focusable="false">
      <defs>
        <linearGradient id="pepin-lid-l" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#D9733A" />
          <stop offset="0.75" stopColor="#E9955A" />
          <stop offset="1" stopColor="#F3C7A0" />
        </linearGradient>
        <linearGradient id="pepin-lid-r" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#D66F36" />
          <stop offset="1" stopColor="#EC9A5E" />
        </linearGradient>
      </defs>
      <g className="pepin__lid">
        <ellipse cx="317" cy="167" rx="31" ry="30" transform="rotate(-6 317 167)" fill="url(#pepin-lid-l)" />
        <path d="M289 175 Q317 190 346 172" stroke="#3B1F14" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </g>
      <g className="pepin__lid">
        <ellipse cx="415" cy="144" rx="24" ry="28" transform="rotate(14 415 144)" fill="url(#pepin-lid-r)" />
        <path d="M395 151 Q414 166 436 147" stroke="#3B1F14" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export interface PepinFigureProps {
  state: PepinState;
  /** Largeur en px. */
  size: number;
  still?: boolean;
  /** Clé de transition : change à chaque réaction pour rejouer l'entrée. */
  seq?: number;
  label?: string;
  className?: string;
  /** Occupe la largeur du parent (décors) au lieu d'une taille fixe. */
  fluid?: boolean;
}

export function PepinFigure({ state, size, still = false, seq = 0, label, className = '', fluid = false }: PepinFigureProps) {
  const pose = POSE_OF[state];
  return (
    <div
      className={`pepin pepin--${state} ${still ? 'pepin--still' : ''} ${className}`}
      style={fluid ? { width: '100%', aspectRatio: '440 / 460' } : { width: size, height: Math.round(size * RATIO) }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="pepin__stage" key={`${pose}-${pose === 'accueil' ? 'a' : seq}`}>
        {pose === 'accueil' ? (
          <div className="pepin__rig">
            <img className="pepin__layer pepin__tail" src={accTail} alt="" draggable={false} />
            <img className="pepin__layer pepin__body" src={accBody} alt="" draggable={false} />
            <Lids closed={state === 'resting'} />
            <img className="pepin__layer pepin__arm" src={accArm} alt="" draggable={false} />
          </div>
        ) : (
          <img
            className="pepin__pose"
            src={POSES[pose].src}
            alt=""
            draggable={false}
            style={{ width: '94%', aspectRatio: `${POSES[pose].w} / ${POSES[pose].h}` }}
          />
        )}
        {state === 'celebrating' && !still && (
          <span className="pepin__sparkles" aria-hidden>
            <i /><i /><i /><i />
          </span>
        )}
      </div>
    </div>
  );
}
