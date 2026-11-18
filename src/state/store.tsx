import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createDemoData } from '../data/demoData';
import { repository, wipeUi } from '../data/repository';
import { reduce, type Action } from '../domain/logic';
import type { AppData } from '../domain/types';

interface StoreValue {
  data: AppData;
  dispatch: (a: Action) => void;
  resetDemo: () => void;
  wipeAll: () => void;
  saveError: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => repository.load());
  const [saveError, setSaveError] = useState<string | null>(null);
  const dataRef = useRef(data);

  const commit = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
    try {
      repository.save(next);
      setSaveError(null);
    } catch {
      setSaveError('La sauvegarde locale a échoué (espace plein ?). Retirez une pièce jointe volumineuse.');
    }
  }, []);

  // Écriture synchrone : chaque action est sauvegardée immédiatement.
  const dispatch = useCallback((a: Action) => commit(reduce(dataRef.current, a)), [commit]);

  // Synchronisation entre onglets (ex. parent et enfant ouverts côte à côte).
  useEffect(() => repository.subscribe((d) => { dataRef.current = d; setData(d); }), []);

  const resetDemo = useCallback(() => commit(createDemoData()), [commit]);
  const wipeAll = useCallback(() => {
    repository.wipe();
    wipeUi();
    const empty: AppData = {
      schemaVersion: 1, familyId: 'famille-locale', children: [], homeworks: [], helpEvents: [], sessions: [], activeSessionId: {}, missionProgress: {},
    };
    commit(empty);
  }, [commit]);

  const value = useMemo(() => ({ data, dispatch, resetDemo, wipeAll, saveError }), [data, dispatch, resetDemo, wipeAll, saveError]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore hors StoreProvider');
  return v;
}
