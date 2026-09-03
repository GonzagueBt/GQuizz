import type { Category } from './types';

/**
 * Vue arborescente sur une liste plate de catégories.
 * Profondeur libre : l'UI n'en montre que 2 niveaux mais rien ici ne le suppose.
 */
export class CategoryTree {
  private byId = new Map<string, Category>();
  private childrenOf = new Map<string | null, Category[]>();

  constructor(categories: Category[]) {
    for (const c of categories) {
      this.byId.set(c.id, c);
    }
    for (const c of categories) {
      const key = c.parentId;
      const list = this.childrenOf.get(key) ?? [];
      list.push(c);
      this.childrenOf.set(key, list);
    }
    for (const list of this.childrenOf.values()) {
      list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    }
  }

  get all(): Category[] {
    return [...this.byId.values()];
  }

  get(id: string): Category | undefined {
    return this.byId.get(id);
  }

  has(id: string): boolean {
    return this.byId.has(id);
  }

  /** Catégories racines (parentId === null), triées. */
  roots(): Category[] {
    return this.childrenOf.get(null) ?? [];
  }

  children(id: string): Category[] {
    return this.childrenOf.get(id) ?? [];
  }

  isLeaf(id: string): boolean {
    return this.children(id).length === 0;
  }

  /** Chemin racine → id inclus. Vide si l'id est inconnu. */
  path(id: string): Category[] {
    const out: Category[] = [];
    let current = this.byId.get(id);
    while (current) {
      out.unshift(current);
      current = current.parentId ? this.byId.get(current.parentId) : undefined;
    }
    return out;
  }

  /** id + tous ses descendants (DFS). */
  descendants(id: string): Category[] {
    const node = this.byId.get(id);
    if (!node) return [];
    const out: Category[] = [node];
    for (const child of this.children(id)) {
      out.push(...this.descendants(child.id));
    }
    return out;
  }

  /** Toutes les feuilles sous `id` (ou toutes les feuilles de l'arbre si omis). */
  leaves(id?: string): Category[] {
    const scope = id ? this.descendants(id) : this.all;
    return scope.filter((c) => this.isLeaf(c.id));
  }

  /** true si `ancestorId` est `id` lui-même ou un ancêtre de `id`. */
  isSelfOrAncestor(ancestorId: string, id: string): boolean {
    return this.path(id).some((c) => c.id === ancestorId);
  }
}
