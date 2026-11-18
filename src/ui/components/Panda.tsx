import { PepinFigure } from '../../companion/PepinFigure';
import type { PepinState } from '../../companion/types';

/**
 * Pépin en image fixe (panneaux d'aide, bilans, espace parent).
 * Pour le compagnon animé et relié aux événements, utiliser `PepinLive`.
 */
export type PandaMood = 'accueil' | 'reflexion' | 'encouragement' | 'explication' | 'celebration';

const STATE: Record<PandaMood, PepinState> = {
  accueil: 'idle',
  reflexion: 'thinking',
  encouragement: 'encouraging',
  explication: 'encouraging',
  celebration: 'celebrating',
};

export function Panda({ mood = 'accueil', size = 160, label, animated = false, className = '' }: {
  mood?: PandaMood; size?: number; label?: string; animated?: boolean; className?: string;
}) {
  return <PepinFigure state={STATE[mood]} size={size} still={!animated} label={label} className={className} />;
}
