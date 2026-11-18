import { Icon } from '../ui/components/Icon';
import { useCompanion } from './CompanionProvider';
import { PepinFigure } from './PepinFigure';
import { useSpeech } from './useSpeech';

/** Bulle de parole : texte toujours visible ; voix seulement sur action explicite. */
export function CompanionBubble({ message, name, voice, onClose, compact }: { message: string; name: string; voice: boolean; onClose?: () => void; compact?: boolean }) {
  const { available, speaking, speak, stop } = useSpeech();
  return (
    <div className={`pepin-bubble ${compact ? 'pepin-bubble--compact' : ''}`}>
      <span className="pepin-bubble__name">{name}</span>
      <span className="pepin-bubble__text">{message}</span>
      {(voice && available) || onClose ? (
        <span className="pepin-bubble__actions">
          {voice && available && (
            speaking ? (
              <button type="button" className="pepin-bubble__btn" onClick={stop}><Icon name="pause" size={16} /> Arrêter</button>
            ) : (
              <button type="button" className="pepin-bubble__btn" onClick={() => speak(message)}><Icon name="play" size={16} /> Écouter</button>
            )
          )}
          {onClose && (
            <button type="button" className="pepin-bubble__btn pepin-bubble__btn--icon" onClick={() => { stop(); onClose(); }} aria-label="Fermer la bulle"><Icon name="x" size={16} /></button>
          )}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Pépin relié au moteur d'événements.
 * - `hero` : accueil enfant, grande taille, bulle à côté.
 * - `dock` : pendant la séance, petit et discret, dans un coin, ne bloque rien.
 * - `scene` : refuge, toucher Pépin déclenche une réaction (limitée).
 */
export function PepinLive({ variant, size, onPoke, bubble: showBubble = true }: { variant: 'hero' | 'dock' | 'scene'; size: number; onPoke?: () => void; bubble?: boolean }) {
  const c = useCompanion();
  if (!c) return null;
  const figure = <PepinFigure state={c.state} size={size} still={c.still} seq={c.seq} />;
  const bubble = c.message && showBubble ? (
    <div className="pepin-live__bubble" key={c.seq}>
      <CompanionBubble message={c.message} name={c.name} voice={c.voice} onClose={c.dismiss} compact={variant === 'dock'} />
    </div>
  ) : null;

  if (variant === 'dock') {
    // Barre fixe de hauteur constante : aucun décalage de mise en page, rien n'est recouvert.
    return (
      <div className="pepin-bar" role="status" aria-live="polite">
        <PepinFigure state={c.state} size={60} still={c.still} seq={c.seq} />
        <div className="pepin-bar__text">
          <span className="pepin-bubble__name">{c.name}</span>
          <span key={c.seq} className={c.message ? 'pepin-bar__msg' : 'pepin-bar__idle'}>
            {c.message ?? `Je suis là si tu as besoin d’un indice.`}
          </span>
        </div>
        {c.message && c.voice && <SpeakButton text={c.message} />}
      </div>
    );
  }

  return (
    <div className={`pepin-live pepin-live--${variant}`}>
      {/* Région annoncée aux lecteurs d'écran, sans interrompre. */}
      <div className="sr-only" aria-live="polite">{c.message ?? ''}</div>
      {variant === 'scene' ? (
        <button type="button" className="pepin-live__poke" onClick={onPoke} aria-label={`Toucher ${c.name}`}>
          {figure}
          <span className="scene-tag" aria-hidden>{c.name}</span>
        </button>
      ) : (
        figure
      )}
      {bubble}
    </div>
  );
}

function SpeakButton({ text }: { text: string }) {
  const { available, speaking, speak, stop } = useSpeech();
  if (!available) return null;
  return speaking
    ? <button type="button" className="pepin-bubble__btn" onClick={stop}><Icon name="pause" size={16} /> Arrêter</button>
    : <button type="button" className="pepin-bubble__btn" onClick={() => speak(text)}><Icon name="play" size={16} /> Écouter</button>;
}
