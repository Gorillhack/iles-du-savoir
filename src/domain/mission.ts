import type { Level, SubjectId } from './types';

/** Réponse attendue à une question. */
export type Answer =
  | { kind: 'number'; value: number; unit?: string }
  | { kind: 'choice'; options: string[]; correct: number };

export interface ChoiceQuestion {
  question: string;
  options: string[];
  correct: number;
  /** Explication montrée après la réponse (bonne ou non). */
  explanation: string;
}

export interface SubStep {
  prompt: string;
  answer: Answer;
}

export interface MissionStep {
  id: string;
  prompt: string;
  /** Ligne d'appui (données, schéma textuel), optionnelle. */
  support?: string;
  answer: Answer;
  /** 1. Inviter l'enfant à reformuler la consigne. */
  reformulate: ChoiceQuestion;
  /** 2. Premier indice. */
  hint: string;
  /** 3. Décomposition guidée. */
  decompose: { intro: string; substeps: SubStep[]; outro: string };
  /** 4. Exemple différent, entièrement résolu. */
  example: string;
  /** Erreurs fréquentes : retour ciblé, sans donner la réponse. */
  commonErrors?: { value: number | string; message: string }[];
  success: string;
}

export interface Mission {
  id: string;
  title: string;
  subject: SubjectId;
  topic: string;
  /** Niveau visé ; « adaptatif » = contenu selon le niveau de l'enfant. */
  level: Level | 'adaptatif';
  intro: string;
  steps: MissionStep[] | Record<Level, MissionStep[]>;
  /** Petite question finale de vérification de la compréhension. */
  check: ChoiceQuestion | Record<Level, ChoiceQuestion>;
}

export const stepsFor = (m: Mission, level: Level): MissionStep[] =>
  Array.isArray(m.steps) ? m.steps : m.steps[level];

export const checkFor = (m: Mission, level: Level): ChoiceQuestion =>
  'question' in m.check ? (m.check as ChoiceQuestion) : (m.check as Record<Level, ChoiceQuestion>)[level];

/** Normalise une saisie : « 1 250 », « 12,5 », espaces. */
export const parseNumber = (raw: string): number | null => {
  const s = raw.replace(/\s| | /g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
};

export const isCorrect = (answer: Answer, raw: string | number): boolean => {
  if (answer.kind === 'choice') return Number(raw) === answer.correct;
  const n = typeof raw === 'number' ? raw : parseNumber(raw);
  return n !== null && Math.abs(n - answer.value) < 1e-9;
};

export const errorFeedback = (step: MissionStep, raw: string | number): string | null => {
  if (!step.commonErrors) return null;
  const n = typeof raw === 'number' ? raw : parseNumber(raw);
  const hit = step.commonErrors.find((e) => (typeof e.value === 'number' ? e.value === n : e.value === String(raw)));
  return hit?.message ?? null;
};
