import { CategoryTree } from '../categoryTree';
import type { Category } from '../types';

const cats: Category[] = [
  { id: 'a', parentId: null, name: 'A', order: 2 },
  { id: 'b', parentId: null, name: 'B', order: 1 },
  { id: 'a.1', parentId: 'a', name: 'A1', order: 1 },
  { id: 'a.2', parentId: 'a', name: 'A2', order: 2 },
  { id: 'a.1.x', parentId: 'a.1', name: 'A1X', order: 1 },
];

describe('CategoryTree', () => {
  const tree = new CategoryTree(cats);

  it('orders roots by `order`', () => {
    expect(tree.roots().map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('lists direct children only', () => {
    expect(tree.children('a').map((c) => c.id)).toEqual(['a.1', 'a.2']);
  });

  it('builds the path from root to node', () => {
    expect(tree.path('a.1.x').map((c) => c.id)).toEqual(['a', 'a.1', 'a.1.x']);
  });

  it('collects descendants (self included)', () => {
    expect(tree.descendants('a').map((c) => c.id).sort()).toEqual(
      ['a', 'a.1', 'a.1.x', 'a.2'].sort(),
    );
  });

  it('finds leaves under a node', () => {
    expect(tree.leaves('a').map((c) => c.id).sort()).toEqual(['a.1.x', 'a.2']);
  });

  it('detects ancestor relationship', () => {
    expect(tree.isSelfOrAncestor('a', 'a.1.x')).toBe(true);
    expect(tree.isSelfOrAncestor('b', 'a.1.x')).toBe(false);
    expect(tree.isSelfOrAncestor('a.1.x', 'a.1.x')).toBe(true);
  });

  it('returns empty path for unknown id', () => {
    expect(tree.path('nope')).toEqual([]);
  });
});
