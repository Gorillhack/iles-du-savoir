import { addDays, today } from '../domain/dates';
import type { AppData, Homework } from '../domain/types';

/**
 * Données de démonstration, recalculées par rapport à la date du jour
 * pour que le prototype reste cohérent quel que soit le jour du test.
 * Un enfant : Nathan, CM2 (prénom uniquement).
 */
export function createDemoData(): AppData {
  const t = today();
  const stamp = new Date().toISOString();
  const hw = (p: Partial<Homework> & Pick<Homework, 'id' | 'childId' | 'subject' | 'title' | 'instructions' | 'dueDate'>): Homework => ({
    adultActivity: 'aucune',
    progress: 'a_faire',
    verification: 'non_verifie',
    comprehension: 'non_evaluee',
    help: 'aucun',
    stats: { hintsUsed: 0, wrongAttempts: 0, correctedErrors: 0, secondsSpent: 0 },
    createdAt: stamp,
    updatedAt: stamp,
    ...p,
  });

  const nathan = 'demo-nathan';

  return {
    schemaVersion: 1,
    familyId: 'famille-demo',
    children: [
      {
        id: nathan, displayName: 'Nathan', level: 'CM2', companionName: 'Pépin',
        preferences: { textSize: 'normal', animations: true, sessionMinutes: 30 },
        fireflies: 12, refugeShown: ['lanterne', 'coussin'],
      },
    ],
    homeworks: [
      hw({
        id: 'hw-nathan-frac', childId: nathan, subject: 'maths', topic: 'Fractions',
        title: 'Comparer et utiliser les fractions', instructions: 'Exercices 4, 5 et 7 page 62. Mission guidée disponible.',
        dueDate: addDays(t, 1), estimatedMinutes: 20, missionId: 'cm2-fractions',
      }),
      hw({
        id: 'hw-nathan-lecture', childId: nathan, subject: 'francais', topic: 'Lecture',
        title: 'Lire le chapitre 3 à voix haute', instructions: 'Lire à voix haute le chapitre 3 de « L’Île au trésor » (version jeunesse) à un adulte.',
        dueDate: addDays(t, 1), estimatedMinutes: 20, adultActivity: 'lecture_voix_haute',
        progress: 'en_cours', help: 'bloque', childNote: 'Je ne comprends pas le mot « goélette ».',
      }),
      hw({
        id: 'hw-nathan-hist', childId: nathan, subject: 'histoire-geo', topic: 'La Révolution française',
        title: 'Questions sur la prise de la Bastille', instructions: 'Répondre aux questions 1 à 4 dans le cahier du jour.',
        dueDate: addDays(t, 2), estimatedMinutes: 20, adultActivity: 'verification_cahier',
      }),
      hw({
        id: 'hw-nathan-pb', childId: nathan, subject: 'maths', topic: 'Résolution de problèmes',
        title: 'Problème de la randonnée', instructions: 'Résoudre le problème du sentier en deux parties. Mission guidée disponible.',
        dueDate: addDays(t, 2), estimatedMinutes: 15, missionId: 'probleme-adapte',
      }),
      hw({
        id: 'hw-nathan-sciences', childId: nathan, subject: 'sciences', topic: 'Le système solaire',
        title: 'Relire la leçon sur le système solaire', instructions: 'Relire la leçon et savoir citer les planètes dans l’ordre.',
        dueDate: addDays(t, 4), estimatedMinutes: 10,
      }),
      hw({
        id: 'hw-nathan-dictee', childId: nathan, subject: 'francais', topic: 'Orthographe',
        title: 'Mots de la dictée (liste 8)', instructions: 'Apprendre à écrire les mots de la liste 8.',
        dueDate: addDays(t, -1), progress: 'termine', estimatedMinutes: 10,
        childNote: 'J’ai fait la liste deux fois.',
        stats: { hintsUsed: 0, wrongAttempts: 0, correctedErrors: 0, secondsSpent: 540 },
      }),
      hw({
        id: 'hw-nathan-anglais', childId: nathan, subject: 'anglais', topic: 'Vocabulaire',
        title: 'Vocabulaire : the weather', instructions: 'Apprendre les 10 mots sur la météo.',
        dueDate: addDays(t, -1), progress: 'termine', verification: 'verifie_adulte', comprehension: 'reussie_activite',
        verificationNote: 'Relu par un adulte : 9 mots sur 10 dits sans aide.',
        stats: { hintsUsed: 0, wrongAttempts: 0, correctedErrors: 0, secondsSpent: 720 },
      }),
    ],
    helpEvents: [
      { id: 'he-1', childId: nathan, homeworkId: 'hw-nathan-lecture', kind: 'bloque', at: new Date(Date.now() - 50 * 60_000).toISOString(), detail: 'Je ne comprends pas le mot « goélette ».' },
    ],
    sessions: [
      {
        id: 'sess-demo-nathan', childId: nathan,
        startedAt: new Date(Date.now() - 26 * 3600_000).toISOString(), endedAt: new Date(Date.now() - 25.5 * 3600_000).toISOString(),
        order: ['hw-nathan-anglais', 'hw-nathan-dictee', 'hw-nathan-lecture'], currentIndex: 2, secondsWorked: 1500, pauses: 1,
        results: [
          { homeworkId: 'hw-nathan-anglais', outcome: 'termine' },
          { homeworkId: 'hw-nathan-dictee', outcome: 'termine' },
          { homeworkId: 'hw-nathan-lecture', outcome: 'bloque' },
        ],
        firefliesEarned: 8, hintsUsed: 1,
      },
    ],
    activeSessionId: {},
    missionProgress: {},
  };
}

/**
 * Démarrage réel : seulement le profil de Nathan, aucun devoir ni historique.
 * La démonstration reste disponible dans « Données ».
 */
export function createInitialData(): AppData {
  return {
    schemaVersion: 1,
    familyId: 'famille-locale',
    children: [
      {
        id: 'nathan', displayName: 'Nathan', level: 'CM2', companionName: 'Pépin',
        preferences: { textSize: 'normal', animations: true, sessionMinutes: 30 },
        fireflies: 0, refugeShown: [],
      },
    ],
    homeworks: [],
    helpEvents: [],
    sessions: [],
    activeSessionId: {},
    missionProgress: {},
  };
}
