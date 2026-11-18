/**
 * Modèle métier des Îles du Savoir.
 * Aucune dépendance à React ni au stockage : ces types sont partagés
 * par la logique (domain), la persistance (data) et l'interface (ui).
 */

export type ID = string;
/** Date calendaire locale au format AAAA-MM-JJ. */
export type ISODate = string;
/** Horodatage ISO complet. */
export type ISODateTime = string;

export type Level = 'CM1' | 'CM2';

export type SubjectId =
  | 'maths'
  | 'francais'
  | 'histoire-geo'
  | 'sciences'
  | 'anglais'
  | 'autre';

/* ---------- Statuts : quatre dimensions indépendantes ---------- */

/** Ce que l'enfant déclare avoir fait. */
export type Progress = 'a_faire' | 'en_cours' | 'termine';
/** Ce qui a réellement été contrôlé, et par quoi. */
export type Verification = 'non_verifie' | 'verifie_adulte' | 'verifie_exercice';
/** Ce que l'on sait de la compréhension, limité à l'activité proposée. */
export type Comprehension = 'non_evaluee' | 'a_consolider' | 'reussie_activite';
/** Signalement en cours. */
export type HelpStatus = 'aucun' | 'bloque' | 'adulte_demande';

/** Activités qui demandent un adulte. */
export type AdultActivity = 'aucune' | 'recitation' | 'lecture_voix_haute' | 'verification_cahier';

export interface Attachment {
  name: string;
  /** Image encodée localement (data URL). Jamais transmise. */
  dataUrl: string;
}

export interface Homework {
  id: ID;
  childId: ID;
  subject: SubjectId;
  /** Notion visible, ex. « Fractions ». */
  topic?: string;
  title: string;
  instructions: string;
  dueDate: ISODate;
  estimatedMinutes?: number;
  attachment?: Attachment;
  adultActivity: AdultActivity;
  /** Mission de démonstration scénarisée liée, si elle existe. */
  missionId?: string;
  /** Qui a saisi le devoir. Un devoir saisi par l'enfant est relu par un adulte. */
  addedBy?: 'parent' | 'enfant';
  /** Vrai tant qu'un adulte n'a pas relu un devoir ajouté par l'enfant. */
  needsParentReview?: boolean;

  progress: Progress;
  verification: Verification;
  comprehension: Comprehension;
  help: HelpStatus;

  /** Ce qui a été réellement vérifié, en clair, pour le parent. */
  verificationNote?: string;
  /** Petit mot laissé par l'enfant (« je n'ai pas compris la question 2 »). */
  childNote?: string;
  /** Petit mot du parent. */
  parentNote?: string;

  stats: HomeworkStats;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface HomeworkStats {
  hintsUsed: number;
  wrongAttempts: number;
  correctedErrors: number;
  /** Secondes de travail cumulées (hors pause). */
  secondsSpent: number;
  /** Résultat de la mission, si mission. */
  missionScore?: { correctFirstTry: number; correctAfterHelp: number; total: number; checkPassed: boolean | null };
}

export interface ChildPreferences {
  textSize: 'normal' | 'grand';
  animations: boolean;
  /** Durée de séance souhaitée, en minutes. */
  sessionMinutes: number;
  /** Voix du compagnon (synthèse locale, sur action explicite). Désactivée par défaut. */
  voice?: boolean;
}

export interface Child {
  id: ID;
  /** Prénom ou pseudonyme. Aucune autre donnée personnelle. */
  displayName: string;
  level: Level;
  companionName: string;
  preferences: ChildPreferences;
  /** Lucioles gagnées par l'effort. */
  fireflies: number;
  /** Accessoires du refuge visibles (choisis par l'enfant). */
  refugeShown: string[];
  /** Présentation de première visite déjà vue ou ignorée. */
  introSeen?: boolean;
}

export type HelpEventKind = 'indice' | 'bloque' | 'adulte' | 'reformulation' | 'decomposition' | 'exemple';

export interface HelpEvent {
  id: ID;
  childId: ID;
  homeworkId: ID;
  kind: HelpEventKind;
  at: ISODateTime;
  detail?: string;
  resolvedAt?: ISODateTime;
}

export interface SessionItemResult {
  homeworkId: ID;
  outcome: 'termine' | 'bloque' | 'adulte_demande' | 'non_commence' | 'en_cours';
}

export interface WorkSession {
  id: ID;
  childId: ID;
  startedAt: ISODateTime;
  endedAt?: ISODateTime;
  /** Ordre de travail choisi par l'enfant. */
  order: ID[];
  currentIndex: number;
  secondsWorked: number;
  pauses: number;
  results: SessionItemResult[];
  firefliesEarned: number;
  hintsUsed: number;
}

export interface AppData {
  schemaVersion: 1;
  /** Préparé pour des comptes familiaux séparés. */
  familyId: ID;
  children: Child[];
  homeworks: Homework[];
  helpEvents: HelpEvent[];
  sessions: WorkSession[];
  /** Session active par enfant (reprise après rechargement). */
  activeSessionId: Record<ID, ID | undefined>;
  /** Sauvegarde du déroulé d'une mission en cours, par devoir. */
  missionProgress: Record<ID, MissionProgress | undefined>;
}

export interface MissionProgress {
  stepIndex: number;
  /** Résultat par étape. */
  steps: { firstTry: boolean | null; solved: boolean; hints: number }[];
  checkPassed: boolean | null;
}
