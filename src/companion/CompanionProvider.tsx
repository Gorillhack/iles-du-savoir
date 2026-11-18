import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Child } from '../domain/types';
import { GREETING_COOLDOWN_MS, POKE_COOLDOWN_MS, react } from './machine';
import { createPicker } from './messages';
import type { CompanionEvent, CompanionSnapshot } from './types';

interface CompanionValue extends CompanionSnapshot {
  emit: (e: CompanionEvent) => void;
  /** Ferme la bulle sans changer l'état (bouton « fermer » ou lecture terminée). */
  dismiss: () => void;
  name: string;
  /** Animations décoratives désactivées (préférence enfant ou système). */
  still: boolean;
  voice: boolean;
}

const Ctx = createContext<CompanionValue | null>(null);
const GREET_KEY = (id: string) => `iles-du-savoir:pepin-salut:${id}`;

const readTs = (k: string) => {
  try { return Number(window.localStorage.getItem(k) ?? 0); } catch { return 0; }
};
const writeTs = (k: string) => {
  try { window.localStorage.setItem(k, String(Date.now())); } catch { /* stockage indisponible */ }
};

function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

/**
 * Point central des réactions de Pépin.
 * - Un seul minuteur (retour au calme) ; les micro-animations d'attente sont en CSS pur.
 * - Salut d'arrivée une seule fois (mémorisé 30 min par enfant).
 * - Animations suspendues quand l'onglet est masqué.
 */
export function CompanionProvider({ child, children }: { child: Child; children: ReactNode }) {
  const [snap, setSnap] = useState<CompanionSnapshot>({ state: 'idle', seq: 0 });
  const timer = useRef<number | undefined>(undefined);
  const lastPoke = useRef(0);
  const pick = useRef(createPicker());
  const systemReduced = useSystemReducedMotion();
  const still = systemReduced || !child.preferences.animations;
  const nameRef = useRef(child.displayName);
  nameRef.current = child.displayName;

  const clear = () => { if (timer.current !== undefined) { window.clearTimeout(timer.current); timer.current = undefined; } };

  const emit = useCallback((e: CompanionEvent) => {
    if (e.type === 'poke') {
      const now = Date.now();
      if (now - lastPoke.current < POKE_COOLDOWN_MS) return;
      lastPoke.current = now;
    }
    const r = react(e, (t) => pick.current(t, nameRef.current));
    clear();
    setSnap((s) => ({ state: r.state, message: r.message, seq: s.seq + 1 }));
    if (r.durationMs !== null) {
      timer.current = window.setTimeout(() => {
        timer.current = undefined;
        setSnap((s) => ({ state: 'idle', message: undefined, seq: s.seq + 1 }));
      }, r.durationMs + (r.message ? 1200 : 0));
    }
  }, []);

  const dismiss = useCallback(() => setSnap((s) => ({ ...s, message: undefined })), []);

  // Salut d'arrivée : une seule fois, pas à chaque rendu ni à chaque navigation.
  useEffect(() => {
    const k = GREET_KEY(child.id);
    if (Date.now() - readTs(k) < GREETING_COOLDOWN_MS) return;
    writeTs(k);
    emit({ type: 'enter' });
  }, [child.id, emit]);

  // Onglet masqué : on suspend les animations CSS (classe globale).
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => root.classList.toggle('doc-hidden', document.visibilityState === 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); root.classList.remove('doc-hidden'); };
  }, []);

  useEffect(() => clear, []);

  // Filet de sécurité : si un minuteur a été nettoyé (démontage/remontage), on revient au calme.
  useEffect(() => {
    if (timer.current !== undefined || snap.state === 'idle' || snap.state === 'resting') return;
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setSnap((s) => ({ state: 'idle', message: undefined, seq: s.seq + 1 }));
    }, 3000);
  }, [snap.seq, snap.state]);

  const value = useMemo<CompanionValue>(
    () => ({ ...snap, emit, dismiss, name: child.companionName, still, voice: child.preferences.voice === true }),
    [snap, emit, dismiss, child.companionName, still, child.preferences.voice],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompanion() {
  return useContext(Ctx);
}

/** Émetteur sûr : ne fait rien hors de l'espace enfant (ex. espace parent). */
export function useCompanionEmit() {
  const c = useContext(Ctx);
  return c?.emit ?? noop;
}
const noop = () => {};
