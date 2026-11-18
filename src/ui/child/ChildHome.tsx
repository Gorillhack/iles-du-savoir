import { useEffect, useState } from 'react';
import { ADULT_ACTIVITY_LABEL } from '../../domain/catalog';
import { activeSession, nextRefugeItem, todaysWork } from '../../domain/logic';
import type { Child } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import heroIslands from '../../assets/iles.webp';
import { PepinLive } from '../../companion/Pepin';
import { Button, Empty, SubjectTag } from '../components/ui';
import { DuePill, greeting, KidStatus } from './kidParts';

export function ChildHome({ child, onStart, onNavigate, onAdd, onIntro, onPractice }: { child: Child; onStart: () => void; onNavigate: (p: 'carnet' | 'refuge' | 'iles') => void; onAdd: () => void; onIntro: () => void; onPractice: () => void }) {
  const { data, dispatch } = useStore();
  const tasks = todaysWork(data, child.id);
  const running = activeSession(data, child.id);
  const [order, setOrder] = useState<string[]>(() => tasks.map((t) => t.id));

  // Garde l'ordre choisi, en intégrant les devoirs ajoutés entre-temps par le parent.
  const ids = tasks.map((t) => t.id).join('|');
  useEffect(() => {
    setOrder((prev) => {
      const current = tasks.map((t) => t.id);
      return [...prev.filter((id) => current.includes(id)), ...current.filter((id) => !prev.includes(id))];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const ordered = order.map((id) => tasks.find((t) => t.id === id)!).filter(Boolean);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  const g = greeting(child.displayName, child.companionName);
  const next = nextRefugeItem(child);
  const minutes = ordered.reduce((m, t) => m + (t.estimatedMinutes ?? 0), 0);

  const start = () => {
    dispatch({ type: 'session/start', childId: child.id, order });
    onStart();
  };

  return (
    <>
      <section className="kid-hero" aria-labelledby="kid-hello" style={{ ['--hero-img' as string]: `url(${heroIslands})` }}>
        <div role="img" aria-label={`${child.companionName}, ton compagnon panda roux`}>
          <PepinLive variant="hero" size={180} bubble={false} />
        </div>
        <div className="kid-hero__bubble">
          <h1 id="kid-hello">{g.title}</h1>
          <p className="mb-0">
            {tasks.length === 0
              ? `Rien n’est prévu pour aujourd’hui dans ton carnet. Tu peux explorer tes îles ou passer au refuge.`
              : running
              ? `Ta séance est restée ouverte. On reprend là où tu t’étais arrêté·e ?`
              : g.line}
          </p>
        </div>
      </section>

      <section className="kid-card" aria-labelledby="today-title">
        <div className="card__head">
          <h2 id="today-title" className="mb-0"><Icon name="book" /> Mes devoirs du jour</h2>
          <Button variant="secondary" icon="plus" onClick={onAdd}>Ajouter un devoir</Button>
        </div>
        {tasks.length === 0 ? (
          <Empty icon="check-circle">Rien pour aujourd’hui ou demain dans ton carnet. Un devoir dans ton agenda ? Ajoute-le avec le bouton « Ajouter un devoir ».</Empty>
        ) : (
          <>
            <p className="small muted">
              {tasks.length} tâche{tasks.length > 1 ? 's' : ''}{minutes ? `, environ ${minutes} minutes` : ''}. Tu peux choisir l’ordre avec les flèches.
            </p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {ordered.map((t, i) => (
                <li key={t.id} className="task-tile">
                  <span className="task-tile__num" aria-hidden>{i + 1}</span>
                  <div>
                    <SubjectTag subject={t.subject} topic={t.topic} compact />
                    <div className="task-tile__title">{t.title}</div>
                    <div className="task-tile__meta">
                      <DuePill date={t.dueDate} />
                      {t.estimatedMinutes && <span><Icon name="clock" size={15} /> {t.estimatedMinutes} min</span>}
                      {t.adultActivity !== 'aucune' && <span><Icon name="users" size={15} /> Avec un adulte : {ADULT_ACTIVITY_LABEL[t.adultActivity].toLowerCase()}</span>}
                      {t.missionId && <span><Icon name="sparkle" size={15} /> Mission guidée</span>}
                    </div>
                    {t.progress !== 'a_faire' || t.help !== 'aucun' || t.needsParentReview ? <div style={{ marginTop: '.35rem' }}><KidStatus hw={t} /></div> : null}
                  </div>
                  {!running && ordered.length > 1 && (
                    <div className="task-tile__order">
                      <button className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Monter « ${t.title} »`}><Icon name="arrow-up" /></button>
                      <button className="icon-btn" disabled={i === ordered.length - 1} onClick={() => move(i, 1)} aria-label={`Descendre « ${t.title} »`}><Icon name="arrow-down" /></button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="start-zone">
              {running ? (
                <Button variant="sun" size="xl" icon="play" onClick={onStart}>Reprendre mes devoirs</Button>
              ) : (
                <Button variant="sun" size="xl" icon="play" onClick={start}>Commencer mes devoirs</Button>
              )}
              <span className="small muted">Une tâche à la fois. Tu peux faire une pause quand tu veux.</span>
            </div>
          </>
        )}
      </section>

      <div className="kid-card flex between">
        <div className="flex">
          <Icon name="firefly" size={28} />
          <div>
            <b>{child.fireflies} lucioles</b> allumées par tes efforts.
            {next && <div className="small muted">Encore {next.threshold - child.fireflies} pour débloquer : {next.label.toLowerCase()}.</div>}
          </div>
        </div>
        <div className="flex">
          <Button variant="secondary" icon="list" onClick={() => onNavigate('carnet')}>Carnet de bord</Button>
          <Button variant="secondary" icon="home" onClick={() => onNavigate('refuge')}>Refuge</Button>
        </div>
      </div>
      <p className="center small" style={{ marginTop: '1rem' }}>
        <button className="link-btn" onClick={onIntro}>Revoir la présentation de {child.companionName}</button>
        {' · '}
        <button className="link-btn" onClick={onPractice}>Mission d’essai</button>
      </p>
    </>
  );
}
