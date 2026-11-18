/**
 * Logique métier pure : (état, action) → nouvel état.
 * Aucune dépendance à React ou au stockage. Un futur backend
 * pourra rejouer ces mêmes actions côté serveur.
 */
import { FIREFLIES, REFUGE_ITEMS } from './catalog';
import { addDays, today } from './dates';
import type {
  AppData, Child, Comprehension, HelpEvent, HelpEventKind, Homework, ID, ISODate, MissionProgress, WorkSession,
} from './types';

export const newId = (): ID =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const now = () => new Date().toISOString();

export type HomeworkDraft = Pick<
  Homework,
  'childId' | 'subject' | 'topic' | 'title' | 'instructions' | 'dueDate' | 'estimatedMinutes' | 'attachment' | 'adultActivity' | 'missionId'
>;

export type ChildDraft = Pick<Child, 'displayName' | 'level' | 'companionName' | 'preferences'> & { introSeen?: boolean };

export type Action =
  // Parent
  | { type: 'child/add'; draft: ChildDraft }
  | { type: 'child/update'; id: ID; draft: Partial<ChildDraft> }
  | { type: 'child/delete'; id: ID }
  | { type: 'hw/add'; drafts: HomeworkDraft[]; addedBy?: 'parent' | 'enfant' }
  | { type: 'hw/update'; id: ID; draft: Partial<HomeworkDraft> }
  | { type: 'hw/delete'; id: ID }
  | { type: 'parent/verify'; id: ID; comprehension?: Comprehension; note?: string }
  | { type: 'parent/resolveHelp'; id: ID; note?: string }
  | { type: 'parent/reopen'; id: ID }
  | { type: 'parent/confirmHw'; id: ID }
  // Enfant
  | { type: 'session/start'; childId: ID; order: ID[] }
  | { type: 'session/goto'; sessionId: ID; index: number }
  | { type: 'session/pause'; sessionId: ID }
  | { type: 'session/end'; sessionId: ID }
  | { type: 'work/tick'; sessionId: ID; homeworkId: ID; seconds: number }
  | { type: 'hw/start'; id: ID }
  | { type: 'hw/childDone'; id: ID; note?: string }
  | { type: 'hw/help'; id: ID; kind: HelpEventKind; detail?: string }
  | { type: 'hw/errorCorrected'; id: ID }
  | { type: 'hw/wrongAttempt'; id: ID }
  | { type: 'mission/save'; id: ID; progress: MissionProgress }
  | { type: 'mission/complete'; id: ID; progress: MissionProgress }
  | { type: 'refuge/toggle'; childId: ID; itemId: string }
  // Données
  | { type: 'data/replace'; data: AppData };

/* ------------------------------------------------------------------ */

const mapHw = (d: AppData, id: ID, f: (h: Homework) => Homework): AppData => ({
  ...d,
  homeworks: d.homeworks.map((h) => (h.id === id ? { ...f(h), updatedAt: now() } : h)),
});

const addFireflies = (d: AppData, childId: ID, n: number): AppData => ({
  ...d,
  children: d.children.map((c) => (c.id === childId ? { ...c, fireflies: c.fireflies + n } : c)),
});

const activeSessionOf = (d: AppData, childId: ID): WorkSession | undefined => {
  const sid = d.activeSessionId[childId];
  return d.sessions.find((s) => s.id === sid && !s.endedAt);
};

const bumpSession = (d: AppData, childId: ID, f: (s: WorkSession) => WorkSession): AppData => {
  const s = activeSessionOf(d, childId);
  if (!s) return d;
  return { ...d, sessions: d.sessions.map((x) => (x.id === s.id ? f(x) : x)) };
};

const resolveOpenHelp = (d: AppData, homeworkId: ID): AppData => ({
  ...d,
  helpEvents: d.helpEvents.map((e) =>
    e.homeworkId === homeworkId && !e.resolvedAt && (e.kind === 'bloque' || e.kind === 'adulte') ? { ...e, resolvedAt: now() } : e,
  ),
});

/** Conclusion honnête d'une mission : on ne parle jamais de « notion maîtrisée ». */
export const missionConclusion = (p: MissionProgress) => {
  const total = p.steps.length;
  const firstTry = p.steps.filter((s) => s.firstTry === true).length;
  const afterHelp = p.steps.filter((s) => s.solved && s.firstTry !== true).length;
  const hints = p.steps.reduce((a, s) => a + s.hints, 0);
  const allSolved = p.steps.every((s) => s.solved);
  const comprehension: Comprehension =
    allSolved && p.checkPassed === true && firstTry * 2 > total ? 'reussie_activite' : 'a_consolider';
  const parts = [
    `Exercice adapté : ${firstTry}/${total} réponse${firstTry > 1 ? 's' : ''} juste${firstTry > 1 ? 's' : ''} du premier coup`,
    afterHelp ? `${afterHelp} après une aide ou un nouvel essai` : null,
    hints ? `${hints} aide${hints > 1 ? 's' : ''} utilisée${hints > 1 ? 's' : ''}` : 'sans aide',
    p.checkPassed === true ? 'question de compréhension réussie' : p.checkPassed === false ? 'question de compréhension à revoir' : null,
  ].filter(Boolean);
  return {
    comprehension,
    note: `${parts.join(', ')}. Cela vérifie cette activité, pas l’ensemble de la notion.`,
    score: { correctFirstTry: firstTry, correctAfterHelp: afterHelp, total, checkPassed: p.checkPassed },
  };
};

/* ------------------------------------------------------------------ */

export function reduce(d: AppData, a: Action): AppData {
  switch (a.type) {
    case 'child/add': {
      const child: Child = { id: newId(), fireflies: 0, refugeShown: [], ...a.draft };
      return { ...d, children: [...d.children, child] };
    }
    case 'child/update':
      return { ...d, children: d.children.map((c) => (c.id === a.id ? { ...c, ...a.draft, preferences: { ...c.preferences, ...a.draft.preferences } } : c)) };
    case 'child/delete': {
      const hwIds = new Set(d.homeworks.filter((h) => h.childId === a.id).map((h) => h.id));
      const { [a.id]: _removed, ...activeSessionId } = d.activeSessionId;
      void _removed;
      return {
        ...d,
        children: d.children.filter((c) => c.id !== a.id),
        homeworks: d.homeworks.filter((h) => h.childId !== a.id),
        helpEvents: d.helpEvents.filter((e) => e.childId !== a.id),
        sessions: d.sessions.filter((s) => s.childId !== a.id),
        missionProgress: Object.fromEntries(Object.entries(d.missionProgress).filter(([k]) => !hwIds.has(k))),
        activeSessionId,
      };
    }
    case 'hw/add': {
      const t = now();
      const created: Homework[] = a.drafts.map((dr) => ({
        id: newId(),
        ...dr,
        addedBy: a.addedBy ?? 'parent',
        needsParentReview: a.addedBy === 'enfant' ? true : undefined,
        progress: 'a_faire',
        verification: 'non_verifie',
        comprehension: 'non_evaluee',
        help: 'aucun',
        stats: { hintsUsed: 0, wrongAttempts: 0, correctedErrors: 0, secondsSpent: 0 },
        createdAt: t,
        updatedAt: t,
      }));
      return { ...d, homeworks: [...d.homeworks, ...created] };
    }
    case 'hw/update':
      // Modifié dans l'espace parent : il est donc relu.
      return mapHw(d, a.id, (h) => ({ ...h, ...a.draft, needsParentReview: false }));
    case 'parent/confirmHw':
      return mapHw(d, a.id, (h) => ({ ...h, needsParentReview: false }));
    case 'hw/delete': {
      const { [a.id]: _p, ...missionProgress } = d.missionProgress;
      void _p;
      return {
        ...d,
        homeworks: d.homeworks.filter((h) => h.id !== a.id),
        helpEvents: d.helpEvents.filter((e) => e.homeworkId !== a.id),
        sessions: d.sessions.map((s) => ({ ...s, order: s.order.filter((x) => x !== a.id), results: s.results.filter((r) => r.homeworkId !== a.id) })),
        missionProgress,
      };
    }
    case 'parent/verify': {
      const d2 = resolveOpenHelp(d, a.id);
      return mapHw(d2, a.id, (h) => ({
        ...h,
        verification: 'verifie_adulte',
        help: 'aucun',
        comprehension: a.comprehension ?? h.comprehension,
        parentNote: a.note || h.parentNote,
        verificationNote:
          (h.verification === 'verifie_exercice' && h.verificationNote ? h.verificationNote + ' ' : '') +
          `Relu par un adulte le ${new Date().toLocaleDateString('fr-FR')}.`,
      }));
    }
    case 'parent/resolveHelp': {
      const d2 = resolveOpenHelp(d, a.id);
      return mapHw(d2, a.id, (h) => ({ ...h, help: 'aucun', parentNote: a.note || h.parentNote }));
    }
    case 'parent/reopen':
      return mapHw(d, a.id, (h) => ({ ...h, progress: 'en_cours', verification: 'non_verifie' }));

    case 'session/start': {
      const prev = activeSessionOf(d, a.childId);
      const sessions = prev ? d.sessions.map((s) => (s.id === prev.id ? { ...s, endedAt: now() } : s)) : d.sessions;
      const s: WorkSession = {
        id: newId(), childId: a.childId, startedAt: now(), order: a.order, currentIndex: 0,
        secondsWorked: 0, pauses: 0, results: [], firefliesEarned: 0, hintsUsed: 0,
      };
      return { ...d, sessions: [...sessions, s], activeSessionId: { ...d.activeSessionId, [a.childId]: s.id } };
    }
    case 'session/goto':
      return { ...d, sessions: d.sessions.map((s) => (s.id === a.sessionId ? { ...s, currentIndex: a.index } : s)) };
    case 'session/pause':
      return { ...d, sessions: d.sessions.map((s) => (s.id === a.sessionId ? { ...s, pauses: s.pauses + 1 } : s)) };
    case 'session/end': {
      const s = d.sessions.find((x) => x.id === a.sessionId);
      if (!s || s.endedAt) return d;
      const results = s.order.map((hid) => {
        const h = d.homeworks.find((x) => x.id === hid);
        const outcome: WorkSession['results'][number]['outcome'] = !h
          ? 'non_commence'
          : h.help === 'adulte_demande' ? 'adulte_demande'
          : h.help === 'bloque' ? 'bloque'
          : h.progress === 'termine' ? 'termine'
          : h.progress === 'en_cours' ? 'en_cours' : 'non_commence';
        return { homeworkId: hid, outcome };
      });
      const worked = results.some((r) => r.outcome !== 'non_commence');
      const bonus = worked ? FIREFLIES.sessionFinished : 0;
      const d2 = {
        ...d,
        sessions: d.sessions.map((x) => (x.id === s.id ? { ...x, endedAt: now(), results, firefliesEarned: x.firefliesEarned + bonus } : x)),
        activeSessionId: { ...d.activeSessionId, [s.childId]: undefined },
      };
      return addFireflies(d2, s.childId, bonus);
    }
    case 'work/tick': {
      const d2 = { ...d, sessions: d.sessions.map((s) => (s.id === a.sessionId ? { ...s, secondsWorked: s.secondsWorked + a.seconds } : s)) };
      return {
        ...d2,
        homeworks: d2.homeworks.map((h) => (h.id === a.homeworkId ? { ...h, stats: { ...h.stats, secondsSpent: h.stats.secondsSpent + a.seconds } } : h)),
      };
    }
    case 'hw/start':
      return mapHw(d, a.id, (h) => (h.progress === 'a_faire' ? { ...h, progress: 'en_cours' } : h));
    case 'hw/childDone': {
      const h = d.homeworks.find((x) => x.id === a.id);
      if (!h) return d;
      const wasDone = h.progress === 'termine';
      let d2 = mapHw(d, a.id, (x) => ({ ...x, progress: 'termine', childNote: a.note || x.childNote, help: x.help === 'bloque' ? 'aucun' : x.help }));
      if (h.help === 'bloque') d2 = { ...d2, helpEvents: d2.helpEvents.map((e) => (e.homeworkId === a.id && e.kind === 'bloque' && !e.resolvedAt ? { ...e, resolvedAt: now() } : e)) };
      if (!wasDone) {
        d2 = addFireflies(d2, h.childId, FIREFLIES.taskFinished);
        d2 = bumpSession(d2, h.childId, (s) => ({ ...s, firefliesEarned: s.firefliesEarned + FIREFLIES.taskFinished }));
      }
      return d2;
    }
    case 'hw/help': {
      const h = d.homeworks.find((x) => x.id === a.id);
      if (!h) return d;
      const ev: HelpEvent = { id: newId(), childId: h.childId, homeworkId: h.id, kind: a.kind, at: now(), detail: a.detail };
      let d2: AppData = { ...d, helpEvents: [...d.helpEvents, ev] };
      const isSignal = a.kind === 'bloque' || a.kind === 'adulte';
      d2 = mapHw(d2, a.id, (x) => ({
        ...x,
        progress: x.progress === 'a_faire' ? 'en_cours' : x.progress,
        help: a.kind === 'adulte' ? 'adulte_demande' : a.kind === 'bloque' && x.help !== 'adulte_demande' ? 'bloque' : x.help,
        childNote: a.detail && isSignal ? a.detail : x.childNote,
        stats: isSignal ? x.stats : { ...x.stats, hintsUsed: x.stats.hintsUsed + 1 },
      }));
      if (isSignal) {
        // Demander de l'aide est encouragé : c'est un effort, pas un échec.
        const already = d.helpEvents.some((e) => e.homeworkId === h.id && e.kind === a.kind && !e.resolvedAt);
        if (!already) {
          d2 = addFireflies(d2, h.childId, FIREFLIES.askedForHelp);
          d2 = bumpSession(d2, h.childId, (s) => ({ ...s, firefliesEarned: s.firefliesEarned + FIREFLIES.askedForHelp }));
        }
      } else {
        d2 = bumpSession(d2, h.childId, (s) => ({ ...s, hintsUsed: s.hintsUsed + 1 }));
      }
      return d2;
    }
    case 'hw/wrongAttempt':
      return mapHw(d, a.id, (h) => ({ ...h, stats: { ...h.stats, wrongAttempts: h.stats.wrongAttempts + 1 } }));
    case 'hw/errorCorrected': {
      const h = d.homeworks.find((x) => x.id === a.id);
      if (!h) return d;
      let d2 = mapHw(d, a.id, (x) => ({ ...x, stats: { ...x.stats, correctedErrors: x.stats.correctedErrors + 1 } }));
      d2 = addFireflies(d2, h.childId, FIREFLIES.errorCorrected);
      return bumpSession(d2, h.childId, (s) => ({ ...s, firefliesEarned: s.firefliesEarned + FIREFLIES.errorCorrected }));
    }
    case 'mission/save':
      return { ...d, missionProgress: { ...d.missionProgress, [a.id]: a.progress } };
    case 'mission/complete': {
      const c = missionConclusion(a.progress);
      let d2: AppData = { ...d, missionProgress: { ...d.missionProgress, [a.id]: a.progress } };
      d2 = mapHw(d2, a.id, (h) => ({
        ...h,
        verification: h.verification === 'verifie_adulte' ? h.verification : 'verifie_exercice',
        comprehension: c.comprehension,
        verificationNote: c.note,
        stats: { ...h.stats, missionScore: c.score },
      }));
      return reduce(d2, { type: 'hw/childDone', id: a.id });
    }
    case 'refuge/toggle':
      return {
        ...d,
        children: d.children.map((c) =>
          c.id !== a.childId ? c : { ...c, refugeShown: c.refugeShown.includes(a.itemId) ? c.refugeShown.filter((x) => x !== a.itemId) : [...c.refugeShown, a.itemId] },
        ),
      };
    case 'data/replace':
      return a.data;
  }
}

/* ---------------------- Lectures dérivées ---------------------- */

export const childHomeworks = (d: AppData, childId: ID) => d.homeworks.filter((h) => h.childId === childId);

const byDue = (a: Homework, b: Homework) => a.dueDate.localeCompare(b.dueDate) || a.createdAt.localeCompare(b.createdAt);

/** Devoirs à préparer aujourd'hui : en retard, pour demain (habitude CM) ou pour aujourd'hui, non terminés, + ceux en cours. */
export const todaysWork = (d: AppData, childId: ID, ref: ISODate = today()) => {
  const horizon = addDays(ref, 1);
  return childHomeworks(d, childId)
    .filter((h) => h.progress !== 'termine' && (h.dueDate <= horizon || h.progress === 'en_cours'))
    .sort(byDue);
};

export const upcomingWork = (d: AppData, childId: ID, ref: ISODate = today()) => {
  const horizon = addDays(ref, 1);
  return childHomeworks(d, childId)
    .filter((h) => h.progress !== 'termine' && h.dueDate > horizon && h.progress !== 'en_cours')
    .sort(byDue);
};

export type AttentionKind = 'adulte' | 'bloque' | 'a_relire' | 'a_verifier' | 'activite_adulte' | 'en_retard';

export interface AttentionItem {
  kind: AttentionKind;
  homework: Homework;
  child: Child;
  since?: string;
}

/** Ce qui demande l'intervention du parent, du plus urgent au moins urgent. */
export const attentionItems = (d: AppData, ref: ISODate = today()): AttentionItem[] => {
  const items: AttentionItem[] = [];
  const childOf = (id: ID) => d.children.find((c) => c.id === id);
  for (const h of d.homeworks) {
    const child = childOf(h.childId);
    if (!child) continue;
    const lastHelp = [...d.helpEvents].reverse().find((e) => e.homeworkId === h.id && !e.resolvedAt);
    if (h.needsParentReview) items.push({ kind: 'a_relire', homework: h, child, since: h.createdAt });
    if (h.help === 'adulte_demande') items.push({ kind: 'adulte', homework: h, child, since: lastHelp?.at });
    else if (h.help === 'bloque') items.push({ kind: 'bloque', homework: h, child, since: lastHelp?.at });
    else if (h.progress === 'termine' && h.verification === 'non_verifie') items.push({ kind: 'a_verifier', homework: h, child });
    else if (h.progress === 'termine' && h.adultActivity !== 'aucune' && h.verification !== 'verifie_adulte') items.push({ kind: 'activite_adulte', homework: h, child });
    else if (h.progress !== 'termine' && h.dueDate < ref) items.push({ kind: 'en_retard', homework: h, child });
    else if (h.progress !== 'termine' && h.adultActivity !== 'aucune' && h.dueDate <= addDays(ref, 1))
      items.push({ kind: 'activite_adulte', homework: h, child });
  }
  const rank: Record<AttentionKind, number> = { adulte: 0, bloque: 1, a_relire: 2, en_retard: 3, a_verifier: 4, activite_adulte: 5 };
  return items.sort((a, b) => rank[a.kind] - rank[b.kind] || a.homework.dueDate.localeCompare(b.homework.dueDate));
};

export interface ChildProgress {
  total: number;
  aFaire: number;
  enCours: number;
  termine: number;
  verifie: number;
  aConsolider: number;
  reussie: number;
}

/** Progression sur la semaine glissante (en retard + 7 prochains jours). */
export const childProgress = (d: AppData, childId: ID, ref: ISODate = today()): ChildProgress => {
  const horizon = addDays(ref, 7);
  const list = childHomeworks(d, childId).filter((h) => h.dueDate <= horizon && (h.dueDate >= addDays(ref, -7) || h.progress !== 'termine'));
  return {
    total: list.length,
    aFaire: list.filter((h) => h.progress === 'a_faire').length,
    enCours: list.filter((h) => h.progress === 'en_cours').length,
    termine: list.filter((h) => h.progress === 'termine').length,
    verifie: list.filter((h) => h.verification !== 'non_verifie').length,
    aConsolider: list.filter((h) => h.comprehension === 'a_consolider').length,
    reussie: list.filter((h) => h.comprehension === 'reussie_activite').length,
  };
};

export const lastSession = (d: AppData, childId: ID) =>
  [...d.sessions].filter((s) => s.childId === childId).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

export const activeSession = activeSessionOf;

export const unlockedRefugeItems = (c: Child) => REFUGE_ITEMS.filter((i) => c.fireflies >= i.threshold);

export const nextRefugeItem = (c: Child) => REFUGE_ITEMS.find((i) => c.fireflies < i.threshold);
