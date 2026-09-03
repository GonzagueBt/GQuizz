# GQuizz — notes pour agents

App mobile Expo (React Native), iOS + Android + démo web. Quiz de culture générale
organisé en **decks** (gratuits / premium), avec un mode **Global personnalisé**.

## Docs à lire avant de coder

- `ARCHITECTURE.md` (racine du projet) — modèle de données, modes, écrans, config produit.
- `../MOBILE_PROJECT_ARCHITECTURE.md` — stack, conventions, build/deploy, GitHub.
- Expo a beaucoup changé : consulter https://docs.expo.dev/versions/v57.0.0/ avant d'écrire du code natif.

## Règles

- `src/domain/` = logique métier **pure**. Aucun import de `react-native`, `expo-*` ou d'un store.
  C'est testé sans simulateur (`npm test`).
- `src/app/` = **écrans uniquement** (routes expo-router). Toute logique va dans `src/`.
- Le contenu (catégories, decks, questions) vit dans `src/data/`. Un deck = un JSON.
- Les achats passent par `src/services/purchases.ts` (stub en dev, RevenueCat en prod).
  La possession réelle est côté store — le local n'est qu'un cache.
- Avant de committer : `npm run lint && npm run typecheck && npm test`.

## Commandes

```bash
npm run start        # i / a / w
npm test
npm run typecheck
npm run export:web   # build web statique -> dist/
```
