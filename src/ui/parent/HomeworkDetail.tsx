import { useState } from 'react';
import { getMission } from '../../data/missions';
import { ADULT_ACTIVITY_LABEL } from '../../domain/catalog';
import { dueLabel, formatDuration, timeOf } from '../../domain/dates';
import type { Comprehension, Homework } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Button, Modal, StatusGrid, SubjectTag } from '../components/ui';
import { HomeworkForm } from './HomeworkForm';

const HELP_KIND_LABEL: Record<string, string> = {
  indice: 'Indice demandé',
  reformulation: 'Reformulation de la consigne',
  decomposition: 'Décomposition pas à pas',
  exemple: 'Exemple différent consulté',
  bloque: 'Signale un blocage',
  adulte: 'Demande un adulte',
};

export function HomeworkDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, dispatch } = useStore();
  const [mode, setMode] = useState<'view' | 'edit' | 'verify' | 'confirm-delete'>('view');
  const [comp, setComp] = useState<Comprehension | 'keep'>('keep');
  const [note, setNote] = useState('');
  const found = data.homeworks.find((h) => h.id === id);
  if (!found) return null;
  const hw: Homework = found;
  const child = data.children.find((c) => c.id === hw.childId);
  const events = data.helpEvents.filter((e) => e.homeworkId === hw.id).slice(-8).reverse();
  const mission = getMission(hw.missionId);

  if (mode === 'edit') {
    return (
      <Modal title="Modifier le devoir" onClose={onClose}>
        <HomeworkForm
          initial={hw}
          childrenList={data.children}
          submitLabel="Enregistrer"
          onCancel={() => setMode('view')}
          onSubmit={(d) => { dispatch({ type: 'hw/update', id: hw.id, draft: d }); setMode('view'); }}
        />
      </Modal>
    );
  }

  return (
    <Modal title={hw.title} onClose={onClose}>
      <div className="stack">
        <div className="flex">
          <SubjectTag subject={hw.subject} topic={hw.topic} />
        </div>
        <div className="kv">
          <span><Icon name="user" size={16} /> <b>{child?.displayName}</b> ({child?.level})</span>
          <span><Icon name="calendar" size={16} /> Pour <b>{dueLabel(hw.dueDate).toLowerCase()}</b></span>
          {hw.estimatedMinutes && <span><Icon name="clock" size={16} /> ~{hw.estimatedMinutes} min prévues</span>}
          {hw.stats.secondsSpent > 0 && <span><Icon name="clock" size={16} /> {formatDuration(hw.stats.secondsSpent)} de travail enregistré</span>}
        </div>
        {hw.instructions && <p style={{ whiteSpace: 'pre-wrap' }}>{hw.instructions}</p>}
        {hw.adultActivity !== 'aucune' && (
          <div className="notice notice--info"><Icon name="users" /> <span>Activité avec un adulte : <b>{ADULT_ACTIVITY_LABEL[hw.adultActivity]}</b>. L’application ne peut pas la vérifier seule.</span></div>
        )}
        {hw.attachment && <img src={hw.attachment.dataUrl} alt={`Pièce jointe : ${hw.attachment.name}`} style={{ maxHeight: 240, borderRadius: 12 }} />}

        {hw.needsParentReview && (
          <div className="notice"><Icon name="edit" />
            <div>Ajouté par {child?.displayName} depuis son espace. Relisez le titre, la date et la consigne, puis confirmez ou modifiez.
              <div className="flex mt-1"><Button variant="turq" icon="check" onClick={() => dispatch({ type: 'parent/confirmHw', id: hw.id })}>C’est correct</Button></div>
            </div>
          </div>
        )}
        {hw.addedBy === 'enfant' && !hw.needsParentReview && <p className="small muted mb-0">Ajouté par {child?.displayName}, relu par un adulte.</p>}

        <StatusGrid hw={hw} />

        {hw.verificationNote && (
          <div className="notice notice--ok"><Icon name="shield" /> <span><b>Ce qui a été vérifié :</b> {hw.verificationNote}</span></div>
        )}
        {hw.progress === 'termine' && hw.verification === 'non_verifie' && (
          <div className="notice"><Icon name="alert" /> <span>{child?.displayName} a indiqué avoir terminé. Rien n’a encore été vérifié : cela ne garantit ni l’exactitude ni la compréhension.</span></div>
        )}
        {mission && !hw.verificationNote && <p className="small muted">Mission guidée liée : « {mission.title} ». La vérification se fera automatiquement sur cette activité.</p>}
        {hw.childNote && <p><b>Mot de {child?.displayName} :</b> « {hw.childNote} »</p>}
        {hw.parentNote && <p><b>Votre note :</b> {hw.parentNote}</p>}

        {(hw.stats.hintsUsed > 0 || hw.stats.correctedErrors > 0 || hw.stats.wrongAttempts > 0) && (
          <p className="small">
            {hw.stats.hintsUsed} aide{hw.stats.hintsUsed > 1 ? 's' : ''} utilisée{hw.stats.hintsUsed > 1 ? 's' : ''} ·{' '}
            {hw.stats.wrongAttempts} essai{hw.stats.wrongAttempts > 1 ? 's' : ''} à reprendre · {hw.stats.correctedErrors} erreur{hw.stats.correctedErrors > 1 ? 's' : ''} corrigée{hw.stats.correctedErrors > 1 ? 's' : ''} par {child?.displayName}
          </p>
        )}

        {events.length > 0 && (
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Historique d’aide ({events.length})</summary>
            <ul className="small">
              {events.map((e) => (
                <li key={e.id}>
                  {timeOf(e.at)} — {HELP_KIND_LABEL[e.kind]}{e.detail ? ` : « ${e.detail} »` : ''}{e.resolvedAt ? ' (traité)' : ''}
                </li>
              ))}
            </ul>
          </details>
        )}

        {mode === 'verify' ? (
          <form
            className="card"
            style={{ boxShadow: 'none', background: 'var(--cream)' }}
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({ type: 'parent/verify', id: hw.id, comprehension: comp === 'keep' ? undefined : comp, note: note.trim() || undefined });
              setMode('view');
            }}
          >
            <h3>Vérifier avec {child?.displayName}</h3>
            <fieldset style={{ border: 0, padding: 0, margin: '0 0 1rem' }}>
              <legend style={{ fontWeight: 700, marginBottom: '.3rem' }}>Votre constat sur la compréhension</legend>
              <div className="radio-cards">
                <label className="radio-card"><input type="radio" name="comp" checked={comp === 'keep'} onChange={() => setComp('keep')} /> Je ne me prononce pas</label>
                <label className="radio-card"><input type="radio" name="comp" checked={comp === 'a_consolider'} onChange={() => setComp('a_consolider')} /> À consolider</label>
                <label className="radio-card"><input type="radio" name="comp" checked={comp === 'reussie_activite'} onChange={() => setComp('reussie_activite')} /> Réussi sur ce devoir</label>
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="vnote">Note (facultatif)</label>
              <input id="vnote" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. Récitée sans erreur, hésitation strophe 2" />
            </div>
            <div className="modal__actions">
              <Button variant="ghost" onClick={() => setMode('view')}>Annuler</Button>
              <Button type="submit" icon="check">Marquer vérifié par un adulte</Button>
            </div>
          </form>
        ) : mode === 'confirm-delete' ? (
          <div className="notice" role="alert">
            <Icon name="alert" />
            <div>
              <p className="mb-0"><b>Supprimer ce devoir ?</b> Son historique d’aide sera aussi effacé.</p>
              <div className="flex mt-1">
                <Button variant="ghost" onClick={() => setMode('view')}>Garder</Button>
                <Button variant="danger" icon="trash" onClick={() => { dispatch({ type: 'hw/delete', id: hw.id }); onClose(); }}>Supprimer</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex" style={{ marginTop: '1rem' }}>
            {hw.help !== 'aucun' && (
              <Button variant="turq" icon="check" onClick={() => dispatch({ type: 'parent/resolveHelp', id: hw.id })}>Aide apportée</Button>
            )}
            {hw.verification !== 'verifie_adulte' && (
              <Button icon="user" onClick={() => setMode('verify')}>Vérifier ensemble</Button>
            )}
            {hw.progress === 'termine' && (
              <Button variant="secondary" icon="refresh" onClick={() => dispatch({ type: 'parent/reopen', id: hw.id })}>À reprendre</Button>
            )}
            <Button variant="secondary" icon="edit" onClick={() => setMode('edit')}>Modifier</Button>
            <Button variant="danger" icon="trash" onClick={() => setMode('confirm-delete')}>Supprimer</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
