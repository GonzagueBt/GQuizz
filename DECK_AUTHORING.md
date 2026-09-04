# Règles de construction d'un deck GQuizz

Document vivant — on l'enrichit au fil des decks créés.
Premier deck de référence : **La Révolution française** (`src/data/decks/revolution-francaise.json`).

---

## 1. Où vit un deck

- Un fichier JSON : `src/data/decks/<slug>.json` (slug en kebab-case).
- Enregistré dans `src/data/decks/index.ts` (import + entrée dans `RAW_DECKS`).
  L'ordre du tableau = ordre d'affichage par défaut.
- `src/domain/mastery.ts` / `questionPool.ts` ne connaissent que les attributs des
  questions : rien à toucher côté logique quand on ajoute un deck.

## 2. Schéma d'un fichier de deck

```jsonc
{
  "id": "revolution-francaise",      // = slug du fichier
  "name": "La Révolution française",
  "description": "1789-1799 : …",    // 1 phrase, ~120 caractères max
  "emoji": "🇫🇷",
  "categoryId": "histoire",          // doit exister dans src/data/categories.ts
  "subcategoryId": "histoire.france",// idem (optionnel)
  "tier": "free",                    // "free" | "premium"
  "productId": "gquizz.deck.xxx",    // premium uniquement
  "priceHint": "1,99 €",             // premium uniquement (indicatif, le vrai prix vient du store)
  "questionCount": 150,              // = nombre réel de questions du tableau
  "averageDifficulty": 3,            // 1..5, moyenne arrondie
  "releasedAt": "2026-02-01",        // ISO
  "tags": ["nouveau"],              // optionnel : "nouveau", "promo", "pack:xxx"
  "questions": [ /* voir §3 */ ]
}
```

Le champ `deckId` des questions est **injecté au chargement** — ne pas le mettre
dans le JSON.

## 3. Schéma d'une question

```jsonc
{
  "id": "rf-001",                    // <préfixe>-<NNN> ; préfixe unique par deck, NNN sur 3 chiffres
  "categoryId": "histoire",
  "subcategoryId": "histoire.france",
  "difficulty": 2,                   // 1 (facile) … 5 (expert)
  "type": "single",                  // "single" (4 réponses) | "boolean" (Vrai/Faux)
  "prompt": "Question ?",
  "answers": [
    { "id": "a", "text": "…", "correct": true },
    { "id": "b", "text": "…", "correct": false },
    { "id": "c", "text": "…", "correct": false },
    { "id": "d", "text": "…", "correct": false }
  ],
  "explanation": "1 phrase de contexte."   // optionnel mais recommandé
}
```

Types `multiple` et `ordering` existent dans le modèle mais **ne sont pas encore
gérés par l'écran de jeu** — s'en tenir à `single` et `boolean`.

## 4. Règles de rédaction

### Structure du deck
- **Découper le sujet en sous-thèmes** et couvrir chacun. Pour un événement
  historique : causes → déroulement chronologique → acteurs → conséquences →
  symboles / héritage.
- Répartir les questions à peu près proportionnellement à l'importance de chaque
  sous-thème. Éviter de concentrer 40 questions sur un seul épisode.
- **Pas de quasi-doublons** : chaque question teste un fait distinct. Si deux
  questions ont la même réponse, l'une des deux dégage.

### Difficulté (viser cette répartition)
| Niveau | Part visée | Exemple |
|--------|-----------|---------|
| 1 | ~10 % | « En quelle année a lieu la prise de la Bastille ? » |
| 2 | ~25 % | « Qui compose *La Marseillaise* ? » |
| 3 | ~45 % | « Quelle loi de septembre 1793 permet d'arrêter tout “suspect” ? » |
| 4 | ~15 % | « Qui invente les noms des mois du calendrier républicain ? » |
| 5 | ~5 %  | anecdote pointue, citation exacte, date au jour près |

- Facile = fait ultra-connu, souvent « en quelle année ».
- Difficile = date exacte, nom propre secondaire, citation, chiffre précis.

### Réponses
- `single` : **exactement 4 réponses, une seule correcte**. C'est le type par défaut —
  **préférer `single` à `boolean`** sauf besoin explicite.
- `boolean` : à éviter en général (retour d'expérience : plus difficile à équilibrer —
  un premier jet a facilement 90 % de bonnes réponses sur le même côté « Vrai »,
  ce qui laisse deviner la réponse sans rien savoir). Si on en utilise malgré tout,
  vérifier après coup la répartition **Vrai correct / Faux correct** (viser du 50/50)
  et reformuler au négatif les questions qui penchent trop d'un côté.
- **Varier la position de la bonne réponse** (a/b/c/d) — ne pas toujours mettre `a`.
- Les mauvaises réponses (distracteurs) doivent être **plausibles** : même
  catégorie, même époque, même type d'entité. Un bon distracteur est une erreur
  qu'un joueur pourrait vraiment faire (ex. mauvaise date proche, personnage réel
  du même camp).
- Pas de piège sur la formulation. Pas de double négation. Pas de « toutes ces
  réponses ».

### Ton et forme
- Français, neutre, factuel. Pas d'humour dans l'énoncé.
- `prompt` : une seule question, se termine par `?` (sauf `boolean` = affirmation).
- `explanation` : **1 phrase**, apporte un complément (date précise, conséquence,
  précision) — pas une simple reformulation de la réponse.
- Guillemets français « … » dans le texte (jamais de `"` ASCII : casse le JSON).

### Exactitude
- **Source obligatoire** : partir d'une référence (Wikipédia FR de l'article
  principal + articles connexes pour les dates). Vérifier chaque date et chaque
  nom propre.
- En cas de fait débattu (chiffres de victimes, paternité d'une invention…),
  formuler prudemment (« environ », « selon les estimations ») ou choisir un autre
  angle.
- Noter la ou les pages sources dans le commit qui ajoute le deck.

## 5. Configuration & tests

- `tier: "free"` ⇒ incrémenter `CONFIG.FREE_DECK_COUNT` dans `src/data/config.ts`
  (un test de garde vérifie l'égalité).
- `tier: "premium"` ⇒ `productId` obligatoire + `questionCount` entre
  `DECK_QUESTION_MIN` (50) et `DECK_QUESTION_MAX` (200).
- `src/data/__tests__/catalog.test.ts` vérifie automatiquement : ids uniques,
  catégories existantes, une seule bonne réponse par `single`/`boolean`,
  ≥ 2 réponses, difficulté 1-5, `previewQuestionIds` valides.
- Lancer `npm test && npm run typecheck` avant de committer.

## 6. Checklist avant commit

- [ ] `questionCount` == `questions.length`
- [ ] Préfixe d'id unique, numérotation continue sans trou
- [ ] Répartition de difficulté proche de la cible
- [ ] Position des bonnes réponses variée
- [ ] Aucun quasi-doublon
- [ ] Tous les sous-thèmes couverts
- [ ] Dates et noms propres vérifiés sur la source
- [ ] `CONFIG.FREE_DECK_COUNT` à jour si deck gratuit
- [ ] `npm test`, `npm run typecheck`, `npm run lint` verts
