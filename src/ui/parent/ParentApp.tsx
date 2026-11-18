import { useState } from 'react';
import { attentionItems } from '../../domain/logic';
import { useStore } from '../../state/store';
import { Icon, type IconName } from '../components/Icon';
import { Modal } from '../components/ui';
import { Children } from './Children';
import { Dashboard } from './Dashboard';
import { DataPage } from './DataPage';
import { HomeworkDetail } from './HomeworkDetail';
import { emptyDraft, HomeworkForm } from './HomeworkForm';
import { Homeworks } from './Homeworks';
import { PhotoImport } from './PhotoImport';

type Page = 'dashboard' | 'devoirs' | 'enfants' | 'donnees';
const NAV: { id: Page; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'home' },
  { id: 'devoirs', label: 'Devoirs', icon: 'list' },
  { id: 'enfants', label: 'Enfants', icon: 'users' },
  { id: 'donnees', label: 'Données', icon: 'shield' },
];

export function ParentApp() {
  const { data, dispatch } = useStore();
  const [page, setPage] = useState<Page>('dashboard');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [photo, setPhoto] = useState(false);
  const attention = attentionItems(data).length;
  const firstChild = data.children[0]?.id ?? '';
  const editHw = editId ? data.homeworks.find((h) => h.id === editId) : undefined;

  const needChild = () => { if (!firstChild) { setPage('enfants'); return false; } return true; };

  return (
    <div className="parent parent-shell">
      <nav className="parent-nav" aria-label="Espace parent">
        <div className="brand"><Icon name="map" size={22} /> Les Îles du Savoir</div>
        {NAV.map((n) => (
          <button key={n.id} aria-current={page === n.id ? 'page' : undefined} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={22} />
            <span>{n.label}{n.id === 'dashboard' && attention > 0 ? <span className="sr-only"> ({attention} points d’attention)</span> : null}</span>
          </button>
        ))}
      </nav>
      <main id="contenu" className="parent-main">
        {page === 'dashboard' && <Dashboard onOpen={setOpenId} onAdd={() => needChild() && setAdding(true)} onPhoto={() => needChild() && setPhoto(true)} />}
        {page === 'devoirs' && <Homeworks onOpen={setOpenId} onAdd={() => needChild() && setAdding(true)} onPhoto={() => needChild() && setPhoto(true)} onEdit={setEditId} />}
        {page === 'enfants' && <Children />}
        {page === 'donnees' && <DataPage />}
      </main>

      {openId && <HomeworkDetail id={openId} onClose={() => setOpenId(null)} />}
      {adding && (
        <Modal title="Nouveau devoir" onClose={() => setAdding(false)}>
          <HomeworkForm
            initial={emptyDraft(firstChild)}
            childrenList={data.children}
            submitLabel="Ajouter le devoir"
            onCancel={() => setAdding(false)}
            onSubmit={(d) => { dispatch({ type: 'hw/add', drafts: [d] }); setAdding(false); }}
          />
        </Modal>
      )}
      {editHw && (
        <Modal title="Modifier le devoir" onClose={() => setEditId(null)}>
          <HomeworkForm
            initial={editHw}
            childrenList={data.children}
            submitLabel="Enregistrer"
            onCancel={() => setEditId(null)}
            onSubmit={(d) => { dispatch({ type: 'hw/update', id: editHw.id, draft: d }); setEditId(null); }}
          />
        </Modal>
      )}
      {photo && <PhotoImport childrenList={data.children} defaultChildId={firstChild} onClose={() => setPhoto(false)} />}
    </div>
  );
}
