import { useEffect, useState } from 'react';
import type { HomeworkDraft } from '../../domain/logic';
import type { Attachment, Child } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Button, Modal } from '../components/ui';
import { emptyDraft, fileToAttachment, HomeworkFields, validateDraft } from './HomeworkForm';

/**
 * Ajout par photo de l'agenda.
 * Aucun service de reconnaissance n'est connecté dans le prototype :
 * la photo est seulement affichée sur cet appareil pour faciliter la saisie.
 * Point d'extension : `AgendaRecognizer` (voir README) pourra pré-remplir
 * les brouillons, qui resteront à relire et valider par le parent.
 */
export function PhotoImport({ childrenList, defaultChildId, onClose }: { childrenList: Child[]; defaultChildId: string; onClose: () => void }) {
  const { dispatch } = useStore();
  const [photo, setPhoto] = useState<{ url: string; file: File } | null>(null);
  const [attach, setAttach] = useState(false);
  const [drafts, setDrafts] = useState<HomeworkDraft[]>([emptyDraft(defaultChildId)]);
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  const errors = drafts.map(validateDraft);
  const valid = errors.every((e) => Object.keys(e).length === 0);

  const save = async () => {
    setShowErrors(true);
    if (!valid) return;
    let attachment: Attachment | undefined;
    if (attach && photo) attachment = await fileToAttachment(photo.file, 1100);
    dispatch({ type: 'hw/add', drafts: drafts.map((d) => ({ ...d, title: d.title.trim(), topic: d.topic?.trim() || undefined, attachment: d.attachment ?? attachment })) });
    setDone(drafts.length);
  };

  if (done) {
    return (
      <Modal title="Devoirs ajoutés" onClose={onClose}>
        <div className="notice notice--ok"><Icon name="check-circle" /> <span>{done} devoir{done > 1 ? 's ajoutés' : ' ajouté'}. Ils apparaissent déjà dans l’espace enfant.</span></div>
        <div className="modal__actions"><Button onClick={onClose}>Fermer</Button></div>
      </Modal>
    );
  }

  return (
    <Modal title="Ajouter depuis une photo de l’agenda" onClose={onClose} wide>
      <div className="notice notice--info" style={{ marginBottom: '1rem' }}>
        <Icon name="shield" />
        <span>
          <b>Aucun service de reconnaissance n’est connecté.</b> La photo n’est pas analysée et ne quitte pas cet appareil :
          elle s’affiche simplement à côté du formulaire pour vous aider à recopier les devoirs.
        </span>
      </div>

      {!photo ? (
        <div className="center" style={{ padding: '1.5rem 0' }}>
          <label className="btn btn--primary btn--lg">
            <Icon name="camera" /> Photographier ou importer l’agenda
            <input
              type="file" accept="image/*" capture="environment" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto({ url: URL.createObjectURL(f), file: f }); }}
            />
          </label>
          <p className="small muted mt-1">Sur téléphone, l’appareil photo s’ouvre directement. Vous pouvez aussi passer cette étape.</p>
          <Button variant="ghost" onClick={() => setPhoto({ url: '', file: new File([], 'aucune') })}>Saisir sans photo</Button>
        </div>
      ) : (
        <div className="photo-import">
          <div className="photo-import__preview">
            {photo.url ? (
              <>
                <img src={photo.url} alt="Photo de l’agenda importée (non analysée)" />
                <label className="checkbox small">
                  <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
                  Joindre aussi la photo aux devoirs (stockée sur cet appareil)
                </label>
              </>
            ) : (
              <p className="muted small" style={{ padding: '1rem' }}>Pas de photo : saisie manuelle uniquement.</p>
            )}
          </div>
          <div>
            <h3>Devoirs relevés <span className="muted small">— relisez avant de valider</span></h3>
            {drafts.map((d, i) => (
              <div key={i} className="draft-row">
                <div className="flex between" style={{ marginBottom: '.5rem' }}>
                  <b>Devoir {i + 1}</b>
                  {drafts.length > 1 && (
                    <button className="icon-btn" aria-label={`Retirer le devoir ${i + 1}`} onClick={() => setDrafts(drafts.filter((_, j) => j !== i))}>
                      <Icon name="trash" />
                    </button>
                  )}
                </div>
                <HomeworkFields
                  draft={d}
                  onChange={(nd) => setDrafts(drafts.map((x, j) => (j === i ? nd : x)))}
                  childrenList={childrenList}
                  idPrefix={`imp${i}`}
                  showAttachment={false}
                  errors={showErrors ? errors[i] : {}}
                />
              </div>
            ))}
            <Button variant="secondary" icon="plus" className="mt-1" onClick={() => setDrafts([...drafts, { ...emptyDraft(drafts[drafts.length - 1].childId), dueDate: drafts[drafts.length - 1].dueDate }])}>
              Ajouter une autre ligne
            </Button>
            {showErrors && !valid && <p className="form-error mt-1" role="alert">Certains devoirs n’ont pas de titre ou d’échéance.</p>}
            <div className="modal__actions">
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button icon="check" onClick={save}>J’ai relu, ajouter {drafts.length} devoir{drafts.length > 1 ? 's' : ''}</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
