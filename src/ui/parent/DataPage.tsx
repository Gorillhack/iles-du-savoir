import { useState } from 'react';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Button } from '../components/ui';

export function DataPage() {
  const { data, resetDemo, wipeAll } = useStore();
  const [confirm, setConfirm] = useState<'reset' | 'wipe' | null>(null);
  const [msg, setMsg] = useState('');
  const size = new Blob([JSON.stringify(data)]).size;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'iles-du-savoir-export.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div>
      <div className="page-head"><div><h1>Données et confidentialité</h1><p className="sub">Tout reste sur cet appareil.</p></div></div>
      <div className="dash-grid">
        <section className="card stack">
          <h2 className="flex"><Icon name="shield" /> Ce que conserve le prototype</h2>
          <ul>
            <li>Prénom ou pseudonyme, niveau (CM1/CM2), prénom du compagnon et préférences d’affichage.</li>
            <li>Les devoirs saisis, leurs statuts et l’historique d’aide.</li>
            <li>Les pièces jointes images, réduites, si vous en ajoutez.</li>
          </ul>
          <p>Stockage : <b>local au navigateur</b> ({Math.max(1, Math.round(size / 1024))} Ko). Aucun compte, aucun serveur, aucune publicité, aucun traceur, aucune notification.</p>
          <p>Aucun service externe n’est contacté. Les photos de l’agenda ne sont ni analysées ni transmises.</p>
          <p className="legal">Le changement parent / enfant est une simulation de démonstration : il ne protège pas l’espace parent. Une authentification réelle est prévue dans l’architecture pour une version ultérieure.</p>
        </section>
        <section className="card stack">
          <h2 className="flex"><Icon name="settings" /> Gérer les données</h2>
          <div>
            <div className="flex">
              <Button variant="secondary" icon="download" onClick={exportJson}>Télécharger (JSON)</Button>
              <Button variant="secondary" icon="list" onClick={async () => {
                try { await navigator.clipboard.writeText(JSON.stringify(data, null, 2)); setMsg('Données copiées dans le presse-papiers.'); }
                catch { setMsg('Copie refusée par le navigateur.'); }
              }}>Copier (JSON)</Button>
            </div>
            <p className="small muted">Dans certains aperçus intégrés, le téléchargement est bloqué : utilisez alors « Copier ».</p>
          </div>
          <div>
            {confirm === 'reset' ? (
              <div className="notice" role="alert">
                <Icon name="alert" />
                <div><b>Remplacer toutes vos données par des devoirs fictifs de démonstration ?</b> Les vrais devoirs saisis seront effacés.
                  <div className="flex mt-1">
                    <Button variant="ghost" onClick={() => setConfirm(null)}>Annuler</Button>
                    <Button onClick={() => { resetDemo(); setConfirm(null); setMsg('Démonstration chargée.'); }}>Charger la démonstration</Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="secondary" icon="refresh" onClick={() => setConfirm('reset')}>Charger la démonstration</Button>
            )}
          </div>
          <div>
            {confirm === 'wipe' ? (
              <div className="notice" role="alert">
                <Icon name="alert" />
                <div><b>Effacer toutes les données de cet appareil ?</b> Profils, devoirs, séances et pièces jointes seront supprimés définitivement.
                  <div className="flex mt-1">
                    <Button variant="ghost" onClick={() => setConfirm(null)}>Annuler</Button>
                    <Button variant="danger" icon="trash" onClick={() => { wipeAll(); setConfirm(null); setMsg('Toutes les données ont été effacées.'); }}>Tout effacer</Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="danger" icon="trash" onClick={() => setConfirm('wipe')}>Effacer toutes les données</Button>
            )}
          </div>
          {msg && <p className="notice notice--ok" role="status"><Icon name="check" /> {msg}</p>}
        </section>
      </div>
    </div>
  );
}
