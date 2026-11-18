import type { CompanionEvent, PepinState, Reaction } from './types';

/**
 * Logique pure : événement → réaction.
 * Les durées sont courtes pour rester discret pendant le travail.
 */
const RULES: Record<CompanionEvent['type'], { state: PepinState; durationMs: number | null; message?: boolean }> = {
  enter: { state: 'greeting', durationMs: 2600, message: true },
  intro: { state: 'greeting', durationMs: 2600 },
  session_start: { state: 'encouraging', durationMs: 2600, message: true },
  hint: { state: 'thinking', durationMs: 3200, message: true },
  wrong: { state: 'encouraging', durationMs: 3200, message: true },
  step_correct: { state: 'celebrating', durationMs: 1800, message: true },
  check_correct: { state: 'celebrating', durationMs: 2400, message: true },
  check_retry: { state: 'encouraging', durationMs: 3000, message: true },
  task_done: { state: 'encouraging', durationMs: 2600, message: true },
  stuck: { state: 'thinking', durationMs: 3200, message: true },
  adult_requested: { state: 'encouraging', durationMs: 3400, message: true },
  pause: { state: 'resting', durationMs: null, message: true },
  resume: { state: 'idle', durationMs: 2200, message: true },
  poke: { state: 'celebrating', durationMs: 1600, message: true },
};

export function react(event: CompanionEvent, pick: (t: CompanionEvent['type']) => string | undefined): Reaction {
  const r = RULES[event.type];
  return { state: r.state, durationMs: r.durationMs, message: r.message ? pick(event.type) : undefined };
}

/** Délai minimal entre deux réactions déclenchées en touchant Pépin (anti-spam). */
export const POKE_COOLDOWN_MS = 2500;

/** Le salut d'arrivée n'est pas rejoué avant ce délai, même en changeant de rôle. */
export const GREETING_COOLDOWN_MS = 30 * 60 * 1000;
