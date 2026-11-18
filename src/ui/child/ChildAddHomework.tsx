import { useState } from 'react';
import { ADULT_ACTIVITY_LABEL, SUBJECTS } from '../../domain/catalog';
import { addDays, longDate, today } from '../../domain/dates';
import type { AdultActivity, Attachment, Child, SubjectId } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Panda } from '../components/Panda';
import { Button } from '../components/ui';
import { fileToAttachment } from '../parent/HomeworkForm';

/**
 * L'enfant recopie un devoir de son agenda.
 * Formulaire volontairement court ; le devoir arrive tout de suite dans son carnet
 * et reste marqué « à relire » pour l'adulte, qui peut le corriger.
 */
export function ChildAddHomework({ child, onDone }: { child: Child; onDone: () => void }) {
  const { dispatch } = useStore();
  const t = today();
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [due, setDue] = useState<string>(addDays(t, 1));
  const [customDate, setCustomDate] = useState(false);
  const [adult, setAdult] = useState<AdultActivity>('aucune');
  const [photo, setPhoto] = useState<Attachment | undefined>();
  const [photoErr, setPhotoErr] = useState('');
  const [tried, setTried] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const missing = [!subject && 'la matière', !title.trim() && 'ce qu’il faut faire', !due && 'le jour'].filter(Boolean) as string[];

  const reset = () => {
    setSubject(null); setTitle(''); setDetails(''); setDue(addDays(t, 1)); setCustomDate(false);
    setAdult('aucune'); setPhoto(undefined); setTried(false); setAdded(null);
  };

  const submit = () => {
    setTried(true);
    if (missing.length || !subject) return;
    dispatch({
      type: 'hw/add',
      addedBy: 'enfant',
      drafts: [{ childId: child.id, subject, title: title.trim(), instructions: details.trim(), dueDate: due, adultActivity: adult, attachment: photo }],
    });
    setAdded(title.trim());
    window.scrollTo(0, 0);
  };

  if (added) {
    return (
      <section className="kid-card center pop-in" aria-live="polite">
        <Panda mood="celebration" size={150} label={`${child.companionName} est content`} animated={child.preferences.animations} />
        <h1>C’est noté dans ton carnet !</h1>
        <p>« {added} » est ajouté. Ton adulte le relira pour vérifier que tout est juste.</p>
        <div className="flex" style={{ justifyContent: 'center' }}>
          <Button variant="secondary" icon="plus" onClick={reset}>Ajouter un autre devoir</Button>
          <Button variant="sun" icon="home" onClick={onDone}>Retour à l’accueil</Button>
        </div>
      </section>
    );
  }

  const dayBtn = (label: string, value: string) => (
    <button type="button" className="choice-btn" aria-pressed={!customDate && due === value} onClick={() => { setCustomDate(false); setDue(value); }}>
      <Icon name="calendar" />
      <span>{label} <span className="small muted">({longDate(value)})</span></span>
    </button>
  );

  return (
    <section className="kid-card" aria-labelledby="add-title">
      <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
        <Panda mood="reflexion" size={90} animated={false} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 id="add-title" className="mb-0">Ajouter un devoir</h1>
          <p className="muted mb-0">Recopie ce qui est écrit dans ton agenda. Ton adulte le relira.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <fieldset className="add-step">
          <legend><span className="add-step__num">1</span> Quelle matière ?</legend>
          <div className="subject-grid">
            {SUBJECTS.map((s) => (
              <button key={s.id} type="button" className="subject-btn" aria-pressed={subject === s.id} style={{ ['--subject' as string]: s.color }} onClick={() => setSubject(s.id)}>
                <span className="subject-tag__dot" aria-hidden><Icon name={s.icon} size={18} /></span>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="add-step">
          <legend><span className="add-step__num">2</span> Qu’est-ce qu’il faut faire ?</legend>
          <div className="field">
            <label htmlFor="add-what">Le devoir, comme dans l’agenda</label>
            <input id="add-what" className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Exercices 3 et 4 page 52" aria-invalid={tried && !title.trim()} />
          </div>
          <div className="field">
            <label htmlFor="add-details">Plus de détails <span className="muted small">(facultatif)</span></label>
            <textarea id="add-details" className="textarea" value={details} maxLength={400} onChange={(e) => setDetails(e.target.value)} placeholder="Ex. Apprendre la règle en rouge dans le cahier de leçons" />
          </div>
        </fieldset>

        <fieldset className="add-step">
          <legend><span className="add-step__num">3</span> Pour quand ?</legend>
          <div className="choice-list">
            {dayBtn('Demain', addDays(t, 1))}
            {dayBtn('Après-demain', addDays(t, 2))}
            <button type="button" className="choice-btn" aria-pressed={customDate} onClick={() => setCustomDate(true)}>
              <Icon name="calendar" /> <span>Un autre jour</span>
            </button>
            {customDate && (
              <div className="field">
                <label htmlFor="add-date">Choisis le jour</label>
                <input id="add-date" type="date" className="input" min={t} value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="add-step">
          <legend><span className="add-step__num">4</span> Faut-il un adulte ?</legend>
          <div className="radio-cards">
            {(Object.keys(ADULT_ACTIVITY_LABEL) as AdultActivity[]).map((k) => (
              <label key={k} className="radio-card">
                <input type="radio" name="add-adult" checked={adult === k} onChange={() => setAdult(k)} />
                {k === 'aucune' ? 'Non' : ADULT_ACTIVITY_LABEL[k]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="add-step">
          <legend><span className="add-step__num">5</span> Une photo ? <span className="muted small">(facultatif)</span></legend>
          {photo ? (
            <div className="flex">
              <img src={photo.dataUrl} alt="Photo ajoutée au devoir" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12 }} />
              <Button variant="ghost" icon="trash" onClick={() => setPhoto(undefined)}>Retirer la photo</Button>
            </div>
          ) : (
            <label className="btn btn--secondary">
              <Icon name="camera" /> Photographier l’agenda ou la fiche
              <input
                type="file" accept="image/*" capture="environment" className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { setPhoto(await fileToAttachment(f)); setPhotoErr(''); } catch { setPhotoErr('La photo n’a pas pu être lue.'); }
                }}
              />
            </label>
          )}
          <p className="small muted" style={{ marginTop: '.4rem' }}>La photo reste sur cet appareil. Elle aide ton adulte à relire.</p>
          {photoErr && <p className="form-error">{photoErr}</p>}
        </fieldset>

        {tried && missing.length > 0 && (
          <p className="feedback feedback--retry" role="alert"><Icon name="bulb" /> <span>Il manque encore {missing.join(', ')}.</span></p>
        )}
        <div className="flex mt-1" style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" icon="arrow-left" onClick={onDone}>Annuler</Button>
          <Button type="submit" variant="sun" size="lg" icon="check">Ajouter à mon carnet</Button>
        </div>
      </form>
    </section>
  );
}
