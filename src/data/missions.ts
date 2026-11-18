import type { Mission } from '../domain/mission';

/**
 * Trois missions de démonstration à l'aide pédagogique scénarisée.
 * Aucune IA : chaque étape prévoit reformulation, indice, décomposition,
 * exemple différent, et retours ciblés sur les erreurs fréquentes.
 */

const cm1Calcul: Mission = {
  id: 'cm1-multiplication',
  title: 'Multiplier en découpant le nombre',
  subject: 'maths',
  topic: 'Calcul — Multiplication',
  level: 'CM1',
  intro: 'Trois multiplications à résoudre. Astuce d’exploratrice : on peut découper un grand nombre en morceaux plus faciles.',
  steps: [
    {
      id: 's1',
      prompt: 'Calcule 23 × 4.',
      answer: { kind: 'number', value: 92 },
      reformulate: {
        question: 'Avec tes mots, que te demande-t-on ?',
        options: ['D’ajouter 23 et 4', 'De calculer 4 fois 23', 'D’enlever 4 à 23'],
        correct: 1,
        explanation: '« 23 × 4 », c’est 23 répété 4 fois : 23 + 23 + 23 + 23.',
      },
      hint: '23, c’est 20 + 3. Multiplie chaque morceau par 4, puis rassemble les résultats.',
      decompose: {
        intro: 'On découpe 23 en 20 et 3.',
        substeps: [
          { prompt: '20 × 4 = ?', answer: { kind: 'number', value: 80 } },
          { prompt: '3 × 4 = ?', answer: { kind: 'number', value: 12 } },
          { prompt: '80 + 12 = ?', answer: { kind: 'number', value: 92 } },
        ],
        outro: 'Tu as tous les morceaux. Écris maintenant ta réponse à 23 × 4.',
      },
      example: 'Exemple avec d’autres nombres : 31 × 3. On découpe 31 en 30 + 1. 30 × 3 = 90 et 1 × 3 = 3. Puis 90 + 3 = 93.',
      commonErrors: [
        { value: 27, message: 'Tu as additionné 23 et 4. Ici, on cherche 4 fois 23.' },
        { value: 812, message: 'On dirait que 80 et 12 sont écrits côte à côte. Il faut les additionner.' },
        { value: 82, message: 'Presque ! Vérifie 3 × 4 : ce n’est pas 2.' },
      ],
      success: 'Bien joué : 20 × 4 et 3 × 4, puis on rassemble.',
    },
    {
      id: 's2',
      prompt: 'Calcule 46 × 3.',
      answer: { kind: 'number', value: 138 },
      reformulate: {
        question: 'Avec tes mots, que te demande-t-on ?',
        options: ['De calculer 3 fois 46', 'De calculer 46 moins 3', 'D’écrire 46 trois fois de suite'],
        correct: 0,
        explanation: '46 × 3, c’est 46 + 46 + 46.',
      },
      hint: 'Découpe 46 en dizaines et unités : 40 et 6.',
      decompose: {
        intro: 'On découpe 46 en 40 et 6.',
        substeps: [
          { prompt: '40 × 3 = ?', answer: { kind: 'number', value: 120 } },
          { prompt: '6 × 3 = ?', answer: { kind: 'number', value: 18 } },
          { prompt: '120 + 18 = ?', answer: { kind: 'number', value: 138 } },
        ],
        outro: 'À toi d’écrire le résultat de 46 × 3.',
      },
      example: 'Exemple : 52 × 2. 50 × 2 = 100 et 2 × 2 = 4. Puis 100 + 4 = 104.',
      commonErrors: [
        { value: 49, message: 'Tu as additionné 46 et 3. On cherche 3 fois 46.' },
        { value: 12018, message: '120 et 18 sont côte à côte : additionne-les.' },
        { value: 128, message: 'Regarde bien l’addition 120 + 18.' },
        { value: 1218, message: 'Les morceaux sont collés. Pense à multiplier 40 par 3, pas 4 par 3.' },
      ],
      success: 'Excellent, même avec une retenue cachée !',
    },
    {
      id: 's3',
      prompt: 'Calcule 38 × 5.',
      answer: { kind: 'number', value: 190 },
      reformulate: {
        question: 'Avec tes mots, que te demande-t-on ?',
        options: ['De calculer 5 fois 38', 'De partager 38 en 5', 'D’ajouter 5 à 38'],
        correct: 0,
        explanation: '38 × 5, c’est 38 répété 5 fois.',
      },
      hint: 'Même méthode : 38 = 30 + 8.',
      decompose: {
        intro: 'On découpe 38 en 30 et 8.',
        substeps: [
          { prompt: '30 × 5 = ?', answer: { kind: 'number', value: 150 } },
          { prompt: '8 × 5 = ?', answer: { kind: 'number', value: 40 } },
          { prompt: '150 + 40 = ?', answer: { kind: 'number', value: 190 } },
        ],
        outro: 'Écris maintenant le résultat de 38 × 5.',
      },
      example: 'Exemple : 24 × 5. 20 × 5 = 100 et 4 × 5 = 20. Puis 100 + 20 = 120.',
      commonErrors: [
        { value: 43, message: 'Tu as additionné 38 et 5. On cherche 5 fois 38.' },
        { value: 180, message: 'Vérifie 8 × 5.' },
        { value: 15040, message: '150 et 40 sont côte à côte : additionne-les.' },
      ],
      success: 'Trois sur trois. La méthode du découpage n’a plus de secret pour cette mission.',
    },
  ],
  check: {
    question: 'Pour calculer 52 × 3, quelle méthode fonctionne ?',
    options: ['50 × 3, puis 2 × 3, et j’additionne', '52 + 3', '5 × 3, puis 2 × 3, et je les écris côte à côte'],
    correct: 0,
    explanation: 'On multiplie les dizaines (50) et les unités (2), puis on additionne : 150 + 6 = 156.',
  },
};

const cm2Fractions: Mission = {
  id: 'cm2-fractions',
  title: 'Comparer et utiliser les fractions',
  subject: 'maths',
  topic: 'Fractions',
  level: 'CM2',
  intro: 'Trois défis sur les fractions. Pense à une tarte partagée : c’est souvent la meilleure carte.',
  steps: [
    {
      id: 'f1',
      prompt: 'Quelle fraction est la plus grande ?',
      support: '3/4  ou  3/8',
      answer: { kind: 'choice', options: ['3/4', '3/8', 'Elles sont égales'], correct: 0 },
      reformulate: {
        question: 'Avec tes mots, que te demande-t-on ?',
        options: ['De trouver laquelle représente la plus grande quantité', 'D’additionner les deux fractions', 'De trouver le plus grand dénominateur'],
        correct: 0,
        explanation: 'On compare deux quantités : 3 parts d’une tarte coupée en 4, ou 3 parts d’une tarte coupée en 8.',
      },
      hint: 'Les deux fractions prennent 3 parts. Ce qui change, c’est la taille des parts.',
      decompose: {
        intro: 'Imagine deux tartes identiques.',
        substeps: [
          { prompt: 'Une tarte coupée en 4 ou en 8 : où sont les parts les plus grosses ?', answer: { kind: 'choice', options: ['Coupée en 4', 'Coupée en 8'], correct: 0 } },
          { prompt: 'Qu’est-ce qui fait le plus : 3 grosses parts ou 3 petites parts ?', answer: { kind: 'choice', options: ['3 grosses parts', '3 petites parts'], correct: 0 } },
        ],
        outro: 'Reviens à la question : 3/4 ou 3/8 ?',
      },
      example: 'Exemple : 2/3 et 2/5. Une tarte coupée en 3 donne des parts plus grosses qu’en 5. Donc 2/3 est plus grand que 2/5.',
      commonErrors: [
        { value: '1', message: '8 est plus grand que 4, mais ici, couper en 8 donne des parts plus petites.' },
        { value: '2', message: 'Elles ont le même numérateur, mais pas des parts de même taille.' },
      ],
      success: 'Oui : même nombre de parts, mais des parts plus grosses.',
    },
    {
      id: 'f2',
      prompt: 'Calcule 3/4 de 20 billes.',
      answer: { kind: 'number', value: 15, unit: 'billes' },
      reformulate: {
        question: 'Avec tes mots, que te demande-t-on ?',
        options: ['De partager 20 billes en 4 et d’en prendre 3 parts', 'De multiplier 20 par 3 et par 4', 'D’ajouter 3 et 4 à 20'],
        correct: 0,
        explanation: '« 3/4 de 20 » : on partage 20 en 4 parts égales et on en garde 3.',
      },
      hint: 'Commence par trouver 1/4 de 20 : partage 20 en 4 parts égales.',
      decompose: {
        intro: 'Deux étapes : une part, puis trois parts.',
        substeps: [
          { prompt: '20 ÷ 4 = ?  (c’est 1/4 de 20)', answer: { kind: 'number', value: 5 } },
          { prompt: '5 × 3 = ?  (ce sont 3 parts)', answer: { kind: 'number', value: 15 } },
        ],
        outro: 'Combien font donc 3/4 de 20 billes ?',
      },
      example: 'Exemple : 2/3 de 12. 12 ÷ 3 = 4 (une part), puis 4 × 2 = 8. Donc 2/3 de 12 = 8.',
      commonErrors: [
        { value: 5, message: 'Tu as trouvé 1/4 de 20. Il faut prendre 3 parts.' },
        { value: 60, message: 'Tu as multiplié 20 par 3. N’oublie pas de partager d’abord en 4.' },
        { value: 80, message: 'Tu as multiplié par 4. Ici, on partage en 4.' },
      ],
      success: 'C’est ça : on partage, puis on prend les parts demandées.',
    },
    {
      id: 'f3',
      prompt: 'Complète l’égalité : 1/2 = ? / 8',
      answer: { kind: 'number', value: 4 },
      reformulate: {
        question: 'Avec tes mots, que te demande-t-on ?',
        options: ['De trouver combien de huitièmes font une moitié', 'De calculer 1 + 2 + 8', 'De diviser 8 par 1'],
        correct: 0,
        explanation: 'On cherche une fraction égale à 1/2 mais avec des parts plus petites (des huitièmes).',
      },
      hint: 'Pour passer de 2 à 8 en bas, on multiplie par combien ? Fais pareil en haut.',
      decompose: {
        intro: 'On regarde le dénominateur, puis le numérateur.',
        substeps: [
          { prompt: '2 × ? = 8', answer: { kind: 'number', value: 4 } },
          { prompt: '1 × 4 = ?', answer: { kind: 'number', value: 4 } },
        ],
        outro: 'Quel nombre faut-il écrire à la place du « ? » ?',
      },
      example: 'Exemple : 1/3 = ? / 6. 3 × 2 = 6, donc en haut 1 × 2 = 2. Ainsi 1/3 = 2/6.',
      commonErrors: [
        { value: 7, message: 'On ne fait pas une soustraction : on multiplie en haut et en bas par le même nombre.' },
        { value: 2, message: 'Regarde le dénominateur : 2 est devenu 8. On a multiplié par combien ?' },
        { value: 16, message: 'Tu as multiplié par 8. Cherche plutôt par combien on multiplie 2 pour obtenir 8.' },
      ],
      success: 'Bravo : 4/8, c’est bien la moitié de la tarte.',
    },
  ],
  check: {
    question: 'Laquelle de ces fractions est égale à 1/2 ?',
    options: ['3/6', '3/5', '2/6'],
    correct: 0,
    explanation: '3 est la moitié de 6, donc 3/6 = 1/2.',
  },
};

const probleme: Mission = {
  id: 'probleme-adapte',
  title: 'Problème du jour',
  subject: 'maths',
  topic: 'Résolution de problèmes',
  level: 'adaptatif',
  intro: 'Un problème en deux parties. Lis tranquillement : chercher ce que l’on demande, c’est déjà la moitié du travail.',
  steps: {
    CM1: [
      {
        id: 'p1',
        prompt: 'La classe prépare un goûter. Il y a 3 paquets de 24 gâteaux. Les élèves en mangent 15 à la récréation. Combien de gâteaux reste-t-il ?',
        answer: { kind: 'number', value: 57, unit: 'gâteaux' },
        reformulate: {
          question: 'Que cherche-t-on ?',
          options: ['Le nombre de gâteaux qui restent', 'Le nombre de paquets', 'Le nombre de gâteaux mangés'],
          correct: 0,
          explanation: 'On veut savoir combien de gâteaux il reste après la récréation.',
        },
        hint: 'Il y a deux étapes : d’abord combien de gâteaux en tout, ensuite combien il en reste.',
        decompose: {
          intro: 'Étape par étape.',
          substeps: [
            { prompt: 'Combien de gâteaux en tout ? 3 × 24 = ?', answer: { kind: 'number', value: 72 } },
            { prompt: 'On en mange 15. 72 − 15 = ?', answer: { kind: 'number', value: 57 } },
          ],
          outro: 'Écris ta réponse au problème.',
        },
        example: 'Exemple : 4 sacs de 10 billes, on en perd 6. 4 × 10 = 40 billes en tout, puis 40 − 6 = 34 billes restent.',
        commonErrors: [
          { value: 72, message: 'C’est le nombre total de gâteaux. Il faut encore enlever ceux qui ont été mangés.' },
          { value: 9, message: 'Tu as utilisé un seul paquet. Il y en a 3.' },
          { value: 39, message: 'Relis : les gâteaux mangés s’enlèvent, ils ne s’ajoutent pas.' },
        ],
        success: 'Oui : 72 gâteaux, moins les 15 mangés.',
      },
      {
        id: 'p2',
        prompt: 'Les gâteaux qui restent sont partagés équitablement entre 3 tables. Combien de gâteaux par table ?',
        support: 'Il reste 57 gâteaux.',
        answer: { kind: 'number', value: 19, unit: 'gâteaux' },
        reformulate: {
          question: 'Que cherche-t-on ?',
          options: ['Combien de gâteaux reçoit chaque table', 'Combien de tables il y a', 'Combien de gâteaux il y avait au début'],
          correct: 0,
          explanation: 'On partage 57 gâteaux en 3 parts égales.',
        },
        hint: 'Partager en 3 parts égales, c’est diviser par 3. Tu peux découper 57 en 30 + 27.',
        decompose: {
          intro: 'On découpe 57 en 30 et 27, deux nombres faciles à diviser par 3.',
          substeps: [
            { prompt: '30 ÷ 3 = ?', answer: { kind: 'number', value: 10 } },
            { prompt: '27 ÷ 3 = ?', answer: { kind: 'number', value: 9 } },
            { prompt: '10 + 9 = ?', answer: { kind: 'number', value: 19 } },
          ],
          outro: 'Combien de gâteaux par table ?',
        },
        example: 'Exemple : 48 cartes pour 4 joueurs. 40 ÷ 4 = 10 et 8 ÷ 4 = 2, donc 12 cartes chacun.',
        commonErrors: [
          { value: 171, message: 'Tu as multiplié. Ici, on partage : c’est une division.' },
          { value: 54, message: 'Tu as enlevé 3. On partage en 3 parts égales.' },
        ],
        success: 'Parfait : 19 gâteaux par table, et rien ne dépasse.',
      },
    ],
    CM2: [
      {
        id: 'p1',
        prompt: 'Un club de randonnée suit un sentier de 18 km. Le matin, il parcourt les 2/3 du sentier. Combien de kilomètres reste-t-il pour l’après-midi ?',
        answer: { kind: 'number', value: 6, unit: 'km' },
        reformulate: {
          question: 'Que cherche-t-on ?',
          options: ['La distance qui reste l’après-midi', 'La distance parcourue le matin', 'La longueur totale du sentier'],
          correct: 0,
          explanation: 'On connaît le total (18 km) et la part du matin. On cherche ce qui reste.',
        },
        hint: 'Calcule d’abord la distance du matin (2/3 de 18), puis enlève-la du total.',
        decompose: {
          intro: 'Trois petites étapes.',
          substeps: [
            { prompt: '1/3 de 18 km : 18 ÷ 3 = ?', answer: { kind: 'number', value: 6 } },
            { prompt: '2/3 de 18 km : 6 × 2 = ?', answer: { kind: 'number', value: 12 } },
            { prompt: 'Ce qui reste : 18 − 12 = ?', answer: { kind: 'number', value: 6 } },
          ],
          outro: 'Combien de kilomètres l’après-midi ?',
        },
        example: 'Exemple : un livre de 40 pages dont on a lu les 3/4. 40 ÷ 4 = 10, 10 × 3 = 30 pages lues, 40 − 30 = 10 pages restent.',
        commonErrors: [
          { value: 12, message: 'C’est la distance du matin. La question demande ce qui reste.' },
          { value: 36, message: 'Tu as multiplié 18 par 2. Pense à partager en 3 d’abord.' },
          { value: 16, message: 'On ne fait pas 18 − 2 : 2/3 est une fraction du sentier.' },
        ],
        success: 'Exact : 12 km le matin, il en reste 6.',
      },
      {
        id: 'p2',
        prompt: 'L’après-midi, le club marche ces 6 km en 1 h 30 min. Combien de minutes cela fait-il ?',
        answer: { kind: 'number', value: 90, unit: 'minutes' },
        reformulate: {
          question: 'Que cherche-t-on ?',
          options: ['La durée de marche convertie en minutes', 'La vitesse du club', 'La distance en mètres'],
          correct: 0,
          explanation: 'On convertit 1 h 30 min en minutes.',
        },
        hint: 'Combien de minutes y a-t-il dans une heure ?',
        decompose: {
          intro: 'On convertit l’heure, puis on ajoute les minutes.',
          substeps: [
            { prompt: '1 h = ? min', answer: { kind: 'number', value: 60 } },
            { prompt: '60 + 30 = ?', answer: { kind: 'number', value: 90 } },
          ],
          outro: 'Combien de minutes en tout ?',
        },
        example: 'Exemple : 2 h 15 min. 2 × 60 = 120 min, puis 120 + 15 = 135 min.',
        commonErrors: [
          { value: 130, message: 'Une heure ne fait pas 100 minutes : combien de minutes dans une heure ?' },
          { value: 31, message: 'Il faut convertir l’heure en minutes avant d’ajouter.' },
        ],
        success: 'Bravo : 90 minutes de marche.',
      },
    ],
  },
  check: {
    CM1: {
      question: 'Dans ce problème, pourquoi a-t-on fait une multiplication au début ?',
      options: ['Pour trouver le nombre total de gâteaux des 3 paquets', 'Pour trouver le nombre de gâteaux mangés', 'Parce qu’il y a le mot « combien »'],
      correct: 0,
      explanation: '3 paquets de 24 : la multiplication donne le total, avant d’enlever ceux qui sont mangés.',
    },
    CM2: {
      question: 'Si le club a parcouru les 2/3 du sentier, quelle fraction reste-t-il ?',
      options: ['1/3', '2/3', '1/2'],
      correct: 0,
      explanation: 'Le sentier entier fait 3/3. 3/3 − 2/3 = 1/3. Et 1/3 de 18 km, c’est bien 6 km.',
    },
  },
};

export const MISSIONS: Mission[] = [cm1Calcul, cm2Fractions, probleme];

export const getMission = (id?: string) => MISSIONS.find((m) => m.id === id);
