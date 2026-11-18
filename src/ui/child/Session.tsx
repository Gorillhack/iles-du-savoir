import { useEffect, useRef, useState } from 'react';
import { getMission } from '../../data/missions';
import { ADULT_ACTIVITY_LABEL } from '../../domain/catalog';
import { formatDuration } from '../../domain/dates';
import { activeSession } from '../../domain/logic';
import type { Child, Homework, WorkSession } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { useCompanionEmit } from '../../companion/CompanionProvider';
import { PepinLive } from '../../companion/Pepin';
import { Panda, type PandaMood } from '../components/Panda';
import { Button, SubjectTag } from '../components/ui';
import { MissionPlayer, type MissionHandle } from './MissionPlayer';
import { DuePill, KidStatus } from './kidParts';

/** Conseils de méthode pour les devoirs sans mission : on aide à s'organiser, sans prétendre corriger. */
function genericHints(hw: Homework): string[] {
  const base = [
    'Relis la consigne et dis-la avec tes mots, à voix basse : qu’est-ce qu’on te demande de faire exactement ?',
    'Repère les mots importants de la consigne : le verbe (lire, apprendre, répondre, recopier…) et ce que tu dois produire.',
    'Découpe le travail : commence par la première question, ou par la partie qui te semble la plus facile.',
    'Ouvre ta leçon ou ton cahier : un exercice fait en classe ressemble souvent à celui-ci.',
  ];
  if (hw.adultActivity === 'recitation')
    return ['Lis le texte en entier une fois, tranquillement.', 'Apprends ligne par ligne : lis, cache, redis. Puis ajoute la ligne suivante.', 'Récite à voix haute en marchant ou en faisant un geste par vers : ça aide la mémoire.', 'Quand tu te sens prêt·e, appuie sur « Je suis prêt·e » : un adulte t’écoutera.'];
  if (hw.adultActivity === 'lecture_voix_haute')
    return ['Lis d’abord le passage dans ta tête pour repérer les mots difficiles.', 'Un mot inconnu ? Regarde la phrase autour, ou note-le pour le demander à un adulte.', 'Lis une phrase, lève la tête, et redis ce qu’elle raconte.', 'Respire aux points et aux virgules : ça rend la lecture plus claire.'];
  if (hw.subject === 'anglais' || /vocabulaire|mots|dictée|liste/i.test(hw.title + (hw.topic ?? '')))
    return ['Lis chaque mot à voix haute.', 'Cache le mot, écris-le, puis compare.', 'Recommence seulement avec ceux qui t’ont posé problème.', base[3]];
  return base;
}

function FreeTask({ hw, child, hintLevel, onDone }: { hw: Homework; child: Child; hintLevel: number; onDone: (note: string) => void }) {
  const hints = genericHints(hw);
  const [note, setNote] = useState('');
  const adult = hw.adultActivity !== 'aucune';
  return (
    <div className="work-card">
      {adult && (
        <div className="notice notice--info" style={{ marginBottom: '1rem' }}>
          <Icon name="users" /> <span>Ce devoir se termine avec un adulte : <b>{ADULT_ACTIVITY_LABEL[hw.adultActivity].toLowerCase()}</b>.</span>
        </div>
      )}
      <p className="small muted">{child.companionName} ne peut pas corriger ce devoir-là, mais peut t’aider à t’organiser. Fais-le dans ton cahier, puis reviens ici.</p>
      {hw.attachment && <img src={hw.attachment.dataUrl} alt={`Document joint par ton parent : ${hw.attachment.name}`} style={{ maxHeight: 260, borderRadius: 12, display: 'block', marginBottom: '1rem' }} />}
      {hintLevel > 0 && (
        <div className="companion-panel pop-in" role="status" aria-live="polite">
          <Panda mood={hintLevel > 2 ? 'explication' : 'reflexion'} size={76} animated={child.preferences.animations} />
          <div>
            <div className="companion-panel__name">{child.companionName}</div>
            <ol className="companion-panel__text" style={{ paddingLeft: '1.2rem', margin: 0 }}>
              {hints.slice(0, hintLevel).map((h, i) => <li key={i} style={{ marginBottom: '.35rem' }}>{h}</li>)}
            </ol>
          </div>
        </div>
      )}
      <div className="field mt-1">
        <label htmlFor="child-note">Un mot pour ton adulte <span className="muted small">(facultatif)</span></label>
        <input id="child-note" className="input" value={note} maxLength={140} onChange={(e) => setNote(e.target.value)} placeholder="Ex. J’ai hésité sur la question 3" />
      </div>
      <Button variant="turq" size="lg" icon="check" onClick={() => onDone(note)}>
        {adult ? 'Je suis prêt·e, c’est au tour de l’adulte' : 'J’ai terminé ce devoir'}
      </Button>
      <p className="small muted" style={{ marginTop: '.5rem' }}>Ton parent pourra le vérifier avec toi.</p>
    </div>
  );
}

function SessionEnd({ session, child, onHome }: { session: WorkSession; child: Child; onHome: () => void }) {
  const { data } = useStore();
  const items = session.order.map((id) => data.homeworks.find((h) => h.id === id)).filter(Boolean) as Homework[];
  const done = items.filter((h) => h.progress === 'termine').length;
  const corrected = items.reduce((n, h) => n + h.stats.correctedErrors, 0);
  const askedAdult = items.filter((h) => h.help === 'adulte_demande').length;
  const blocked = items.filter((h) => h.help === 'bloque').length;
  const lines: string[] = [];
  if (done) lines.push(`Tu as terminé ${done} tâche${done > 1 ? 's' : ''}.`);
  if (corrected) lines.push(`Tu as corrigé ${corrected} erreur${corrected > 1 ? 's' : ''} toi-même : c’est comme ça qu’on apprend.`);
  if (session.hintsUsed) lines.push(`Tu as utilisé ${session.hintsUsed} aide${session.hintsUsed > 1 ? 's' : ''} au bon moment.`);
  if (blocked || askedAdult) lines.push('Tu as dit quand c’était difficile. C’est une vraie qualité d’explorateur·rice.');
  if (!lines.length) lines.push('Tu as ouvert ton carnet et regardé ton programme : c’est un bon début.');

  return (
    <div className="session-body center">
      <Panda mood="celebration" size={170} label={`${child.companionName} fête la fin de ta séance`} animated={child.preferences.animations} />
      <h1>Séance terminée !</h1>
      <div className="work-card" style={{ textAlign: 'left' }}>
        <ul className="summary-list">
          {lines.map((l, i) => <li key={i}><Icon name="star" /> <span>{l}</span></li>)}
          <li><Icon name="firefly" /> <span><b>+{session.firefliesEarned} lucioles</b> pour tes efforts. Elles éclairent ton refuge.</span></li>
          <li><Icon name="clock" /> <span>{formatDuration(session.secondsWorked)} de travail.</span></li>
        </ul>
      </div>
      <div className="work-card" style={{ textAlign: 'left' }}>
        <h2>Ce qui a été fait</h2>
        {items.map((h) => (
          <div key={h.id} style={{ padding: '.5rem 0', borderBottom: '1px dashed var(--line)' }}>
            <SubjectTag subject={h.subject} topic={h.topic} compact />
            <div style={{ fontWeight: 800 }}>{h.title}</div>
            <KidStatus hw={h} />
          </div>
        ))}
        {(askedAdult > 0 || items.some((h) => h.adultActivity !== 'aucune' && h.progress === 'termine' && h.verification !== 'verifie_adulte')) && (
          <p className="notice notice--info mt-1"><Icon name="users" /> <span>Un adulte va regarder avec toi ce qui le demande.</span></p>
        )}
      </div>
      <Button variant="sun" size="xl" icon="home" onClick={onHome}>Retour au carnet</Button>
    </div>
  );
}

/** Séances déjà annoncées par Pépin (pas de répétition en revenant du carnet). */
const announcedSessions = new Set<string>();

export function Session({ child, onExit }: { child: Child; onExit: () => void }) {
  const { data, dispatch } = useStore();
  const session = activeSession(data, child.id);
  const [endedId, setEndedId] = useState<string | null>(null);
  const ended = endedId ? data.sessions.find((x) => x.id === endedId) : undefined;
  const [paused, setPaused] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [signal, setSignal] = useState<null | 'bloque' | 'adulte' | 'adulte-form'>(null);
  const [adultMsg, setAdultMsg] = useState('');
  const [breakOffered, setBreakOffered] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const missionRef = useRef<MissionHandle | null>(null);
  const emit = useCompanionEmit();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const hwId = session?.order[session.currentIndex];
  const hw = data.homeworks.find((h) => h.id === hwId);
  const mission = getMission(hw?.missionId);

  // Encouragement de début de séance : une seule fois par séance.
  useEffect(() => {
    if (!session || announcedSessions.has(session.id)) return;
    announcedSessions.add(session.id);
    emit({ type: 'session_start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // Démarre le devoir courant et remet l'aide à zéro à chaque changement de tâche.
  useEffect(() => {
    if (hw && hw.progress === 'a_faire') dispatch({ type: 'hw/start', id: hw.id });
    setHintLevel(0); setSignal(null); setJustFinished(false);
    headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hwId]);

  // Chronomètre : enregistre le temps de travail par paquets de 15 s, hors pause et onglet caché.
  useEffect(() => {
    if (!session || !hw || paused) return;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') dispatch({ type: 'work/tick', sessionId: session.id, homeworkId: hw.id, seconds: 15 });
    }, 15_000);
    return () => clearInterval(t);
  }, [session?.id, hw?.id, paused, dispatch]);

  // Pause proposée (jamais imposée) quand la durée souhaitée est atteinte.
  useEffect(() => {
    if (session && !breakOffered && session.secondsWorked >= child.preferences.sessionMinutes * 60) setBreakOffered(true);
  }, [session?.secondsWorked, breakOffered, child.preferences.sessionMinutes, session]);

  if (ended) return <div className={`session ${child.preferences.animations ? '' : 'no-anim'}`}><SessionEnd session={ended} child={child} onHome={onExit} /></div>;

  if (!session) {
    return (
      <div className="session"><div className="session-body center">
        <p>Aucune séance en cours.</p>
        <Button onClick={onExit} icon="home">Retour</Button>
      </div></div>
    );
  }

  const total = session.order.length;
  const idx = session.currentIndex;
  const isLast = idx >= total - 1;

  const endSession = () => {
    dispatch({ type: 'session/end', sessionId: session.id });
    setEndedId(session.id);
  };
  const goNext = () => (isLast ? endSession() : dispatch({ type: 'session/goto', sessionId: session.id, index: idx + 1 }));
  const goPrev = () => idx > 0 && dispatch({ type: 'session/goto', sessionId: session.id, index: idx - 1 });

  const askHint = () => {
    if (!hw) return;
    if (mission && hw.progress !== 'termine') { missionRef.current?.nextHelp(); return; }
    if (hintLevel < genericHints(hw).length) {
      emit({ type: 'hint' });
      setHintLevel(hintLevel + 1);
      dispatch({ type: 'hw/help', id: hw.id, kind: hintLevel === 0 ? 'reformulation' : 'indice' });
    }
  };
  const stuck = () => {
    if (!hw) return;
    dispatch({ type: 'hw/help', id: hw.id, kind: 'bloque' });
    setSignal('bloque');
    if (mission && hw.progress !== 'termine') missionRef.current?.openDecomposition();
    else setHintLevel(Math.max(hintLevel, 3));
    emit({ type: 'stuck' });
  };
  const sendAdult = () => {
    if (!hw) return;
    dispatch({ type: 'hw/help', id: hw.id, kind: 'adulte', detail: adultMsg.trim() || undefined });
    setSignal('adulte'); setAdultMsg('');
    emit({ type: 'adult_requested' });
  };

  const signalMood: PandaMood = signal === 'adulte' ? 'encouragement' : 'reflexion';

  return (
    <div className={`session ${child.preferences.animations ? '' : 'no-anim'} ${child.preferences.textSize === 'grand' ? 'kid--large' : ''}`}>
      <header className="session-top">
        <Button variant="ghost" icon="arrow-left" onClick={onExit}>Carnet</Button>
        <div className="session-steps" aria-label={`Tâche ${idx + 1} sur ${total}`}>
          <span className="hide-sm">Tâche</span> {idx + 1}/{total}
          <span aria-hidden style={{ display: 'inline-flex', gap: 4, marginLeft: 6 }}>
            {session.order.map((id, i) => {
              const h = data.homeworks.find((x) => x.id === id);
              return <span key={id} className={`dot ${h?.progress === 'termine' ? 'dot--done' : i === idx ? 'dot--current' : ''}`} />;
            })}
          </span>
        </div>
        <span className="session-time"><Icon name="clock" size={18} /> {formatDuration(session.secondsWorked)}</span>
        <Button variant="secondary" icon="pause" onClick={() => { setPaused(true); dispatch({ type: 'session/pause', sessionId: session.id }); emit({ type: 'pause' }); }}>Pause</Button>
      </header>

      <main className="session-body" id="contenu">
        {breakOffered && (
          <div className="notice notice--info" style={{ marginBottom: '1rem' }}>
            <Icon name="clock" />
            <span>Tu travailles depuis {child.preferences.sessionMinutes} minutes. Une petite pause te ferait peut-être du bien. C’est toi qui choisis.</span>
            <Button variant="ghost" onClick={() => setBreakOffered(false)} aria-label="Fermer la proposition de pause"><Icon name="x" /></Button>
          </div>
        )}

        {!hw ? (
          <div className="work-card center">
            <p>Ce devoir n’existe plus (il a peut-être été retiré par ton parent).</p>
            <Button onClick={goNext} iconRight="arrow-right">{isLast ? 'Terminer la séance' : 'Tâche suivante'}</Button>
          </div>
        ) : (
          <>
            <div className="work-card">
              <div className="flex between">
                <SubjectTag subject={hw.subject} topic={hw.topic} />
                <DuePill date={hw.dueDate} />
              </div>
              <h1 ref={headingRef} tabIndex={-1} style={{ marginTop: '.75rem', outline: 'none' }}>{hw.title}</h1>
              {hw.instructions && <p className="consigne">{hw.instructions}</p>}
              {hw.estimatedMinutes && <p className="small muted mb-0"><Icon name="clock" size={15} /> Environ {hw.estimatedMinutes} minutes</p>}
            </div>

            {mission && hw.progress !== 'termine' ? (
              <MissionPlayer key={hw.id} mission={mission} hw={hw} child={child} handleRef={missionRef} onFinished={() => setJustFinished(true)} />
            ) : hw.progress === 'termine' ? (
              <div className="work-card center pop-in">
                <Panda mood={justFinished ? 'celebration' : 'encouragement'} size={110} animated={child.preferences.animations} />
                <h2>{justFinished ? 'Mission accomplie !' : 'Ce devoir est terminé.'}</h2>
                <KidStatus hw={hw} />
                {hw.verificationNote && hw.verification === 'verifie_exercice' && (
                  <p className="small muted mt-1">
                    {hw.comprehension === 'reussie_activite' ? 'Tu as réussi cette mission. ' : 'Cette notion mérite encore un peu d’entraînement, et c’est normal. '}
                    Ton parent pourra en parler avec toi.
                  </p>
                )}
              </div>
            ) : (
              <FreeTask
                key={hw.id}
                hw={hw}
                child={child}
                hintLevel={hintLevel}
                onDone={(note) => { dispatch({ type: 'hw/childDone', id: hw.id, note: note.trim() || undefined }); setJustFinished(true); emit({ type: 'task_done' }); }}
              />
            )}

            {hw.progress !== 'termine' && (
              <nav className="help-bar" aria-label="Demander de l’aide">
                <button className="help-btn help-btn--hint" onClick={askHint}><Icon name="bulb" size={26} />J’ai besoin d’un indice</button>
                <button className="help-btn help-btn--stuck" onClick={stuck} aria-pressed={hw.help === 'bloque'}><Icon name="alert" size={26} />Je suis bloqué·e</button>
                <button className="help-btn help-btn--adult" onClick={() => setSignal('adulte-form')} aria-pressed={hw.help === 'adulte_demande'}><Icon name="hand" size={26} />J’ai besoin d’un adulte</button>
              </nav>
            )}

            {signal === 'adulte-form' && (
              <div className="companion-panel pop-in">
                <Panda mood="encouragement" size={76} animated={child.preferences.animations} />
                <div>
                  <div className="companion-panel__name">{child.companionName}</div>
                  <label htmlFor="adult-msg" className="companion-panel__text" style={{ display: 'block', marginBottom: '.4rem' }}>Bonne idée de demander. Tu veux dire en quelques mots ce qui coince ? (facultatif)</label>
                  <input id="adult-msg" className="input" maxLength={140} value={adultMsg} onChange={(e) => setAdultMsg(e.target.value)} placeholder="Ex. Je ne comprends pas la question 2" />
                  <div className="flex mt-1">
                    <Button variant="turq" icon="hand" onClick={sendAdult}>Prévenir un adulte</Button>
                    <Button variant="ghost" onClick={() => setSignal(null)}>Annuler</Button>
                  </div>
                </div>
              </div>
            )}
            {(signal === 'bloque' || signal === 'adulte') && (
              <div className="companion-panel pop-in" role="status" aria-live="polite">
                <Panda mood={signalMood} size={76} animated={child.preferences.animations} />
                <div>
                  <div className="companion-panel__name">{child.companionName}</div>
                  <p className="companion-panel__text mb-0">
                    {signal === 'bloque'
                      ? `Être bloqué·e, ça arrive à tous les explorateurs. C’est noté pour ton adulte. ${mission ? 'Je t’ai ouvert le découpage pas à pas, juste au-dessus.' : 'Regarde les conseils au-dessus.'} Tu peux aussi passer à la suite et revenir plus tard.`
                      : 'C’est noté : ton adulte verra ta demande dans son espace. En attendant, tu peux continuer une autre tâche ou faire une pause.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex between" style={{ marginTop: '1.25rem' }}>
              <Button variant="ghost" icon="arrow-left" onClick={goPrev} disabled={idx === 0}>Précédente</Button>
              {hw.progress === 'termine' ? (
                <Button variant="sun" size="lg" iconRight={isLast ? 'flag' : 'arrow-right'} onClick={goNext}>{isLast ? 'Voir mon bilan' : 'Tâche suivante'}</Button>
              ) : (
                <Button variant="secondary" iconRight={isLast ? 'flag' : 'arrow-right'} onClick={goNext}>{isLast ? 'Terminer la séance' : 'Je la ferai plus tard'}</Button>
              )}
            </div>
          </>
        )}
      </main>

      {/* Pépin discret pendant le travail : petit, dans un coin, ne bloque aucun bouton. */}
      {!paused && <PepinLive variant="dock" size={60} />}

      {paused && (
        <div className="pause-screen" role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div>
            <PepinLive variant="hero" size={160} />
            <h2 id="pause-title">Pause</h2>
            <p>Bois un verre d’eau, étire-toi. Ton travail est enregistré.</p>
            <Button variant="sun" size="xl" icon="play" onClick={() => { setPaused(false); emit({ type: 'resume' }); }} autoFocus>Reprendre</Button>
          </div>
        </div>
      )}
    </div>
  );
}
