import { daysBetween, dueLabel, today } from '../../domain/dates';
import type { Homework } from '../../domain/types';
import { Icon } from '../components/Icon';
import { Chip } from '../components/ui';

/** Libellés adaptés à l'enfant, toujours icône + texte. Mêmes faits que côté parent. */
export function KidStatus({ hw }: { hw: Homework }) {
  return (
    <div className="status-line">
      {hw.progress === 'a_faire' && <Chip tone="a_faire" icon="circle">À faire</Chip>}
      {hw.needsParentReview && <Chip tone="en_cours" icon="edit">Ajouté par toi — ton adulte va le relire</Chip>}
      {hw.progress === 'en_cours' && <Chip tone="en_cours" icon="half-circle">Commencé</Chip>}
      {hw.progress === 'termine' && <Chip tone="termine" icon="check-circle">Terminé</Chip>}
      {hw.help === 'bloque' && <Chip tone="bloque" icon="alert">Tu as signalé un blocage</Chip>}
      {hw.help === 'adulte_demande' && <Chip tone="adulte_demande" icon="hand">Un adulte va venir t’aider</Chip>}
      {hw.verification === 'verifie_adulte' && <Chip tone="verifie_adulte" icon="user">Vérifié avec un adulte</Chip>}
      {hw.verification === 'verifie_exercice' && <Chip tone="verifie_exercice" icon="shield">Vérifié par la mission</Chip>}
      {hw.comprehension === 'a_consolider' && <Chip tone="a_consolider" icon="refresh">À revoir un peu</Chip>}
      {hw.comprehension === 'reussie_activite' && <Chip tone="reussie_activite" icon="star">Réussi sur cette activité</Chip>}
    </div>
  );
}

export function DuePill({ date }: { date: string }) {
  const late = daysBetween(today(), date) < 0;
  return (
    <span className={`due-pill ${late ? 'due-pill--late' : ''}`}>
      <Icon name={late ? 'clock' : 'calendar'} size={14} />
      {late ? `Prévu pour ${dueLabel(date).toLowerCase()}` : `Pour ${dueLabel(date).toLowerCase()}`}
    </span>
  );
}

export function greeting(name: string, companion: string) {
  const h = new Date().getHours();
  const hello = h < 12 ? 'Bonjour' : h < 18 ? 'Coucou' : 'Bonsoir';
  return { title: `${hello} ${name} !`, line: `${companion} a préparé ton carnet de bord. On regarde ensemble ce qu’il y a au programme ?` };
}
