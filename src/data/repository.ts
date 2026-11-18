import type { AppData } from '../domain/types';
import { createInitialData } from './demoData';

/**
 * Point d'accès unique aux données. Le prototype utilise localStorage ;
 * un backend (comptes familiaux, authentification réelle) implémentera
 * la même interface sans toucher à l'interface ni à la logique métier.
 */
export interface FamilyRepository {
  load(): AppData;
  save(data: AppData): void;
  /** Efface toutes les données stockées sur cet appareil. */
  wipe(): void;
  /** Notifie les changements faits ailleurs (autre onglet, autre appareil). */
  subscribe(listener: (data: AppData) => void): () => void;
}

// v3 : usage réel, démarrage vide avec le profil de Nathan (la démo se charge depuis « Données »).
const KEY = 'iles-du-savoir:v3';

const isAppData = (x: unknown): x is AppData =>
  !!x && typeof x === 'object' && (x as AppData).schemaVersion === 1 && Array.isArray((x as AppData).homeworks);

/** Stockage en mémoire si localStorage est indisponible (navigation privée stricte, iframe). */
const memory = new Map<string, string>();
const storage = {
  get(k: string) {
    try { return window.localStorage.getItem(k); } catch { return memory.get(k) ?? null; }
  },
  set(k: string, v: string) {
    try { window.localStorage.setItem(k, v); } catch { memory.set(k, v); }
  },
  remove(k: string) {
    try { window.localStorage.removeItem(k); } catch { memory.delete(k); }
  },
};

export class LocalStorageRepository implements FamilyRepository {
  load(): AppData {
    const raw = storage.get(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (isAppData(parsed)) return parsed;
      } catch { /* données corrompues : on repart d'un carnet vide */ }
    }
    const initial = createInitialData();
    this.save(initial);
    return initial;
  }
  save(data: AppData) {
    try {
      storage.set(KEY, JSON.stringify(data));
    } catch (e) {
      // Quota dépassé (pièces jointes trop lourdes) : on prévient sans planter.
      console.warn('Sauvegarde locale impossible', e);
      throw e;
    }
  }
  wipe() {
    storage.remove(KEY);
  }
  subscribe(listener: (data: AppData) => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (isAppData(parsed)) listener(parsed);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }
}

export const repository: FamilyRepository = new LocalStorageRepository();

/** Préférences d'interface de l'appareil (rôle de démo), distinctes des données familiales. */
const UI_KEY = 'iles-du-savoir:ui';
export interface UiState { role: 'parent' | 'enfant'; childId?: string }
export const loadUi = (): UiState => {
  try { return { role: 'parent', ...JSON.parse(storage.get(UI_KEY) ?? '{}') }; } catch { return { role: 'parent' }; }
};
export const saveUi = (s: UiState) => storage.set(UI_KEY, JSON.stringify(s));
export const wipeUi = () => storage.remove(UI_KEY);
