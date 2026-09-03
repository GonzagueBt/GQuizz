# GQuizz — Architecture produit & technique

App mobile (iOS + Android, démo web) de quiz de culture générale.
Stack et conventions : voir `../MOBILE_PROJECT_ARCHITECTURE.md`.

Ce document traduit la spec produit en modèle de données et modules concrets.

---

## 1. Les trois niveaux

```
🧠 Question   — l'unité fondamentale
📚 Deck       — un ensemble thématique de questions (gratuit ou premium)
🌎 Mode       — la manière dont les questions sont sélectionnées pour une partie
```

Ces trois niveaux sont **indépendants**. Une question vit dans un deck, porte une
catégorie/sous-catégorie et une difficulté ; un mode assemble un *pool* de
questions à partir de ces attributs.

---

## 2. Modèle de données

TypeScript, dans `src/domain/types.ts`. Tout est embarqué (JSON) au départ ;
chaque entité a un `id` stable pour permettre l'évolution du contenu sans casser
la progression des joueurs.

### 2.1 Catégories (arbre, profondeur libre)

```ts
interface Category {
  id: string;            // "sport", "sport.football" — stable, jamais réutilisé
  parentId: string | null;
  name: string;
  emoji?: string;
  order: number;         // tri d'affichage
}
```

- L'arbre est plat en stockage (`parentId`), reconstruit à l'exécution.
- L'UI actuelle affiche **2 niveaux** (catégorie → sous-catégorie) mais le modèle
  en autorise N. `src/domain/categoryTree.ts` fournit `getChildren`, `getPath`,
  `getDescendants`, `getLeaves`.
- Les `id` de sous-catégories sont préfixés par le parent (`sport.football`) par
  convention, mais le code ne s'appuie que sur `parentId`.

### 2.2 Deck

```ts
interface Deck {
  id: string;
  name: string;
  description: string;        // courte (1-2 phrases)
  emoji: string;
  image?: string;             // asset embarqué ou URL
  categoryId: string;         // catégorie principale du deck
  subcategoryId?: string;
  tier: 'free' | 'premium';
  productId?: string;         // identifiant produit store (si premium)
  priceHint?: string;         // ex. "1,99 €" — indicatif ; le vrai prix vient du store
  questionCount: number;      // dénormalisé pour l'affichage (calculé au build)
  averageDifficulty: Difficulty;   // calculé au build
  previewQuestionIds?: string[];   // 2-3 questions montrées avant achat
  releasedAt: string;         // ISO — pour trier "nouveautés"
  tags?: string[];            // "nouveau", "promo", "pack:histoire"…
}

type Difficulty = 1 | 2 | 3 | 4 | 5;   // 1 = facile, 5 = expert
```

### 2.3 Question

```ts
interface Question {
  id: string;
  deckId: string;
  categoryId: string;
  subcategoryId?: string;
  difficulty: Difficulty;
  type: 'single' | 'multiple' | 'boolean' | 'ordering';  // extensible
  prompt: string;
  answers: Answer[];
  explanation?: string;
  media?: { kind: 'image' | 'audio'; src: string };
  meta?: { source?: string; updatedAt?: string };
}

interface Answer {
  id: string;
  text: string;
  correct: boolean;
}
```

> Déplacer une question d'un deck à un autre = changer `deckId`. Aucune autre
> logique n'en dépend : le pool se reconstruit à partir des attributs.

### 2.4 Mode de jeu

```ts
type GameMode =
  | { kind: 'global' }                      // 🌎 Global personnalisé
  | { kind: 'deck'; deckId: string }        // 📚 un deck précis
  | { kind: 'daily'; date: string }         // 📅 défi du jour (futur)
  | { kind: 'event'; eventId: string };     // 🎉 événement temporaire (futur)
```

L'union discriminée rend l'ajout de modes non-cassant : `questionPool.ts` fait un
`switch` exhaustif et le compilateur signale tout mode non géré.

---

## 3. Préférences de catégories (include / exclude)

```ts
interface CategoryPreferences {
  strategy: 'include' | 'exclude';
  // liste de catégories cochées. Interprétation selon strategy :
  //  - include : le pool = questions dont une catégorie de la branche est cochée
  //  - exclude : le pool = toutes les questions SAUF celles d'une branche cochée
  selected: string[];         // ids de Category (à n'importe quel niveau)
  version: number;            // schéma de persistance
}
```

### Résolution → `src/domain/preferences.ts`

`resolveAllowedCategories(prefs, tree): Set<string>` retourne l'ensemble des
**catégories feuilles autorisées** :

- **include** : pour chaque `id` sélectionné, on autorise `id` + tous ses
  descendants. Une catégorie parent cochée ⇒ toutes ses sous-catégories, sauf
  celles explicitement décochées (l'UI enlève alors le parent et coche les
  enfants voulus — cf. exemple §4 de la spec).
- **exclude** : on part de **toutes** les feuilles, on retire chaque branche
  sélectionnée.

`isQuestionAllowed(question, allowedLeafSet)` : vrai si `subcategoryId ?? categoryId`
∈ `allowedLeafSet` (ou si un ancêtre l'est).

### Défaut / Réinitialiser

- Défaut (après « ✨ Tout me va » ou bouton **Réinitialiser**) :
  `{ strategy: 'exclude', selected: [] }` ⇒ **toutes** les catégories.
- Stocké dans `preferencesStore` (Zustand + persistance MMKV).

---

## 4. Possession des decks

```ts
interface Ownership {
  ownedDeckIds: Set<string>;     // decks premium débloqués
  source: 'revenuecat' | 'stub';
  lastSyncedAt: string;
}
```

- Les decks `tier: 'free'` sont **toujours** possédés (pas dans `ownedDeckIds`,
  gérés par `isDeckOwned` qui court-circuite sur le tier).
- Les decks premium : source de vérité = **RevenueCat entitlements**
  (`services/purchases.ts`). Le store local n'est qu'un cache hydraté au démarrage
  et après chaque achat / « Restaurer ».
- 1 entitlement RevenueCat par deck (`deck_<id>`), OU 1 entitlement générique +
  `productIdentifier`. Décision à figer à la config RevenueCat.
- `restorePurchases()` obligatoire (review Apple) — bouton dans Réglages et sur
  l'écran d'achat.
- Un achat est **permanent** et rattaché au compte store ⇒ réinstallation OK,
  changement d'appareil OK (même compte), iOS↔Android OK si même app user id
  RevenueCat.

En dev : `EXPO_PUBLIC_PURCHASES_STUB=1` ⇒ les achats sont simulés et persistés
localement, sans store.

---

## 5. Construction du pool — `src/domain/questionPool.ts`

Fonction centrale :

```ts
function buildQuestionPool(input: {
  mode: GameMode;
  allQuestions: Question[];
  prefs: CategoryPreferences;
  tree: Category[];
  isDeckOwned: (deckId: string) => boolean;
}): Question[]
```

| Mode | Pool |
|------|------|
| `global` | questions des decks **possédés** (free + premium achetés) **∩** catégories autorisées par `prefs` |
| `deck` | **toutes** les questions du deck ciblé, si possédé (sinon → écran d'achat) — les prefs de catégories **ne s'appliquent pas** |
| `daily` (futur) | pool figé fourni par `daily/<date>.json` |
| `event` (futur) | pool fourni par la config de l'événement |

Détails mode `global` :
1. `owned = allQuestions.filter(q => isDeckOwned(q.deckId))`
2. `allowed = resolveAllowedCategories(prefs, tree)`
3. `pool = owned.filter(q => isQuestionAllowed(q, allowed))`
4. tri / échantillonnage par la couche session (difficulté progressive, éviter les
   questions récemment maîtrisées — cf. `mastery.ts`).

> Achat d'un deck premium dont la catégorie est dans les prefs ⇒ ses questions
> rejoignent **automatiquement** le pool global au prochain calcul. Rien à faire
> de plus.

---

## 6. Session de jeu & maîtrise — `src/domain/mastery.ts`

```ts
interface QuestionProgress {
  questionId: string;
  seen: number;
  correct: number;
  streak: number;          // bonnes réponses consécutives
  masteredAt?: string;     // maîtrisée quand streak >= MASTERY_STREAK
}
```

- `MASTERY_STREAK` dans `src/data/config.ts`.
- Sélection de session : privilégier les questions non vues > vues non maîtrisées,
  réinjecter les maîtrisées avec une faible probabilité (révision espacée simple).
- Score : voir `config.ts` (points par bonne réponse, bonus difficulté, bonus streak).
- Persisté dans `progressStore`.

---

## 7. Configuration produit — `src/data/config.ts`

Toutes les valeurs « ajustables sans réfléchir » au même endroit :

```ts
export const CONFIG = {
  FREE_DECK_COUNT: 6,          // decks marqués free livrés avec l'app
  PREMIUM_PRICE_DEFAULT: '1,99 €',
  DECK_QUESTION_MIN: 50,
  DECK_QUESTION_MAX: 200,
  SESSION_LENGTH: 10,          // questions par partie
  MASTERY_STREAK: 3,
  SCORE_BASE: 100,
  SCORE_DIFFICULTY_BONUS: 25,  // × (difficulty - 1)
  SCORE_STREAK_BONUS: 10,      // × streak
} as const;
```

`FREE_DECK_COUNT` est **indicatif/documentaire** : la vérité est le champ `tier`
de chaque deck dans `src/data/decks/`. Un test de garde vérifie que le nombre de
decks `free` == `FREE_DECK_COUNT` (échoue si on ajoute un deck free sans mettre à
jour la config).

---

## 8. Écrans (expo-router)

| Route | Écran | Notes |
|-------|-------|-------|
| `src/app/_layout.tsx` | Providers + garde onboarding | redirige vers `/onboarding` si non terminé |
| `src/app/onboarding/index.tsx` | **Bienvenue** — 3 boutons | « Je choisis ce que je veux » / « …ce que je ne veux pas » / « ✨ Tout me va » |
| `src/app/onboarding/categories.tsx` | Sélection catégories | mode include ou exclude selon le bouton ; **< 30 s** ; skippé si « Tout me va » |
| `src/app/index.tsx` | **JOUER** | liste des modes : 🌎 Global personnalisé + un item par deck possédé |
| `src/app/play/[mode].tsx` | Partie | barre de progression, question, réponses, feedback + haptics |
| `src/app/play/result.tsx` | Résultats | score, questions maîtrisées, rejouer, partager |
| `src/app/decks/index.tsx` | **📚 DECKS** | « Mes decks » (possédés) + « À découvrir » (premium non possédés) |
| `src/app/decks/[id].tsx` | Détail deck | nom, illustration, description, catégorie, nb questions, difficulté moy., statut ; aperçu de questions ; **[ ACHETER ]** ou **[ JOUER ]** |
| `src/app/settings/index.tsx` | ⚙️ Réglages | lien « Catégories du quiz », « Restaurer mes achats », thème, à propos |
| `src/app/settings/categories.tsx` | Éditeur de préférences | même composant que l'onboarding ; bouton **Réinitialiser** → toutes les catégories ; prise en compte immédiate |

Composant partagé `CategorySelector` (arbre, cases à cocher tri-état
parent/enfants) utilisé à la fois en onboarding et en réglages.

---

## 9. Première expérience (spec §12)

1. Splash → **Bienvenue dans GQuizz. Teste ta culture générale.**
2. **Comment veux-tu jouer ?** → 3 boutons.
3. Si « Tout me va » → direct à `JOUER`. Sinon → 1 écran de cases à cocher
   (catégories de niveau 1 seulement, « personnaliser » optionnel pour descendre).
4. **JOUER** immédiatement disponible. Objectif : < 30 s, aucune page de
   paramètres longue, aucun mur de paiement.

Flag `onboardingDone` dans le storage ⇒ conditionne la redirection racine.

---

## 10. Modèle économique — garde-fous (spec §9)

- Au moins **6 decks gratuits** (`FREE_DECK_COUNT`), soit plusieurs centaines de
  questions, couvrant les grandes catégories.
- Boucle principale (jouer, scorer, maîtriser) **100 % accessible en gratuit**.
- Les decks premium sont du **contenu spécialisé supplémentaire**, jamais un
  fragment indispensable. Test/checklist produit à la revue de contenu.
- Pas de pub interstitielle bloquante. Pas de timer d'énergie.

---

## 11. Évolutions prévues (le modèle les encaisse déjà)

| Évolution | Ce qui bouge |
|-----------|--------------|
| Daily Challenge | nouveau `GameMode` `daily` + fetch `daily/<date>.json` ; 0 changement au reste |
| Événements temporaires | `GameMode` `event` + config événement |
| Decks gratuits temporaires | champ `freeUntil?: string` sur `Deck` ; `isDeckOwned` le lit |
| Decks en promo | tag `promo` + `priceHint` ; prix réel géré par le store |
| Packs de decks | `Deck.tags` `pack:<id>` + un produit store « pack » qui débloque plusieurs entitlements (config RevenueCat) |
| Défis entre amis / classements | backend (Supabase) ; `src/domain/` inchangé, nouveaux `services/` |
| Comparaison à la moyenne | backend d'agrégation ; hydrate l'écran résultats |

---

## 12. Décisions à figer avant le build applicatif complet

- [ ] Nom de marque définitif (placeholder : **GQuizz**) + bundle id
      (`com.gonzaguebt.gquizz` ?).
- [ ] RevenueCat : 1 entitlement/deck vs entitlement générique.
- [ ] Contenu réel des 6 decks gratuits (rédaction des questions).
- [ ] Illustrations de decks (style, source).
- [ ] Palette / thème (réutiliser le violet de KtoQuizz ou identité propre).
