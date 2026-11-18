import { useEffect, useRef, useState } from 'react';
import { useCompanionEmit } from '../../companion/CompanionProvider';
import { PepinLive } from '../../companion/Pepin';
import { useSpeech } from '../../companion/useSpeech';
import { PRACTICE_MISSION } from '../../data/missions';
import type { Child, Homework } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Panda } from '../components/Panda';
import { Button, Modal, SubjectTag } from '../components/ui';
import { MissionPlayer, type MissionHandle } from './MissionPlayer';

const NAME_IDEAS = ['Pépin', 'Moka', 'Noisette', 'Cannelle', 'Filou'];

/* ------------------------- Première visite ------------------------- */

export function IntroTour({ child, onClose, onGo, onPractice }: {
  child: Child;
  onClose: () => void;
  onGo: (p: 'carnet' | 'iles' | 'refuge') => void;
  onPractice: () => void;
}) {
  const { dispatch } = useStore();
  const emit = useCompanionEmit();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(child.companionName);
  useEffect(() => { emit({ type: 'intro' }); }, [emit]);

  const finish = (then?: () => void) => {
    dispatch({ type: 'child/update', id: child.id, draft: { introSeen: true } });
    onClose();
    then?.();
  };
  const saveName = () => {
    const n = name.trim().slice(0, 20) || 'Pépin';
    if (n !== child.companionName) dispatch({ type: 'child/update', id: child.id, draft: { companionName: n } });
    setStep(2);
  };
  const steps = 4;

  return (
    <Modal title={step === 0 ? 'Bienvenue sur les Îles du Savoir' : step === 1 ? 'Choisis mon prénom' : step === 2 ? 'Petite visite' : 'Une mission d’essai ?'} onClose={() => finish()}>
      <div className="intro">
        <div className="intro__pepin"><PepinLive variant="hero" size={130} bubble={false} /></div>
        <p className="small muted intro__progress">Étape {step + 1} sur {steps}</p>

        {step === 0 && (
          <div className="stack">
            <p className="intro__speech">Salut {child.displayName} ! Je suis ton compagnon d’exploration.</p>
            <p>Je t’aide à t’organiser, à comprendre les consignes et à trouver des pistes. Je ne donne pas les réponses. À toi de mener l’aventure !</p>
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <p className="intro__speech">Comment veux-tu m’appeler ?</p>
            <div className="field">
              <label htmlFor="intro-name">Prénom du compagnon</label>
              <input id="intro-name" className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex" role="group" aria-label="Idées de prénoms">
              {NAME_IDEAS.map((n) => (
                <button key={n} type="button" className="radio-card" aria-pressed={name === n} onClick={() => setName(n)}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="intro-tour">
            <button type="button" className="intro-tour__card" onClick={() => finish(() => onGo('carnet'))}>
              <Icon name="list" size={28} />
              <b>Le carnet de bord</b>
              <span>Tes vrais devoirs de l’école, jour par jour. Tu peux aussi y ajouter ceux de ton agenda.</span>
            </button>
            <button type="button" className="intro-tour__card" onClick={() => finish(() => onGo('iles'))}>
              <Icon name="map" size={28} />
              <b>Les îles</b>
              <span>Une île par matière. Les notions apparaissent quand tu les travailles.</span>
            </button>
            <button type="button" className="intro-tour__card" onClick={() => finish(() => onGo('refuge'))}>
              <Icon name="home" size={28} />
              <b>Le refuge</b>
              <span>Ma maison. Tes efforts allument des lucioles qui débloquent des objets.</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            <p className="intro__speech">Tu veux voir comment je t’aide, avec une petite mission ?</p>
            <p className="notice notice--info"><Icon name="shield" /> <span>C’est une mission d’essai : ce n’est pas un devoir de l’école. Rien n’est ajouté à ton carnet.</span></p>
          </div>
        )}

        <div className="modal__actions intro__actions">
          <Button variant="ghost" onClick={() => finish()}>{step === steps - 1 ? 'Plus tard' : 'Passer'}</Button>
          {step === 0 && <Button iconRight="arrow-right" onClick={() => setStep(1)}>Suivant</Button>}
          {step === 1 && <Button icon="check" onClick={saveName}>C’est mon prénom</Button>}
          {step === 2 && <Button iconRight="arrow-right" onClick={() => setStep(3)}>Suivant</Button>}
          {step === 3 && <Button variant="sun" icon="play" onClick={() => finish(onPractice)}>Essayer la mission</Button>}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------- Mission d'essai ------------------------- */

export function PracticeMission({ child, onDone }: { child: Child; onDone: () => void }) {
  const handle = useRef<MissionHandle | null>(null);
  const [finished, setFinished] = useState(false);
  // Devoir fictif en mémoire uniquement : jamais enregistré, jamais affiché au planning.
  const [fake] = useState<Homework>(() => ({
    id: 'mission-essai', childId: child.id, subject: 'maths', topic: 'Mission d’essai', title: PRACTICE_MISSION.title, instructions: PRACTICE_MISSION.intro,
    dueDate: '', adultActivity: 'aucune', missionId: PRACTICE_MISSION.id, progress: 'en_cours', verification: 'non_verifie', comprehension: 'non_evaluee', help: 'aucun',
    stats: { hintsUsed: 0, wrongAttempts: 0, correctedErrors: 0, secondsSpent: 0 }, createdAt: '', updatedAt: '',
  }));

  return (
    <div className="practice">
      <div className="work-card">
        <div className="flex between">
          <SubjectTag subject="maths" topic="Mission d’essai" />
          <span className="practice-badge"><Icon name="sparkle" size={16} /> Pas un devoir de l’école</span>
        </div>
        <h1 style={{ marginTop: '.75rem' }}>{PRACTICE_MISSION.title}</h1>
        <p className="consigne">{PRACTICE_MISSION.intro}</p>
      </div>
      {finished ? (
        <div className="work-card center pop-in">
          <Panda mood="celebration" size={120} animated={child.preferences.animations} />
          <h2>Mission d’essai terminée !</h2>
          <p>Tu sais maintenant comment je t’aide. Rien n’a été ajouté à ton carnet.</p>
          <Button variant="sun" icon="home" onClick={onDone}>Retour à l’accueil</Button>
        </div>
      ) : (
        <>
          <MissionPlayer mission={PRACTICE_MISSION} hw={fake} child={child} handleRef={handle} onFinished={() => setFinished(true)} practice />
          <nav className="help-bar help-bar--two" aria-label="Demander de l’aide">
            <button className="help-btn help-btn--hint" onClick={() => handle.current?.nextHelp()}><Icon name="bulb" size={26} />J’ai besoin d’un indice</button>
            <button className="help-btn help-btn--stuck" onClick={() => handle.current?.openDecomposition()}><Icon name="alert" size={26} />Je suis bloqué·e</button>
          </nav>
          <p className="small muted mt-1">Pendant tes vrais devoirs, il y a aussi le bouton « J’ai besoin d’un adulte ».</p>
          <PepinLive variant="dock" size={60} />
          <Button variant="ghost" icon="arrow-left" onClick={onDone}>Arrêter la mission d’essai</Button>
        </>
      )}
    </div>
  );
}

/* ------------------------- Réglages enfant ------------------------- */

export function ChildSettings({ child, onClose, onIntro, onPractice }: { child: Child; onClose: () => void; onIntro: () => void; onPractice: () => void }) {
  const { dispatch } = useStore();
  const { available, speaking, speak, stop } = useSpeech();
  const setPref = (p: Partial<Child['preferences']>) => dispatch({ type: 'child/update', id: child.id, draft: { preferences: { ...child.preferences, ...p } } });

  return (
    <Modal title="Mes réglages" onClose={() => { stop(); onClose(); }}>
      <div className="stack">
        <label className="checkbox">
          <input type="checkbox" checked={child.preferences.voice === true} onChange={(e) => setPref({ voice: e.target.checked })} />
          Voix du compagnon
        </label>
        <p className="small muted" style={{ marginTop: 0 }}>
          {available
            ? `Un bouton « Écouter » apparaît dans les bulles de ${child.companionName}. Rien ne se lit tout seul. Le texte reste toujours affiché.`
            : 'Aucune voix française n’est disponible sur cet appareil. Le texte reste affiché, tout fonctionne sans le son.'}
        </p>
        {available && child.preferences.voice && (
          <div>
            {speaking
              ? <Button variant="secondary" icon="pause" onClick={stop}>Arrêter</Button>
              : <Button variant="secondary" icon="play" onClick={() => speak(`Bonjour ${child.displayName}, je suis ${child.companionName}.`)}>Écouter un exemple</Button>}
          </div>
        )}
        <label className="checkbox">
          <input type="checkbox" checked={!child.preferences.animations} onChange={(e) => setPref({ animations: !e.target.checked })} />
          Réduire les animations
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={child.preferences.textSize === 'grand'} onChange={(e) => setPref({ textSize: e.target.checked ? 'grand' : 'normal' })} />
          Texte plus grand
        </label>
        <hr style={{ border: 0, borderTop: '1px solid var(--line)' }} />
        <div className="flex">
          <Button variant="secondary" icon="sparkle" onClick={() => { onClose(); onIntro(); }}>Revoir la présentation</Button>
          <Button variant="secondary" icon="play" onClick={() => { onClose(); onPractice(); }}>Mission d’essai</Button>
        </div>
      </div>
    </Modal>
  );
}
