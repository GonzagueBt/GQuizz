import { CategoryTree } from '../categoryTree';
import {
  defaultPreferences,
  hasAnyAllowed,
  isQuestionAllowed,
  resolveAllowedCategoryIds,
} from '../preferences';
import type { Category, CategoryPreferences } from '../types';

const cats: Category[] = [
  { id: 'sport', parentId: null, name: 'Sport', order: 1 },
  { id: 'sport.foot', parentId: 'sport', name: 'Foot', order: 1 },
  { id: 'sport.tennis', parentId: 'sport', name: 'Tennis', order: 2 },
  { id: 'musique', parentId: null, name: 'Musique', order: 2 },
  { id: 'musique.rock', parentId: 'musique', name: 'Rock', order: 1 },
];
const tree = new CategoryTree(cats);

const prefs = (p: Partial<CategoryPreferences>): CategoryPreferences => ({
  strategy: 'include',
  selected: [],
  version: 1,
  ...p,
});

describe('resolveAllowedCategoryIds — include', () => {
  it('expands a selected parent to its whole branch', () => {
    const allowed = resolveAllowedCategoryIds(prefs({ strategy: 'include', selected: ['sport'] }), tree);
    expect([...allowed].sort()).toEqual(['sport', 'sport.foot', 'sport.tennis'].sort());
  });

  it('keeps a selected leaf narrow', () => {
    const allowed = resolveAllowedCategoryIds(
      prefs({ strategy: 'include', selected: ['sport.foot'] }),
      tree,
    );
    expect([...allowed]).toEqual(['sport.foot']);
  });

  it('is empty when nothing is selected', () => {
    const allowed = resolveAllowedCategoryIds(prefs({ strategy: 'include', selected: [] }), tree);
    expect(allowed.size).toBe(0);
  });
});

describe('resolveAllowedCategoryIds — exclude', () => {
  it('removes a selected branch from the full tree', () => {
    const allowed = resolveAllowedCategoryIds(
      prefs({ strategy: 'exclude', selected: ['musique'] }),
      tree,
    );
    expect(allowed.has('musique')).toBe(false);
    expect(allowed.has('musique.rock')).toBe(false);
    expect(allowed.has('sport.foot')).toBe(true);
  });

  it('default preferences allow everything', () => {
    const allowed = resolveAllowedCategoryIds(defaultPreferences(), tree);
    expect(allowed.size).toBe(cats.length);
    expect(hasAnyAllowed(defaultPreferences(), tree)).toBe(true);
  });
});

describe('isQuestionAllowed', () => {
  const allowedFoot = resolveAllowedCategoryIds(
    prefs({ strategy: 'include', selected: ['sport.foot'] }),
    tree,
  );
  const allowedSport = resolveAllowedCategoryIds(
    prefs({ strategy: 'include', selected: ['sport'] }),
    tree,
  );

  it('matches on the exact subcategory', () => {
    expect(
      isQuestionAllowed({ categoryId: 'sport', subcategoryId: 'sport.foot' }, allowedFoot, tree),
    ).toBe(true);
  });

  it('rejects a sibling subcategory', () => {
    expect(
      isQuestionAllowed({ categoryId: 'sport', subcategoryId: 'sport.tennis' }, allowedFoot, tree),
    ).toBe(false);
  });

  it('allows a generically-tagged question when its parent branch is included', () => {
    expect(isQuestionAllowed({ categoryId: 'sport' }, allowedSport, tree)).toBe(true);
  });

  it('rejects a generic parent question when only a leaf is included', () => {
    expect(isQuestionAllowed({ categoryId: 'sport' }, allowedFoot, tree)).toBe(false);
  });
});
