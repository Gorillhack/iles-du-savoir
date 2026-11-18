import type { AdultActivity, Comprehension, HelpStatus, Progress, SubjectId, Verification } from './types';

export interface SubjectInfo {
  id: SubjectId;
  label: string;
  /** Nom de l'île dans l'aventure. Le libellé scolaire reste toujours affiché. */
  island: string;
  /** Couleur décorative (jamais seule porteuse d'information). */
  color: string;
  /** Glyphe SVG simple dessiné par SubjectIcon. */
  icon: 'calc' | 'book' | 'globe' | 'leaf' | 'speech' | 'star';
}

export const SUBJECTS: SubjectInfo[] = [
  { id: 'maths', label: 'Mathématiques', island: 'Île des Nombres', color: '#38B8AC', icon: 'calc' },
  { id: 'francais', label: 'Français', island: 'Île des Mots', color: '#8B78D8', icon: 'book' },
  { id: 'histoire-geo', label: 'Histoire-Géographie', island: 'Île du Temps', color: '#D65A2E', icon: 'globe' },
  { id: 'sciences', label: 'Sciences', island: 'Île des Découvertes', color: '#5FA35A', icon: 'leaf' },
  { id: 'anglais', label: 'Anglais', island: 'Île des Voyageurs', color: '#F6C65B', icon: 'speech' },
  { id: 'autre', label: 'Autre', island: 'Île aux Surprises', color: '#7C8AA5', icon: 'star' },
];

export const subjectInfo = (id: SubjectId): SubjectInfo => SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[5];

export const subjectLabel = (id: SubjectId, topic?: string) =>
  topic ? `${subjectInfo(id).label} — ${topic}` : subjectInfo(id).label;

export const PROGRESS_LABEL: Record<Progress, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  termine: "Terminé par l'enfant",
};

export const VERIFICATION_LABEL: Record<Verification, string> = {
  non_verifie: 'Non vérifié',
  verifie_adulte: 'Vérifié par un adulte',
  verifie_exercice: 'Vérifié par un exercice adapté',
};

export const COMPREHENSION_LABEL: Record<Comprehension, string> = {
  non_evaluee: 'Compréhension non évaluée',
  a_consolider: 'À consolider',
  reussie_activite: "Réussi sur l'activité proposée",
};

export const HELP_LABEL: Record<HelpStatus, string> = {
  aucun: 'Aucun signalement',
  bloque: 'Bloqué',
  adulte_demande: 'Adulte demandé',
};

export const ADULT_ACTIVITY_LABEL: Record<AdultActivity, string> = {
  aucune: 'Aucune',
  recitation: 'Récitation',
  lecture_voix_haute: 'Lecture à voix haute',
  verification_cahier: "Vérification d'un cahier",
};

/** Accessoires du refuge, débloqués par les lucioles (effort), jamais achetés. */
export const REFUGE_ITEMS = [
  { id: 'lanterne', label: 'Lanterne', threshold: 5 },
  { id: 'coussin', label: 'Coussin moelleux', threshold: 10 },
  { id: 'plante', label: 'Plante grimpante', threshold: 18 },
  { id: 'etagere', label: 'Étagère à livres', threshold: 28 },
  { id: 'longue-vue', label: 'Longue-vue', threshold: 40 },
  { id: 'hamac', label: 'Hamac', threshold: 55 },
] as const;

export type RefugeItemId = (typeof REFUGE_ITEMS)[number]['id'];

/** Barème des lucioles : on récompense l'effort, pas la vitesse ni la perfection. */
export const FIREFLIES = {
  taskFinished: 2,
  errorCorrected: 1,
  askedForHelp: 1,
  sessionFinished: 3,
} as const;
