import { useEffect, useState } from 'react';
import { loadUi, saveUi, type UiState } from './data/repository';
import { useStore } from './state/store';
import { ChildApp } from './ui/child/ChildApp';
import { Icon } from './ui/components/Icon';
import { ParentApp } from './ui/parent/ParentApp';

/**
 * Bandeau de démonstration : le changement de rôle n'est PAS une authentification.
 * En production, l'espace parent sera protégé par un compte familial
 * et l'espace enfant ouvert par un profil sur l'appareil familial.
 */
function DemoBar({ ui, setUi }: { ui: UiState; setUi: (u: UiState) => void }) {
  const { data, saveError } = useStore();
  return (
    <>
      <div className="demo-bar" role="region" aria-label="Changement de rôle (démonstration)">
        <span className="demo-bar__label">
          <span className="tag">DÉMO</span>
          <span className="hide-sm">Changement de rôle simulé, sans authentification</span>
          <span className="show-sm-only">Rôle simulé</span>
        </span>
        <div className="demo-bar__roles">
          <button className="role-btn" aria-pressed={ui.role === 'parent'} onClick={() => setUi({ ...ui, role: 'parent' })}>
            <Icon name="user" size={16} /> Parent
          </button>
          {data.children.map((c) => (
            <button key={c.id} className="role-btn" aria-pressed={ui.role === 'enfant' && ui.childId === c.id} onClick={() => setUi({ role: 'enfant', childId: c.id })}>
              {c.displayName}
            </button>
          ))}
        </div>
      </div>
      {saveError && <div className="save-error" role="alert">{saveError}</div>}
    </>
  );
}

export default function App() {
  const { data } = useStore();
  const [ui, setUiState] = useState<UiState>(loadUi);
  const setUi = (u: UiState) => { setUiState(u); saveUi(u); };
  const child = data.children.find((c) => c.id === ui.childId) ?? data.children[0];

  useEffect(() => {
    document.title = ui.role === 'parent' ? 'Espace parent — Les Îles du Savoir' : `Espace de ${child?.displayName ?? 'l’enfant'} — Les Îles du Savoir`;
  }, [ui.role, child?.displayName]);

  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <DemoBar ui={ui} setUi={setUi} />
      {ui.role === 'parent' ? <ParentApp /> : <ChildApp child={child} />}
    </>
  );
}
