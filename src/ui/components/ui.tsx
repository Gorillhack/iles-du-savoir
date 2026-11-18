import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { COMPREHENSION_LABEL, HELP_LABEL, PROGRESS_LABEL, VERIFICATION_LABEL, subjectInfo, subjectLabel } from '../../domain/catalog';
import type { Homework, SubjectId } from '../../domain/types';
import { Icon, type IconName } from './Icon';

/* ------------------------------ Bouton ------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sun' | 'turq';
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg' | 'xl';
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, block, className = '', children, type = 'button', ...rest }: BtnProps) {
  return (
    <button type={type} className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === 'xl' ? 26 : 20} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === 'xl' ? 26 : 20} />}
    </button>
  );
}

/* --------------------------- Matière --------------------------- */

export function SubjectTag({ subject, topic, compact }: { subject: SubjectId; topic?: string; compact?: boolean }) {
  const s = subjectInfo(subject);
  return (
    <span className={`subject-tag ${compact ? 'subject-tag--compact' : ''}`} style={{ ['--subject' as string]: s.color }}>
      <span className="subject-tag__dot" aria-hidden>
        <Icon name={s.icon} size={14} />
      </span>
      {subjectLabel(subject, topic)}
    </span>
  );
}

/* ----------------------------- Statuts ----------------------------- */
/* Chaque statut combine icône + texte + couleur : jamais la couleur seule. */

const PROGRESS_ICON = { a_faire: 'circle', en_cours: 'half-circle', termine: 'check-circle' } as const;
const VERIF_ICON = { non_verifie: 'dash', verifie_adulte: 'user', verifie_exercice: 'shield' } as const;
const COMP_ICON = { non_evaluee: 'dash', a_consolider: 'refresh', reussie_activite: 'star' } as const;
const HELP_ICON = { aucun: 'check', bloque: 'alert', adulte_demande: 'hand' } as const;

export function Chip({ tone, icon, children, title }: { tone: string; icon: IconName; children: ReactNode; title?: string }) {
  return (
    <span className={`chip chip--${tone}`} title={title}>
      <Icon name={icon} size={15} />
      <span>{children}</span>
    </span>
  );
}

export function ProgressChip({ hw }: { hw: Homework }) {
  return <Chip tone={hw.progress} icon={PROGRESS_ICON[hw.progress]}>{PROGRESS_LABEL[hw.progress]}</Chip>;
}

export function HelpChip({ hw }: { hw: Homework }) {
  if (hw.help === 'aucun') return null;
  return <Chip tone={hw.help} icon={HELP_ICON[hw.help]}>{HELP_LABEL[hw.help]}</Chip>;
}

/** Vue complète des quatre dimensions, pour le parent. */
export function StatusGrid({ hw }: { hw: Homework }) {
  return (
    <dl className="status-grid">
      <div>
        <dt>Avancement</dt>
        <dd><Chip tone={hw.progress} icon={PROGRESS_ICON[hw.progress]}>{PROGRESS_LABEL[hw.progress]}</Chip></dd>
      </div>
      <div>
        <dt>Vérification</dt>
        <dd><Chip tone={hw.verification} icon={VERIF_ICON[hw.verification]}>{VERIFICATION_LABEL[hw.verification]}</Chip></dd>
      </div>
      <div>
        <dt>Compréhension</dt>
        <dd><Chip tone={hw.comprehension} icon={COMP_ICON[hw.comprehension]}>{COMPREHENSION_LABEL[hw.comprehension]}</Chip></dd>
      </div>
      <div>
        <dt>Besoin d’aide</dt>
        <dd><Chip tone={`help-${hw.help}`} icon={HELP_ICON[hw.help]}>{HELP_LABEL[hw.help]}</Chip></dd>
      </div>
    </dl>
  );
}

/** Version compacte (listes) : n'affiche que ce qui apporte une information. */
export function StatusLine({ hw }: { hw: Homework }) {
  return (
    <div className="status-line">
      <Chip tone={hw.progress} icon={PROGRESS_ICON[hw.progress]}>{PROGRESS_LABEL[hw.progress]}</Chip>
      {hw.help !== 'aucun' && <Chip tone={hw.help} icon={HELP_ICON[hw.help]}>{HELP_LABEL[hw.help]}</Chip>}
      {hw.verification !== 'non_verifie' ? (
        <Chip tone={hw.verification} icon={VERIF_ICON[hw.verification]}>{VERIFICATION_LABEL[hw.verification]}</Chip>
      ) : hw.progress === 'termine' ? (
        <Chip tone="non_verifie" icon="dash">Non vérifié</Chip>
      ) : null}
      {hw.comprehension !== 'non_evaluee' && <Chip tone={hw.comprehension} icon={COMP_ICON[hw.comprehension]}>{COMPREHENSION_LABEL[hw.comprehension]}</Chip>}
    </div>
  );
}

/* ------------------------------ Modale ------------------------------ */

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const prev = document.activeElement as HTMLElement | null;
    if (!d.open) d.showModal?.();
    return () => prev?.focus?.();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal--wide' : ''}`}
      aria-labelledby={id}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="modal__inner">
        <header className="modal__head">
          <h2 id={id}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            <Icon name="x" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  );
}

/* ------------------------------ Divers ------------------------------ */

export function Empty({ children, icon = 'sparkle' }: { children: ReactNode; icon?: IconName }) {
  return (
    <div className="empty">
      <Icon name={icon} size={22} />
      <div>{children}</div>
    </div>
  );
}

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="meter__bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
