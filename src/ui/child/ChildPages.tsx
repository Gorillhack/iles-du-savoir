import { REFUGE_ITEMS, SUBJECTS, subjectInfo } from '../../domain/catalog';
import { addDays, dueLabel, today } from '../../domain/dates';
import { childHomeworks } from '../../domain/logic';
import type { Child } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { FloatingIsland, RefugeItemPreview, RefugeScene } from '../components/Illustrations';
import { Panda } from '../components/Panda';
import { Button, Empty, SubjectTag } from '../components/ui';
import { KidStatus } from './kidParts';

/** Carnet de bord : les vrais devoirs, jour par jour. */
export function Logbook({ child, onAdd }: { child: Child; onAdd: () => void }) {
  const { data, dispatch } = useStore();
  const from = addDays(today(), -7);
  const list = childHomeworks(data, child.id)
    .filter((h) => h.dueDate >= from || h.progress !== 'termine')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const days = [...new Set(list.map((h) => h.dueDate))];
  return (
    <section className="kid-card" aria-labelledby="logbook-title">
      <h1 id="logbook-title" className="flex"><Icon name="list" size={28} /> Mon carnet de bord</h1>
      <div className="flex between">
        <p className="muted mb-0">Tous tes devoirs, classés par jour où ils sont à rendre.</p>
        <Button variant="secondary" icon="plus" onClick={onAdd}>Ajouter un devoir</Button>
      </div>
      {days.length === 0 && <Empty>Ton carnet est vide pour l’instant.</Empty>}
      {days.map((d) => (
        <div key={d} className="logbook-day">
          <h3>{dueLabel(d)}{d < today() ? ' (passé)' : ''}</h3>
          {list.filter((h) => h.dueDate === d).map((h) => (
            <div key={h.id} className="logbook-entry" style={{ ['--subject' as string]: subjectInfo(h.subject).color }}>
              <span className="logbook-entry__bar" aria-hidden />
              <div>
                <SubjectTag subject={h.subject} topic={h.topic} compact />
                <div style={{ fontWeight: 800, margin: '.15rem 0 .3rem' }}>{h.title}</div>
                <KidStatus hw={h} />
                {h.needsParentReview && h.progress === 'a_faire' && (
                  <button className="btn btn--ghost small" style={{ minHeight: 40, padding: '.2rem .6rem', marginTop: '.3rem' }} onClick={() => dispatch({ type: 'hw/delete', id: h.id })}>
                    <Icon name="trash" size={16} /> Je me suis trompé·e, retirer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

/** Les îles : une par matière, avec les notions explorées (jamais « maîtrisées »). */
export function Islands({ child }: { child: Child }) {
  const { data } = useStore();
  const hws = childHomeworks(data, child.id);
  const details = ['tree', 'flag', 'hut', 'rocks', 'tree', 'flag'] as const;
  return (
    <section className="kid-card" aria-labelledby="islands-title">
      <h1 id="islands-title" className="flex"><Icon name="map" size={28} /> Mes îles</h1>
      <p className="muted">Chaque île est une matière. Les notions apparaissent quand tu les as travaillées.</p>
      <div className="islands-map">
        {SUBJECTS.map((s, i) => {
          const mine = hws.filter((h) => h.subject === s.id && h.progress !== 'a_faire');
          const topics = [...new Set(mine.map((h) => h.topic ?? h.title))];
          const done = mine.filter((h) => h.progress === 'termine').length;
          return (
            <div key={s.id} className={`island-card ${mine.length ? '' : 'island-card--empty'}`}>
              <div className={child.preferences.animations ? 'island-float' : ''}>
                <FloatingIsland color={s.color} size={130} detail={details[i]} />
              </div>
              <div className="island-card__name">{s.island}</div>
              <div className="island-card__subject">{s.label}</div>
              {topics.length ? (
                <>
                  <ul className="island-card__notions">
                    {topics.slice(0, 4).map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  <div className="small">{done} devoir{done > 1 ? 's' : ''} terminé{done > 1 ? 's' : ''}</div>
                </>
              ) : (
                <div className="small muted">Pas encore explorée</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Le refuge : accessoires débloqués par l'effort, jamais achetés. */
export function Refuge({ child }: { child: Child }) {
  const { dispatch } = useStore();
  return (
    <section className="kid-card" aria-labelledby="refuge-title">
      <h1 id="refuge-title" className="flex"><Icon name="home" size={28} /> Le refuge de {child.companionName}</h1>
      <p className="muted">
        Les lucioles s’allument quand tu fais des efforts : terminer une tâche, corriger une erreur, demander de l’aide, finir une séance.
        Tu en as <b>{child.fireflies}</b>.
      </p>
      <RefugeScene shown={child.refugeShown}>
        <Panda mood="accueil" size={120} animated={child.preferences.animations} />
      </RefugeScene>
      <h2 className="mt-1">Accessoires</h2>
      <div className="refuge-items">
        {REFUGE_ITEMS.map((it) => {
          const unlocked = child.fireflies >= it.threshold;
          const shown = child.refugeShown.includes(it.id);
          return (
            <button
              key={it.id}
              className="refuge-item"
              disabled={!unlocked}
              aria-pressed={unlocked ? shown : undefined}
              onClick={() => dispatch({ type: 'refuge/toggle', childId: child.id, itemId: it.id })}
            >
              <RefugeItemPreview id={it.id} />
              {it.label}
              <span className="small">
                {unlocked ? (shown ? 'Dans le refuge — retirer' : 'Disponible — installer') : <><Icon name="lock" size={14} /> {it.threshold} lucioles</>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="small muted mt-1">Ici, rien ne s’achète et rien ne se perd : tes accessoires restent même si tu fais une pause de plusieurs jours.</p>
    </section>
  );
}

export function NoChild() {
  return (
    <div className="kid-main" style={{ paddingTop: '2rem' }}>
      <div className="kid-card center">
        <Panda mood="reflexion" size={140} />
        <p>Aucun profil enfant. Passez dans l’espace parent pour en créer un.</p>
      </div>
    </div>
  );
}
