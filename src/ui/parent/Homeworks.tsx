import { useState } from 'react';
import { ADULT_ACTIVITY_LABEL } from '../../domain/catalog';
import { addDays, dueLabel, longDate, shortDate, startOfWeek, today } from '../../domain/dates';
import type { Homework } from '../../domain/types';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Button, Empty, StatusLine, SubjectTag } from '../components/ui';

export function Homeworks({ onOpen, onAdd, onPhoto, onEdit }: { onOpen: (id: string) => void; onAdd: () => void; onPhoto: () => void; onEdit: (id: string) => void }) {
  const { data, dispatch } = useStore();
  const [view, setView] = useState<'today' | 'week'>('today');
  const [childId, setChildId] = useState('all');
  const [week, setWeek] = useState(startOfWeek(today()));
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const t = today();
  const tomorrow = addDays(t, 1);

  const list = data.homeworks.filter((h) => childId === 'all' || h.childId === childId);
  const childName = (id: string) => data.children.find((c) => c.id === id)?.displayName ?? '';

  const Row = ({ h }: { h: Homework }) => (
    <div className="hw-row hw-row--clickable">
      <div>
        <div className="flex"><SubjectTag subject={h.subject} topic={h.topic} compact />{childId === 'all' && <span className="small muted">· {childName(h.childId)}</span>}</div>
        <div className="hw-row__title"><button className="hw-row__link" onClick={() => onOpen(h.id)}>{h.title}</button></div>
        <div className="hw-row__meta">
          <span><Icon name="calendar" size={15} /> Pour {dueLabel(h.dueDate).toLowerCase()}</span>
          {h.estimatedMinutes && <span><Icon name="clock" size={15} /> ~{h.estimatedMinutes} min</span>}
          {h.adultActivity !== 'aucune' && <span><Icon name="users" size={15} /> {ADULT_ACTIVITY_LABEL[h.adultActivity]}</span>}
          {h.missionId && <span><Icon name="sparkle" size={15} /> Mission guidée</span>}
          {h.attachment && <span><Icon name="paperclip" size={15} /> Pièce jointe</span>}
          {h.addedBy === 'enfant' && <span><Icon name="user" size={15} /> Ajouté par {childName(h.childId)}{h.needsParentReview ? ' — à relire' : ''}</span>}
        </div>
      </div>
      <div className="hw-row__actions">
        {confirmDel === h.id ? (
          <>
            <Button variant="danger" onClick={() => { dispatch({ type: 'hw/delete', id: h.id }); setConfirmDel(null); }}>Supprimer</Button>
            <Button variant="ghost" onClick={() => setConfirmDel(null)}>Non</Button>
          </>
        ) : (
          <>
            <button className="icon-btn" aria-label={`Modifier « ${h.title} »`} onClick={() => onEdit(h.id)}><Icon name="edit" /></button>
            <button className="icon-btn" aria-label={`Supprimer « ${h.title} »`} onClick={() => setConfirmDel(h.id)}><Icon name="trash" /></button>
          </>
        )}
      </div>
      <div className="hw-row__status"><StatusLine hw={h} /></div>
    </div>
  );

  const sort = (a: Homework, b: Homework) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title);

  return (
    <div>
      <div className="page-head">
        <div><h1>Devoirs</h1><p className="sub">Ajoutez, modifiez et suivez les devoirs de l’agenda.</p></div>
        <div className="flex">
          <Button icon="plus" onClick={onAdd}>Ajouter</Button>
          <Button variant="secondary" icon="camera" onClick={onPhoto}>Depuis l’agenda</Button>
        </div>
      </div>

      <div className="toolbar">
        <div className="tabs" role="group" aria-label="Vue">
          <button aria-pressed={view === 'today'} onClick={() => setView('today')}>Aujourd’hui</button>
          <button aria-pressed={view === 'week'} onClick={() => setView('week')}>Semaine</button>
        </div>
        <div className="spacer" />
        <label className="sr-only" htmlFor="child-filter">Enfant</label>
        <select id="child-filter" className="select" style={{ width: 'auto' }} value={childId} onChange={(e) => setChildId(e.target.value)}>
          <option value="all">Tous les enfants</option>
          {data.children.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
        </select>
      </div>

      {view === 'today' ? (
        <>
          <section className="day-group">
            <h3>À préparer aujourd’hui <span className="muted">— en retard, pour aujourd’hui et pour demain</span></h3>
            {(() => {
              const items = list.filter((h) => h.progress !== 'termine' && h.dueDate <= tomorrow).sort(sort);
              return items.length ? items.map((h) => <Row key={h.id} h={h} />) : <Empty icon="check-circle">Rien en attente.</Empty>;
            })()}
          </section>
          <section className="day-group">
            <h3>Terminés <span className="muted">— à vérifier si besoin</span></h3>
            {(() => {
              const items = list.filter((h) => h.progress === 'termine' && h.dueDate >= addDays(t, -2) && h.dueDate <= tomorrow).sort(sort);
              return items.length ? items.map((h) => <Row key={h.id} h={h} />) : <Empty>Aucun devoir terminé récemment.</Empty>;
            })()}
          </section>
        </>
      ) : (
        <>
          <div className="flex" style={{ marginBottom: '.5rem' }}>
            <Button variant="secondary" icon="arrow-left" onClick={() => setWeek(addDays(week, -7))} aria-label="Semaine précédente" />
            <b style={{ minWidth: 220, textAlign: 'center' }}>Semaine du {shortDate(week)} au {shortDate(addDays(week, 6))}</b>
            <Button variant="secondary" icon="arrow-right" onClick={() => setWeek(addDays(week, 7))} aria-label="Semaine suivante" />
            {week !== startOfWeek(t) && <Button variant="ghost" onClick={() => setWeek(startOfWeek(t))}>Cette semaine</Button>}
          </div>
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(week, i);
            const items = list.filter((h) => h.dueDate === day).sort(sort);
            if (!items.length && (i >= 5)) return null; // week-end vide : masqué
            return (
              <section key={day} className="day-group">
                <h3 style={{ textTransform: 'capitalize' }}>
                  {longDate(day)} {day === t && <span className="muted">— aujourd’hui</span>}
                </h3>
                {items.length ? items.map((h) => <Row key={h.id} h={h} />) : <p className="small muted">Aucun devoir pour ce jour.</p>}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
