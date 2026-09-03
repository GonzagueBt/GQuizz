import type { CategoryTree } from './categoryTree';
import type { CategoryPreferences, Question } from './types';

export const PREFERENCES_VERSION = 1;

/** Défaut = toutes les catégories (stratégie "exclude" avec rien d'exclu). */
export function defaultPreferences(): CategoryPreferences {
  return { strategy: 'exclude', selected: [], version: PREFERENCES_VERSION };
}

/**
 * Ensemble des ids de catégories (n'importe quel niveau) dont les questions
 * sont autorisées par les préférences.
 *
 * - include : chaque id sélectionné autorise ce nœud + tous ses descendants.
 * - exclude : on part de tout l'arbre et on retire chaque branche sélectionnée.
 */
export function resolveAllowedCategoryIds(
  prefs: CategoryPreferences,
  tree: CategoryTree,
): Set<string> {
  const branch = (id: string) => tree.descendants(id).map((c) => c.id);

  if (prefs.strategy === 'include') {
    const allowed = new Set<string>();
    for (const id of prefs.selected) {
      for (const descId of branch(id)) allowed.add(descId);
    }
    return allowed;
  }

  // exclude
  const allowed = new Set(tree.all.map((c) => c.id));
  for (const id of prefs.selected) {
    for (const descId of branch(id)) allowed.delete(descId);
  }
  return allowed;
}

/**
 * Une question est autorisée si sa catégorie effective (sous-catégorie sinon
 * catégorie) est autorisée, ou si l'un de ses ancêtres l'est — ce qui gère les
 * questions taguées à un niveau générique.
 */
export function isQuestionAllowed(
  question: Pick<Question, 'categoryId' | 'subcategoryId'>,
  allowed: Set<string>,
  tree: CategoryTree,
): boolean {
  const leafId = question.subcategoryId ?? question.categoryId;
  if (allowed.has(leafId)) return true;
  return tree.path(leafId).some((c) => allowed.has(c.id));
}

/** true si les préférences autorisent au moins une catégorie. */
export function hasAnyAllowed(prefs: CategoryPreferences, tree: CategoryTree): boolean {
  return resolveAllowedCategoryIds(prefs, tree).size > 0;
}
