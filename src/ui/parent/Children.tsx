import { useState, type FormEvent } from 'react';
import type { ChildDraft } from '../../domain/logic';
import type { Child, Level } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Panda } from '../components/Panda';
import { Button, Empty, Modal } from '../components/ui';

const blank: ChildDraft = { displayName: '', level: 'CM2', companionName: 'Pépin', preferences: { textSize: 'normal', animations: true, sessionMinutes: 25 } };

function ChildForm({ initial, onSubmit, onCancel }: { initial: ChildDraft; onSubmit: (d: ChildDraft) => void; onCancel: () => void }) {
  const [d, setD] = useState<ChildDraft>(initial);
  const [err, setErr] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!d.displayName.trim()) return setErr('Indiquez un prénom ou un pseudonyme.');
    onSubmit({ ...d, displayName: d.displayName.trim(), companionName: d.companionName.trim() || 'Pépin' });
  };
  return (
    <form onSubmit={submit} noValidate>
      <div className="notice notice--info" style={{ marginBottom: '1rem' }}>
        <Icon name="shield" />
        <span>Seules ces informations sont demandées. Pas de nom de famille, d’école, d’adresse ni de date de naissance.</span>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="cf-name">Prénom ou pseudonyme</label>
          <input id="cf-name" className="input" value={d.displayName} maxLength={24} onChange={(e) => setD({ ...d, displayName: e.target.value })} aria-invalid={!!err} />
          {err && <span className="form-error">{err}</span>}
        </div>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, marginBottom: '.3rem' }}>Niveau</legend>
          <div className="radio-cards">
            {(['CM1', 'CM2'] as Level[]).map((l) => (
              <label key={l} className="radio-card"><input type="radio" name="cf-level" checked={d.level === l} onChange={() => setD({ ...d, level: l })} /> {l}</label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="field">
        <label htmlFor="cf-comp">Prénom du compagnon panda roux</label>
        <input id="cf-comp" className="input" value={d.companionName} maxLength={20} onChange={(e) => setD({ ...d, companionName: e.target.value })} />
        <span className="hint">L’enfant peut le choisir avec vous.</span>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="cf-dur">Durée de séance souhaitée</label>
          <select id="cf-dur" className="select" value={d.preferences.sessionMinutes} onChange={(e) => setD({ ...d, preferences: { ...d.preferences, sessionMinutes: Number(e.target.value) } })}>
            {[15, 20, 25, 30, 40, 45].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
          <span className="hint">Le compagnon proposera une pause, sans jamais l’imposer.</span>
        </div>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, marginBottom: '.3rem' }}>Affichage</legend>
          <label className="checkbox"><input type="checkbox" checked={d.preferences.textSize === 'grand'} onChange={(e) => setD({ ...d, preferences: { ...d.preferences, textSize: e.target.checked ? 'grand' : 'normal' } })} /> Texte plus grand</label>
          <label className="checkbox"><input type="checkbox" checked={d.preferences.animations} onChange={(e) => setD({ ...d, preferences: { ...d.preferences, animations: e.target.checked } })} /> Animations</label>
        </fieldset>
      </div>
      <div className="modal__actions">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button type="submit" icon="check">Enregistrer</Button>
      </div>
    </form>
  );
}

export function Children() {
  const { data, dispatch } = useStore();
  const [editing, setEditing] = useState<Child | 'new' | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <div>
      <div className="page-head">
        <div><h1>Enfants</h1><p className="sub">Profils et préférences de séance.</p></div>
        <Button icon="plus" onClick={() => setEditing('new')}>Ajouter un enfant</Button>
      </div>
      {data.children.length === 0 && <Empty icon="users">Aucun profil pour l’instant.</Empty>}
      <div className="dash-grid">
        {data.children.map((c) => {
          const n = data.homeworks.filter((h) => h.childId === c.id).length;
          return (
            <section key={c.id} className="card">
              <div className="flex" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                <Panda mood="accueil" size={84} animated={false} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h2 className="mb-0">{c.displayName}</h2>
                  <p className="muted mb-0">{c.level} · compagnon : <b>{c.companionName}</b></p>
                  <p className="small mb-0">Séance de {c.preferences.sessionMinutes} min · texte {c.preferences.textSize === 'grand' ? 'agrandi' : 'normal'} · animations {c.preferences.animations ? 'activées' : 'désactivées'}</p>
                  <p className="small muted">{n} devoir{n > 1 ? 's' : ''} · {c.fireflies} lucioles d’effort</p>
                  {confirm === c.id ? (
                    <div className="notice" role="alert">
                      <Icon name="alert" />
                      <div>
                        <b>Supprimer {c.displayName} et toutes ses données ?</b> ({n} devoirs, séances, historique d’aide). Action définitive.
                        <div className="flex mt-1">
                          <Button variant="ghost" onClick={() => setConfirm(null)}>Annuler</Button>
                          <Button variant="danger" icon="trash" onClick={() => { dispatch({ type: 'child/delete', id: c.id }); setConfirm(null); }}>Supprimer définitivement</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex">
                      <Button variant="secondary" icon="edit" onClick={() => setEditing(c)}>Modifier</Button>
                      <Button variant="danger" icon="trash" onClick={() => setConfirm(c.id)}>Supprimer</Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      {editing && (
        <Modal title={editing === 'new' ? 'Nouveau profil enfant' : `Profil de ${editing.displayName}`} onClose={() => setEditing(null)}>
          <ChildForm
            initial={editing === 'new' ? blank : { displayName: editing.displayName, level: editing.level, companionName: editing.companionName, preferences: editing.preferences }}
            onCancel={() => setEditing(null)}
            onSubmit={(d) => {
              if (editing === 'new') dispatch({ type: 'child/add', draft: d });
              else dispatch({ type: 'child/update', id: editing.id, draft: d });
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
