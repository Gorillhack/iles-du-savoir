import type { CompanionEventType } from './types';

/**
 * Banque de messages courts, variés et bienveillants.
 * Règles : jamais de déception, jamais de culpabilité, jamais d'affirmation
 * de réussite quand rien n'a été vérifié (« terminé » ≠ « juste »).
 * {nom} = prénom de l'enfant.
 */
export const MESSAGES: Partial<Record<CompanionEventType, string[]>> = {
  enter: [
    'Coucou {nom} ! Content de te voir.',
    'Salut {nom} ! On regarde le programme ?',
    'Bonjour {nom} ! Prêt·e pour l’exploration ?',
  ],
  session_start: [
    'C’est parti ! Une tâche à la fois.',
    'On regarde la consigne ensemble ?',
    'Tranquillement, une étape après l’autre.',
  ],
  hint: [
    'Hmm… je cherche une piste pour toi.',
    'Bonne idée de demander. Voici une piste.',
    'Réfléchissons ensemble.',
  ],
  wrong: [
    'Pas encore. Relis tranquillement et réessaie.',
    'Presque une piste ! Tu veux un petit indice ?',
    'Les erreurs aident à chercher. On réessaie ?',
  ],
  step_correct: [
    'Étape réussie !',
    'Bien vu !',
    'Tu as trouvé !',
  ],
  check_correct: [
    'Bravo, tu as bien compris la méthode !',
    'Oui ! C’est exactement ça.',
  ],
  check_retry: [
    'On en reparlera : c’est comme ça qu’on apprend.',
    'Pas grave, l’explication est juste au-dessus.',
  ],
  task_done: [
    'Tu as terminé cette étape !',
    'Une tâche de faite. Bel effort !',
    'C’est noté dans ton carnet.',
  ],
  stuck: [
    'On découpe ensemble, pas à pas.',
    'Ça arrive à tous les explorateurs. On cherche ensemble ?',
  ],
  adult_requested: [
    'C’est noté. Un adulte va venir t’aider.',
    'Bonne idée. On peut demander un coup de main à un adulte.',
  ],
  pause: [
    'Petite pause. Je t’attends ici.',
    'On souffle un peu. Ton travail est enregistré.',
  ],
  resume: [
    'On reprend ?',
    'Re-bonjour ! On continue tranquillement.',
  ],
  poke: [
    'Hé ! Ça chatouille !',
    'Tu as vu ma sacoche ? Elle est pleine de cartes.',
    'Le refuge est encore plus joli avec tes lucioles.',
    'Je m’entraîne à faire coucou.',
    'Les panda roux adorent grimper aux arbres.',
  ],
};

/** Choisit un message en évitant de répéter le précédent pour ce même événement. */
export function createPicker(random: () => number = Math.random) {
  const last = new Map<string, number>();
  return (type: CompanionEventType, name: string): string | undefined => {
    const list = MESSAGES[type];
    if (!list?.length) return undefined;
    let i = Math.floor(random() * list.length);
    if (list.length > 1 && i === last.get(type)) i = (i + 1) % list.length;
    last.set(type, i);
    return list[i].replace('{nom}', name);
  };
}
