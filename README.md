# GQuizz 🧠

App mobile de quiz de culture générale — **iOS + Android** (Expo / React Native),
avec une **démo web**. Le contenu est organisé en **decks** de questions
(gratuits et premium) et un mode **🌎 Global personnalisé** qui mélange les
catégories choisies par le joueur.

> Placeholders assumés : nom de marque, bundle id, illustrations, contenu réel des
> decks. Voir `ARCHITECTURE.md` §12.

**Démo web jouable** (si le repo est public) : https://gonzaguebt.github.io/GQuizz/
— build SPA déployé par `.github/workflows/deploy-pages.yml` à chaque push sur `main`,
achats en mode stub.

## Démarrer

```bash
npm install
npm run start        # puis : i (iOS) · a (Android) · w (web)
```

En dev, les achats sont **simulés** (`EXPO_PUBLIC_PURCHASES_STUB=1`, cf. `.env.example`) :
on peut débloquer un deck premium sans passer par un store.

## Scripts

| Commande | Effet |
|----------|-------|
| `npm run start` | serveur de dev Expo |
| `npm test` | tests unitaires (logique métier + garde-fous du contenu) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config Expo) |
| `npm run export:web` | build web statique → `dist/` |

## Structure

```
src/
├── app/        écrans (routes expo-router)
├── domain/     logique métier pure, testée sans simulateur
├── data/       contenu embarqué (catégories, decks JSON, config produit)
├── store/      état Zustand + persistance locale
├── services/   storage, achats (RevenueCat / stub)
├── components/ UI réutilisable
└── theme/      jetons de thème
```

## Trois niveaux

- **🧠 Questions** — l'unité de jeu.
- **📚 Decks** — des ensembles thématiques (gratuits ou premium, achat permanent).
- **🌎 Modes** — `global` (mélange des catégories choisies × decks possédés) ou
  `deck` (un deck précis). `daily` / `event` sont prévus dans le modèle.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — modèle de données, modes, écrans, évolutions.
- [`../MOBILE_PROJECT_ARCHITECTURE.md`](../MOBILE_PROJECT_ARCHITECTURE.md) — stack & conventions communes aux apps mobiles.

## Build & publication

Voir `../MOBILE_PROJECT_ARCHITECTURE.md`. En résumé : EAS Build + EAS Submit pour
les stores ; un tag `vX.Y.Z` déclenche `.github/workflows/release.yml`.
Pas de backend, pas de VPS pour le cœur du jeu — uniquement pour d'éventuels
classements / défi du jour plus tard.
