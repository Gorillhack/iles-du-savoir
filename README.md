# Les Îles du Savoir — prototype v0.1

Aide aux devoirs CM1-CM2 avec un espace parent et un compagnon panda roux.
Prototype interactif : React 19 + TypeScript + Vite, sans backend ni IA externe.

## Lancer

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # application dans dist/ (hébergeable telle quelle)
npm run build:single   # un seul fichier HTML autonome dans dist-single/
```

Node 20 ou plus récent. Pour tester sur téléphone en local : `npm run dev -- --host`, puis ouvrir l’adresse réseau affichée.

## Parcours de démonstration (5 minutes)

1. **Parent** › « Ajouter un devoir » : saisir un titre, éventuellement associer une mission guidée (fractions ou problème).
2. Bandeau DÉMO › **Nathan** : le devoir apparaît. Réordonner avec les flèches, puis « Commencer mes devoirs ».
3. Demander un indice (reformulation › indice › décomposition › exemple), se tromper, corriger, utiliser « Je suis bloqué·e » ou « J’ai besoin d’un adulte ».
4. Recharger la page : la séance reprend où elle en était.
5. **Parent** : la demande d’aide, le blocage et le devoir à vérifier remontent dans « À votre attention ». Ouvrir le devoir, lire ce qui a été réellement vérifié, cliquer « Vérifier ensemble ».

Au premier lancement, le carnet est vide avec le profil de Nathan (CM2, compagnon Pépin). Des devoirs fictifs se chargent depuis Données › « Charger la démonstration ». Les dates sont recalculées par rapport au jour du test. « Données » › « Réinitialiser la démonstration » remet tout à zéro.

## L’enfant peut aussi ajouter ses devoirs

Dans son espace (« Ajouter un devoir » sur l’accueil ou dans le carnet), l’enfant recopie son agenda en 5 étapes courtes : matière, ce qu’il faut faire, pour quand, adulte nécessaire ou non, photo facultative.

- Le devoir arrive tout de suite dans son carnet, marqué « Ajouté par toi — ton adulte va le relire ».
- Côté parent, il remonte dans « À votre attention » (« Ajouté par l’enfant, à relire ») avec deux actions : « C’est correct » ou « Corriger ». Toute modification dans l’espace parent vaut relecture.
- Tant qu’il n’est ni relu ni commencé, l’enfant peut le retirer s’il s’est trompé.
- L’enfant ne peut pas associer de mission guidée : c’est le parent qui le fait.

## Architecture

```
src/
  domain/      logique métier pure, sans React ni stockage
    types.ts     modèle (Child, Homework, 4 statuts séparés, sessions, aide)
    logic.ts     reduce(état, action) + lectures dérivées (points d’attention, progression)
    mission.ts   format des missions scénarisées, contrôle des réponses
    catalog.ts   matières/îles, libellés de statuts, barème des lucioles, refuge
    dates.ts     dates locales en français
  data/        accès aux données
    repository.ts  interface FamilyRepository + implémentation localStorage
    demoData.ts    jeu de démonstration réinitialisable
    missions.ts    les 3 missions (CM1 calcul, CM2 fractions, problème adapté au niveau)
  state/store.tsx  contexte React : dispatch → reduce → sauvegarde immédiate
  ui/
    components/  Panda (5 expressions), icônes, statuts, modale, décors
    parent/      tableau de bord, devoirs (Aujourd’hui / Semaine), import photo, profils, données
    child/       accueil, séance, MissionPlayer, carnet, îles, refuge
```

**Vers un backend** : implémenter `FamilyRepository` sur une API (load/save/subscribe) et rejouer les mêmes `Action` côté serveur. `familyId` est déjà présent pour des comptes familiaux séparés. Le rôle parent/enfant (`UiState`) est volontairement distinct des données : il sera remplacé par une session authentifiée (parent) et un profil d’appareil (enfant).

**Vers une PWA** : `public/manifest.webmanifest` et l’icône sont en place. Restent : un service worker (ex. `vite-plugin-pwa`) et des icônes PNG 192/512.

**Reconnaissance de l’agenda** : `PhotoImport.tsx` produit des brouillons `HomeworkDraft[]` que le parent relit et valide. Un futur service (OCR côté serveur, jamais de clé dans le navigateur) n’aurait qu’à pré-remplir ces brouillons, après consentement explicite.

## Statuts : ce que l’application affirme vraiment

| Dimension | Valeurs | Qui la change |
|---|---|---|
| Avancement | À faire · En cours · Terminé par l’enfant | l’enfant |
| Vérification | Non vérifié · Vérifié par un adulte · Vérifié par un exercice adapté | le parent, ou une mission guidée |
| Compréhension | Non évaluée · À consolider · Réussi sur l’activité proposée | mission (règle ci-dessous) ou parent |
| Besoin d’aide | Aucun · Bloqué · Adulte demandé | l’enfant ; le parent clôt avec « Aide apportée » |

Règle mission : « Réussi sur l’activité » seulement si toutes les questions sont résolues, que la question de compréhension finale est réussie et qu’plus de la moitié des réponses sont justes du premier coup, sans aide. Sinon « À consolider ». La note de vérification précise toujours « cela vérifie cette activité, pas l’ensemble de la notion ». L’application n’affiche jamais « maîtrisé ».

## Ludique, sans pression

Les lucioles récompensent l’effort : tâche terminée (+2), erreur corrigée (+1), demande d’aide (+1, une fois par signalement), séance finie (+3). Elles ne diminuent jamais. Pas de série quotidienne, de classement, d’achat, de publicité ni de fil infini. La pause est proposée à la durée choisie par le parent, jamais imposée.

## Accessibilité

Zones tactiles d’au moins 48 px, navigation clavier, lien d’évitement, libellés ARIA, focus visible. Chaque statut combine icône, texte et couleur. Couleurs « encre » renforcées pour un contraste AA sur fond crème. Option texte agrandi et animations désactivables par enfant ; `prefers-reduced-motion` est respecté.

## Ressources graphiques

Les illustrations du compagnon et le décor des îles viennent de la planche visuelle (`src/assets/*.webp`) : recadrées, réduites, bords fondus sur le crème de l’interface. Le panda SVG de `Panda.tsx` reste en repli.

| Expression | Source utilisée |
|---|---|
| Accueil | grand panda qui fait coucou |
| Réflexion | panda au point d’interrogation |
| Explication | panda à la loupe et à l’ampoule |
| Célébration | panda aux poings levés |
| Encouragement | **pas de pose dédiée** : réutilise les poings levés |

Pour la version finale, il manque :

- une pose « encouragement » distincte (pouce levé, sourire) ;
- chaque pose **séparée, sur fond transparent** (PNG ou SVG, 1024 px), avec le même cadrage et la même ligne de sol ;
- une version « mini » lisible à 64 px pour le panneau d’aide ;
- le refuge et les îles en éléments séparés si l’on veut les animer ou y placer les accessoires.

Il suffira de remplacer les fichiers de `src/assets/` : l’API de `Panda` (`mood`, `size`, `label`, `animated`) ne change pas.

## Limites connues

- Changement de rôle **simulé** : l’espace parent n’est pas protégé.
- Données sur un seul navigateur (localStorage, quelques Mo). Pas de synchronisation entre appareils ; entre onglets d’un même navigateur, oui.
- Seules les 3 missions de démonstration ont une aide pas à pas et une vérification. Les autres devoirs ont des conseils de méthode génériques, sans correction.
- Pas d’analyse de la photo d’agenda (saisie manuelle assistée).
- Pas de notifications (volontaire). Le parent voit les demandes en ouvrant son tableau de bord.
- La pièce jointe est réduite (1280 px, JPEG) ; plusieurs grosses images peuvent saturer le stockage : un message l’indique.
- Dans l’aperçu claude.ai, le téléchargement de l’export est bloqué : utiliser « Copier (JSON) ».
- Testé avec Chrome (mobile 390 px et ordinateur 1366 px). À vérifier sur Safari iOS et sur tablette réelle.
