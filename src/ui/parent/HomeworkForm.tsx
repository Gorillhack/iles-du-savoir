import { useState, type FormEvent } from 'react';
import { MISSIONS } from '../../data/missions';
import { ADULT_ACTIVITY_LABEL, SUBJECTS } from '../../domain/catalog';
import { addDays, today } from '../../domain/dates';
import type { HomeworkDraft } from '../../domain/logic';
import type { AdultActivity, Attachment, Child, Homework, SubjectId } from '../../domain/types';
import { Icon } from '../components/Icon';
import { Button } from '../components/ui';

export const emptyDraft = (childId: string): HomeworkDraft => ({
  childId,
  subject: 'maths',
  topic: '',
  title: '',
  instructions: '',
  dueDate: addDays(today(), 1),
  estimatedMinutes: undefined,
  adultActivity: 'aucune',
  missionId: undefined,
});

/** Réduit une image côté navigateur pour limiter l'espace utilisé localement. */
export async function fileToAttachment(file: File, maxSide = 1280): Promise<Attachment> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { name: file.name, dataUrl: canvas.toDataURL('image/jpeg', 0.78) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface FieldsProps {
  draft: HomeworkDraft;
  onChange: (d: HomeworkDraft) => void;
  childrenList: Child[];
  idPrefix: string;
  showAttachment?: boolean;
  errors?: Partial<Record<keyof HomeworkDraft, string>>;
}

/** Champs réutilisés par le formulaire simple et par l'import photo. */
export function HomeworkFields({ draft, onChange, childrenList, idPrefix, showAttachment = true, errors = {} }: FieldsProps) {
  const set = <K extends keyof HomeworkDraft>(k: K, v: HomeworkDraft[K]) => onChange({ ...draft, [k]: v });
  const child = childrenList.find((c) => c.id === draft.childId);
  const missions = MISSIONS.filter((m) => m.level === 'adaptatif' || m.level === child?.level);
  const [attErr, setAttErr] = useState('');
  const id = (s: string) => `${idPrefix}-${s}`;

  return (
    <>
      <div className="row">
        <div className="field">
          <label htmlFor={id('child')}>Enfant</label>
          <select id={id('child')} className="select" value={draft.childId} onChange={(e) => set('childId', e.target.value)}>
            {childrenList.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName} ({c.level})</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id('subject')}>Matière</label>
          <select id={id('subject')} className="select" value={draft.subject} onChange={(e) => set('subject', e.target.value as SubjectId)}>
            {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor={id('title')}>Titre <span aria-hidden>*</span></label>
          <input id={id('title')} className="input" required value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Exercices 4 et 5 p. 62" aria-invalid={!!errors.title} aria-describedby={errors.title ? id('title-err') : undefined} />
          {errors.title && <span id={id('title-err')} className="form-error">{errors.title}</span>}
        </div>
        <div className="field">
          <label htmlFor={id('topic')}>Notion <span className="muted small">(facultatif)</span></label>
          <input id={id('topic')} className="input" value={draft.topic ?? ''} onChange={(e) => set('topic', e.target.value)} placeholder="Ex. Fractions" />
        </div>
      </div>
      <div className="field">
        <label htmlFor={id('instr')}>Consigne</label>
        <textarea id={id('instr')} className="textarea" value={draft.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="Recopiez la consigne de l’agenda, avec les mots de la maîtresse ou du maître." />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor={id('due')}>Pour le <span aria-hidden>*</span></label>
          <input id={id('due')} type="date" className="input" required value={draft.dueDate} onChange={(e) => set('dueDate', e.target.value)} aria-invalid={!!errors.dueDate} />
          {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
        </div>
        <div className="field">
          <label htmlFor={id('dur')}>Durée estimée <span className="muted small">(min, facultatif)</span></label>
          <input id={id('dur')} type="number" inputMode="numeric" min={1} max={180} className="input" value={draft.estimatedMinutes ?? ''} onChange={(e) => set('estimatedMinutes', e.target.value ? Number(e.target.value) : undefined)} />
        </div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: '0 0 1rem' }}>
        <legend className="label" style={{ fontWeight: 700, marginBottom: '.3rem' }}>Nécessite un adulte ?</legend>
        <div className="radio-cards">
          {(Object.keys(ADULT_ACTIVITY_LABEL) as AdultActivity[]).map((k) => (
            <label key={k} className="radio-card">
              <input type="radio" name={id('adult')} checked={draft.adultActivity === k} onChange={() => set('adultActivity', k)} />
              {k === 'aucune' ? 'Non' : ADULT_ACTIVITY_LABEL[k]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor={id('mission')}>Mission guidée <span className="muted small">(démonstration)</span></label>
        <select id={id('mission')} className="select" value={draft.missionId ?? ''} onChange={(e) => set('missionId', e.target.value || undefined)}>
          <option value="">Aucune — suivi simple, sans correction automatique</option>
          {missions.map((m) => (
            <option key={m.id} value={m.id}>{m.title} ({m.level === 'adaptatif' ? `adapté au ${child?.level ?? 'niveau'}` : m.level})</option>
          ))}
        </select>
        <span className="hint">Seules les trois missions de démonstration disposent d’une aide pas à pas et d’une vérification.</span>
      </div>
      {showAttachment && (
        <div className="field">
          <span className="label">Pièce jointe <span className="muted small">(image, facultatif — reste sur cet appareil)</span></span>
          {draft.attachment ? (
            <div className="flex">
              <img src={draft.attachment.dataUrl} alt={`Pièce jointe : ${draft.attachment.name}`} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10 }} />
              <span className="small">{draft.attachment.name}</span>
              <Button variant="ghost" icon="trash" onClick={() => set('attachment', undefined)}>Retirer</Button>
            </div>
          ) : (
            <label className="btn btn--secondary" style={{ justifySelf: 'start' }}>
              <Icon name="paperclip" /> Ajouter une image
              <input
                type="file" accept="image/*" className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { set('attachment', await fileToAttachment(f)); setAttErr(''); } catch { setAttErr('Image illisible.'); }
                }}
              />
            </label>
          )}
          {attErr && <span className="form-error">{attErr}</span>}
        </div>
      )}
    </>
  );
}

export const validateDraft = (d: HomeworkDraft) => {
  const errors: Partial<Record<keyof HomeworkDraft, string>> = {};
  if (!d.title.trim()) errors.title = 'Indiquez un titre.';
  if (!d.dueDate) errors.dueDate = 'Indiquez une échéance.';
  return errors;
};

export function HomeworkForm({ initial, childrenList, onSubmit, onCancel, submitLabel }: {
  initial: HomeworkDraft | Homework;
  childrenList: Child[];
  onSubmit: (d: HomeworkDraft) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [draft, setDraft] = useState<HomeworkDraft>({
    childId: initial.childId, subject: initial.subject, topic: initial.topic, title: initial.title, instructions: initial.instructions,
    dueDate: initial.dueDate, estimatedMinutes: initial.estimatedMinutes, attachment: initial.attachment, adultActivity: initial.adultActivity, missionId: initial.missionId,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateDraft>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateDraft(draft);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...draft, title: draft.title.trim(), topic: draft.topic?.trim() || undefined });
  };

  return (
    <form onSubmit={submit} noValidate>
      <HomeworkFields draft={draft} onChange={setDraft} childrenList={childrenList} idPrefix="hwf" errors={errors} />
      <div className="modal__actions">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button type="submit" icon="check">{submitLabel}</Button>
      </div>
    </form>
  );
}
