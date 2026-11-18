import { useEffect, useState } from 'react';
import { CompanionProvider, useCompanion } from '../../companion/CompanionProvider';
import type { Child } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon, type IconName } from '../components/Icon';
import { PaintFilters } from '../components/Illustrations';
import { ChildAddHomework } from './ChildAddHomework';
import { ChildSettings, IntroTour, PracticeMission } from './ChildExtras';
import { ChildHome } from './ChildHome';
import { Islands, Logbook, NoChild, Refuge } from './ChildPages';
import { Session } from './Session';

type Page = 'accueil' | 'carnet' | 'iles' | 'refuge' | 'seance' | 'ajout' | 'essai';
const NAV: { id: 'accueil' | 'carnet' | 'iles' | 'refuge'; label: string; icon: IconName }[] = [
  { id: 'accueil', label: 'Accueil', icon: 'home' },
  { id: 'carnet', label: 'Carnet', icon: 'list' },
  { id: 'iles', label: 'Îles', icon: 'map' },
  { id: 'refuge', label: 'Refuge', icon: 'star' },
];

export function ChildApp({ child }: { child: Child | undefined }) {
  if (!child) return <NoChild />;
  // Le compagnon vit tant que l'on reste dans l'espace de cet enfant (navigation comprise).
  return (
    <CompanionProvider key={child.id} child={child}>
      <ChildShell child={child} />
    </CompanionProvider>
  );
}

function ChildShell({ child }: { child: Child }) {
  const { data } = useStore();
  const [page, setPageRaw] = useState<Page>('accueil');
  const [settings, setSettings] = useState(false);
  const hasHomework = data.homeworks.some((h) => h.childId === child.id);
  // Première visite : carnet vide et présentation jamais vue. Reste accessible ensuite via les réglages.
  const [intro, setIntro] = useState(() => !child.introSeen && !hasHomework);
  const companion = useCompanion();
  const dismiss = companion?.dismiss;
  // Changer de page efface la bulle : un message n'a de sens que dans son contexte.
  const setPage = (p: Page) => { dismiss?.(); setPageRaw(p); };
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const cls = `${child.preferences.textSize === 'grand' ? 'kid--large' : ''} ${child.preferences.animations ? '' : 'no-anim'}`;

  if (page === 'seance') {
    return <div className={cls}><PaintFilters /><Session child={child} onExit={() => setPage('accueil')} /></div>;
  }

  return (
    <div className={`kid ${cls}`}>
      <PaintFilters />
      <header className="kid-top">
        <div className="kid-top__title"><Icon name="map" /> Les Îles du Savoir</div>
        <div className="kid-top__spacer" />
        <span className="firefly-count" aria-label={`${child.fireflies} lucioles`}><Icon name="firefly" size={18} /> <span>{child.fireflies}</span></span>
        <button className="icon-btn" onClick={() => setSettings(true)} aria-label="Mes réglages"><Icon name="settings" /></button>
      </header>
      <main id="contenu" className="kid-main">
        {page === 'accueil' && (
          <ChildHome child={child} onStart={() => setPage('seance')} onNavigate={setPage} onAdd={() => setPage('ajout')} onIntro={() => setIntro(true)} onPractice={() => setPage('essai')} />
        )}
        {page === 'carnet' && <Logbook child={child} onAdd={() => setPage('ajout')} />}
        {page === 'ajout' && <ChildAddHomework child={child} onDone={() => setPage('accueil')} />}
        {page === 'iles' && <Islands child={child} />}
        {page === 'refuge' && <Refuge child={child} onNavigate={setPage} />}
        {page === 'essai' && <PracticeMission child={child} onDone={() => setPage('accueil')} />}
      </main>
      <nav className="kid-nav" aria-label="Espace enfant">
        {NAV.map((n) => (
          <button key={n.id} aria-current={page === n.id ? 'page' : undefined} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={24} />{n.label}
          </button>
        ))}
      </nav>
      {intro && <IntroTour child={child} onClose={() => setIntro(false)} onGo={setPage} onPractice={() => setPage('essai')} />}
      {settings && <ChildSettings child={child} onClose={() => setSettings(false)} onIntro={() => setIntro(true)} onPractice={() => setPage('essai')} />}
    </div>
  );
}
