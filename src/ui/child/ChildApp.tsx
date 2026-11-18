import { useEffect, useState } from 'react';
import type { Child } from '../../domain/types';
import { Icon, type IconName } from '../components/Icon';
import { ChildAddHomework } from './ChildAddHomework';
import { ChildHome } from './ChildHome';
import { Islands, Logbook, NoChild, Refuge } from './ChildPages';
import { Session } from './Session';

type Page = 'accueil' | 'carnet' | 'iles' | 'refuge' | 'seance' | 'ajout';
const NAV: { id: Exclude<Page, 'seance'>; label: string; icon: IconName }[] = [
  { id: 'accueil', label: 'Accueil', icon: 'home' },
  { id: 'carnet', label: 'Carnet', icon: 'list' },
  { id: 'iles', label: 'Îles', icon: 'map' },
  { id: 'refuge', label: 'Refuge', icon: 'star' },
];

export function ChildApp({ child }: { child: Child | undefined }) {
  const [page, setPage] = useState<Page>('accueil');
  useEffect(() => { setPage('accueil'); }, [child?.id]);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  if (!child) return <NoChild />;
  const cls = `${child.preferences.textSize === 'grand' ? 'kid--large' : ''} ${child.preferences.animations ? '' : 'no-anim'}`;

  if (page === 'seance') {
    return <div className={cls}><Session child={child} onExit={() => setPage('accueil')} /></div>;
  }

  return (
    <div className={`kid ${cls}`}>
      <header className="kid-top">
        <div className="kid-top__title"><Icon name="map" /> Les Îles du Savoir</div>
        <div className="kid-top__spacer" />
        <span className="firefly-count" aria-label={`${child.fireflies} lucioles`}><Icon name="firefly" size={18} /> <span>{child.fireflies}</span></span>
      </header>
      <main id="contenu" className="kid-main">
        {page === 'accueil' && <ChildHome child={child} onStart={() => setPage('seance')} onNavigate={setPage} onAdd={() => setPage('ajout')} />}
        {page === 'carnet' && <Logbook child={child} onAdd={() => setPage('ajout')} />}
        {page === 'ajout' && <ChildAddHomework child={child} onDone={() => setPage('accueil')} />}
        {page === 'iles' && <Islands child={child} />}
        {page === 'refuge' && <Refuge child={child} />}
      </main>
      <nav className="kid-nav" aria-label="Espace enfant">
        {NAV.map((n) => (
          <button key={n.id} aria-current={page === n.id ? 'page' : undefined} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={24} />{n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
