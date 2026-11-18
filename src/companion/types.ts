/**
 * Modèle du compagnon : états d'animation et événements de l'application.
 * Aucune dépendance à React : le rendu (PepinFigure) et la logique (machine)
 * restent séparés.
 */

/** États du personnage. Chacun correspond à une pose et à un comportement d'animation. */
export type PepinState = 'idle' | 'greeting' | 'thinking' | 'encouraging' | 'celebrating' | 'resting';

/** Événements émis par l'application vers le compagnon. */
export type CompanionEvent =
  | { type: 'enter' }              // arrivée dans l'espace enfant
  | { type: 'session_start' }
  | { type: 'hint' }               // l'enfant demande un indice
  | { type: 'wrong' }              // réponse à reprendre
  | { type: 'step_correct' }       // étape de mission réussie
  | { type: 'check_correct' }      // question de vérification réussie
  | { type: 'check_retry' }        // question de vérification à revoir
  | { type: 'task_done' }          // l'enfant a terminé une tâche (pas une preuve de réussite)
  | { type: 'stuck' }
  | { type: 'adult_requested' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'poke' }               // l'enfant touche Pépin dans le refuge
  | { type: 'intro' };             // présentation de première visite

export type CompanionEventType = CompanionEvent['type'];

export interface Reaction {
  state: PepinState;
  /** Message affiché (toujours visible, la voix est facultative). */
  message?: string;
  /** Durée de l'état avant retour au calme. `null` = jusqu'au prochain événement. */
  durationMs: number | null;
}

export interface CompanionSnapshot {
  state: PepinState;
  message?: string;
  /** Change à chaque réaction : sert de clé pour rejouer une transition. */
  seq: number;
}

/** Pose d'illustration utilisée pour chaque état (ressources de la planche). */
export type PepinPose = 'accueil' | 'reflexion' | 'explication' | 'celebration';

export const POSE_OF: Record<PepinState, PepinPose> = {
  idle: 'accueil',
  greeting: 'accueil',
  resting: 'accueil',
  thinking: 'reflexion',
  encouraging: 'explication',
  celebrating: 'celebration',
};
