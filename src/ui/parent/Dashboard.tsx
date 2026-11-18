import { useState } from 'react';
import { ADULT_ACTIVITY_LABEL, subjectLabel } from '../../domain/catalog';
import { dueLabel, formatDuration, longDate, timeOf, today } from '../../domain/dates';
import { attentionItems, childProgress, lastSession, todaysWork, upcomingWork, type AttentionItem } from '../../domain/logic';
import type { AppData, Child, WorkSession } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon, type IconName } from '../components/Icon';
import { Button, Empty, Meter, StatusLine, SubjectTag } from '../components/ui';

const KIND: Record<AttentionItem['kind'], { label: string; icon: IconName }> = {
  adulte: { label: 'Demande un adulte', icon: 'hand' },
  bloque: { label: 'Bloqué', icon: 'alert' },
  a_relire: { label: 'Ajouté par l’enfant, à relire', icon: 'edit' },
  en_retard: { label: 'Échéance dépassée', icon: 'clock' },
  a_verifier: { label: 'Terminé, à vérifier ensemble', icon: 'eye' },
  activite_adulte: { label: 'Activité avec un adulte', icon: 'users' },
};

export function Dashboard({ onOpen, onAdd, onPhoto }: { onOpen: (id: string) => void; onAdd: () => void; onPhoto: () => void }) {
  const { data, dispatch } = useStore();
  const [filter, setFilter] = useState<string>('all');
  const children = data.children.filter((c) => filter === 'all' || c.id === filter);
  const attention = attentionItems(data).filter((a) => filter === 'all' || a.child.id === filter);
  const urgent = attention.filter((a) => a.kind === 'adulte' || a.kind === 'bloque').length;
  const toPrepare = children.reduce((n, c) => n + todaysWork(data, c.id).length, 0);

  if (data.children.length === 0) {
    return (
      <div>
        <h1>Tableau de bord</h1>
        <Empty icon="users">Aucun profil enfant. Créez-en un dans l’onglet « Enfants », ou rechargez les données de démonstration dans « Données ».</Empty>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Tableau de bord</h1>
          <p className="sub">{longDate(today())}</p>
        </div>
        <div className="flex">
          <Button icon="plus" onClick={onAdd}>Ajouter un devoir</Button>
          <Button variant="secondary" icon="camera" onClick={onPhoto}>Depuis l’agenda</Button>
        </div>
      </div>

      {/* Résumé en une phrase : compris en quelques secondes */}
      <p className="card" style={{ fontSize: '1.08rem', marginBottom: '1rem' }} aria-live="polite">
        {urgent > 0 ? (
          <><Icon name="hand" /> <b>{urgent} demande{urgent > 1 ? 's' : ''} d’aide</b> en attente. </>
        ) : (
          <><Icon name="check-circle" /> Aucune demande d’aide en attente. </>
        )}
        <b>{toPrepare} devoir{toPrepare > 1 ? 's' : ''}</b> à préparer aujourd’hui (pour aujourd’hui, demain ou en retard)
        {attention.length - urgent > 0 && <> · <b>{attention.length - urgent}</b> point{attention.length - urgent > 1 ? 's' : ''} à vérifier ou à faire ensemble</>}.
      </p>

      {data.homeworks.length === 0 && (
        <div className="notice notice--info" style={{ marginBottom: '1rem' }}>
          <Icon name="sparkle" />
          <span>Le carnet est vide. Ajoutez les devoirs de l’agenda avec « Ajouter un devoir » ou « Depuis l’agenda » : ils apparaîtront aussitôt dans l’espace de {data.children[0].displayName}.</span>
        </div>
      )}

      {data.children.length > 1 && (
        <div className="tabs" role="group" aria-label="Filtrer par enfant" style={{ marginBottom: '1rem' }}>
          <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Tous</button>
          {data.children.map((c) => (
            <button key={c.id} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>{c.displayName}</button>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <section className="card" aria-labelledby="att-title">
          <div className="card__head">
            <h2 id="att-title"><Icon name="flag" /> À votre attention {attention.length > 0 && <span className="badge-count">{attention.length}</span>}</h2>
          </div>
          {attention.length === 0 ? (
            <Empty icon="check-circle">Rien ne demande votre intervention pour le moment.</Empty>
          ) : (
            attention.map((a) => (
              <article key={`${a.kind}-${a.homework.id}`} className={`attention-item attention-item--${a.kind}`}>
                <span className="attention-item__icon"><Icon name={KIND[a.kind].icon} /></span>
                <div>
                  <div className="attention-item__kind">
                    {KIND[a.kind].label}
                    {a.kind === 'activite_adulte' && ` — ${ADULT_ACTIVITY_LABEL[a.homework.adultActivity]}`}
                    {a.since && ` · ${timeOf(a.since)}`}
                  </div>
                  <div className="attention-item__title">{a.child.displayName} · {a.homework.title}</div>
                  <div className="small muted">{subjectLabel(a.homework.subject, a.homework.topic)} · pour {dueLabel(a.homework.dueDate).toLowerCase()}</div>
                  {a.homework.childNote && (a.kind === 'adulte' || a.kind === 'bloque' || a.kind === 'a_verifier') && (
                    <div className="attention-item__note">« {a.homework.childNote} »</div>
                  )}
                  {a.kind === 'a_relire' && a.homework.instructions && <div className="attention-item__note">{a.homework.instructions}</div>}
                  {a.kind === 'a_verifier' && a.homework.verificationNote && <div className="small">{a.homework.verificationNote}</div>}
                  <div className="attention-item__actions">
                    {(a.kind === 'adulte' || a.kind === 'bloque') && (
                      <Button variant="turq" icon="check" onClick={() => dispatch({ type: 'parent/resolveHelp', id: a.homework.id })}>Aide apportée</Button>
                    )}
                    {a.kind === 'a_relire' && (
                      <Button variant="turq" icon="check" onClick={() => dispatch({ type: 'parent/confirmHw', id: a.homework.id })}>C’est correct</Button>
                    )}
                    {a.kind === 'a_relire' && (
                      <Button variant="secondary" icon="edit" onClick={() => onOpen(a.homework.id)}>Corriger</Button>
                    )}
                    {(a.kind === 'a_verifier' || a.kind === 'activite_adulte') && (
                      <Button icon="user" onClick={() => onOpen(a.homework.id)}>Vérifier</Button>
                    )}
                    {a.kind !== 'a_relire' && <Button variant="secondary" icon="eye" onClick={() => onOpen(a.homework.id)}>Détails</Button>}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="card" aria-labelledby="prog-title">
          <div className="card__head"><h2 id="prog-title"><Icon name="users" /> Progression de la semaine</h2></div>
          {children.map((c) => <ChildProgressBlock key={c.id} data={data} child={c} />)}
          <p className="legal mt-1">« Terminé » est déclaré par l’enfant. « Vérifié » signifie relu par un adulte ou contrôlé par une mission guidée.</p>
        </section>

        <section className="card" aria-labelledby="today-title">
          <div className="card__head"><h2 id="today-title"><Icon name="calendar" /> Aujourd’hui et à venir</h2></div>
          {children.map((c) => {
            const now = todaysWork(data, c.id);
            const next = upcomingWork(data, c.id).slice(0, 4);
            return (
              <div key={c.id} style={{ marginBottom: '1rem' }}>
                <h3 className="flex"><span className="avatar" aria-hidden>{c.displayName[0]}</span>{c.displayName}</h3>
                {now.length === 0 ? <Empty>Rien à préparer aujourd’hui.</Empty> : now.map((h) => (
                  <div key={h.id} className="hw-row hw-row--clickable">
                    <div>
                      <SubjectTag subject={h.subject} topic={h.topic} compact />
                      <div className="hw-row__title"><button className="hw-row__link" onClick={() => onOpen(h.id)}>{h.title}</button></div>
                      <div className="hw-row__meta">
                        <span><Icon name="calendar" size={15} /> Pour {dueLabel(h.dueDate).toLowerCase()}</span>
                        {h.estimatedMinutes && <span><Icon name="clock" size={15} /> ~{h.estimatedMinutes} min</span>}
                        {h.adultActivity !== 'aucune' && <span><Icon name="users" size={15} /> {ADULT_ACTIVITY_LABEL[h.adultActivity]}</span>}
                      </div>
                    </div>
                    <Icon name="arrow-right" />
                    <div className="hw-row__status"><StatusLine hw={h} /></div>
                  </div>
                ))}
                {next.length > 0 && (
                  <p className="small muted" style={{ marginTop: '.5rem' }}>
                    Ensuite : {next.map((h) => `${h.title} (${dueLabel(h.dueDate).toLowerCase()})`).join(' · ')}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        <section className="card" aria-labelledby="sess-title">
          <div className="card__head"><h2 id="sess-title"><Icon name="book" /> Dernière séance</h2></div>
          {children.map((c) => <SessionSummary key={c.id} data={data} child={c} onOpen={onOpen} />)}
        </section>
      </div>
    </div>
  );
}

function ChildProgressBlock({ data, child }: { data: AppData; child: Child }) {
  const p = childProgress(data, child.id);
  return (
    <div className="child-progress">
      <div className="child-progress__head">
        <span className="child-progress__name"><span className="avatar" aria-hidden>{child.displayName[0]}</span>{child.displayName} <span className="muted small">{child.level}</span></span>
        <span className="small"><b>{p.termine}</b> / {p.total} terminés</span>
      </div>
      <Meter value={p.termine} max={p.total} label={`${child.displayName} : ${p.termine} devoirs terminés sur ${p.total}`} />
      <div className="kv">
        <span>À faire : <b>{p.aFaire}</b></span>
        <span>En cours : <b>{p.enCours}</b></span>
        <span>Vérifiés : <b>{p.verifie}</b> / {p.termine}</span>
        {p.aConsolider > 0 && <span>À consolider : <b>{p.aConsolider}</b></span>}
      </div>
    </div>
  );
}

const OUTCOME: Record<string, { label: string; icon: IconName }> = {
  termine: { label: 'Terminé', icon: 'check-circle' },
  bloque: { label: 'Bloqué', icon: 'alert' },
  a_relire: { label: 'Ajouté par l’enfant, à relire', icon: 'edit' },
  adulte_demande: { label: 'Adulte demandé', icon: 'hand' },
  en_cours: { label: 'Commencé', icon: 'half-circle' },
  non_commence: { label: 'Pas commencé', icon: 'circle' },
};

function SessionSummary({ data, child, onOpen }: { data: AppData; child: Child; onOpen: (id: string) => void }) {
  const s: WorkSession | undefined = lastSession(data, child.id);
  if (!s) return <div style={{ marginBottom: '1rem' }}><b>{child.displayName}</b><Empty>Pas encore de séance.</Empty></div>;
  const running = !s.endedAt;
  const results = running
    ? s.order.map((id) => {
        const h = data.homeworks.find((x) => x.id === id);
        return { homeworkId: id, outcome: !h ? 'non_commence' : h.help === 'adulte_demande' ? 'adulte_demande' : h.help === 'bloque' ? 'bloque' : h.progress === 'termine' ? 'termine' : h.progress === 'en_cours' ? 'en_cours' : 'non_commence' };
      })
    : s.results;
  const finished = results.filter((r) => r.outcome === 'termine').length;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="flex between">
        <b>{child.displayName}</b>
        <span className="small muted">
          {running ? 'Séance en cours · ' : ''}{new Date(s.startedAt).toLocaleDateString('fr-FR', { weekday: 'long' })} à {timeOf(s.startedAt)} · {formatDuration(s.secondsWorked)}
        </span>
      </div>
      <p className="small" style={{ margin: '.3rem 0' }}>
        {finished} tâche{finished > 1 ? 's' : ''} terminée{finished > 1 ? 's' : ''} sur {results.length}
        {s.hintsUsed ? ` · ${s.hintsUsed} aide${s.hintsUsed > 1 ? 's' : ''} utilisée${s.hintsUsed > 1 ? 's' : ''}` : ''}
        {s.pauses ? ` · ${s.pauses} pause${s.pauses > 1 ? 's' : ''}` : ''}
      </p>
      <ul className="summary-list">
        {results.map((r) => {
          const h = data.homeworks.find((x) => x.id === r.homeworkId);
          if (!h) return null;
          const o = OUTCOME[r.outcome];
          return (
            <li key={r.homeworkId}>
              <Icon name={o.icon} />
              <div style={{ flex: 1 }}>
                <button className="btn btn--ghost" style={{ minHeight: 0, padding: 0, fontWeight: 800 }} onClick={() => onOpen(h.id)}>{h.title}</button>
                <div className="small muted">{o.label}{h.verificationNote && r.outcome === 'termine' ? ` — ${h.verificationNote}` : ''}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
