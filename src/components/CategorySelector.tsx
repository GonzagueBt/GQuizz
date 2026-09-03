import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { CategoryTree } from '@/domain/categoryTree';
import type { Category, PreferenceStrategy } from '@/domain/types';
import { Text } from './Text';

interface Props {
  categories: Category[];
  strategy: PreferenceStrategy;
  selected: string[];
  onChange: (next: string[]) => void;
}

type NodeState = 'on' | 'off' | 'mixed';

/**
 * Sélecteur de catégories à 2 niveaux visibles (le modèle en autorise plus).
 * `selected` = ids cochés, à n'importe quel niveau (voir domain/preferences.ts).
 * En cochant une catégorie parent, on couvre toute la branche ; « Personnaliser »
 * bascule vers une sélection explicite des sous-catégories.
 */
export function CategorySelector({ categories, strategy, selected, onChange }: Props) {
  const { colors, spacing, radius } = useTheme();
  const tree = useMemo(() => new CategoryTree(categories), [categories]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const sel = useMemo(() => new Set(selected), [selected]);

  const toggle = (id: string) => {
    const next = new Set(sel);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const customize = (parent: Category) => {
    const next = new Set(sel);
    next.delete(parent.id);
    for (const child of tree.children(parent.id)) next.add(child.id);
    onChange([...next]);
    setExpanded((e) => new Set(e).add(parent.id));
  };

  const nodeState = (cat: Category): NodeState => {
    if (sel.has(cat.id)) return 'on';
    const children = tree.children(cat.id);
    if (children.length > 0 && children.some((c) => sel.has(c.id))) return 'mixed';
    return 'off';
  };

  const verb = strategy === 'include' ? 'inclure' : 'exclure';

  return (
    <View style={{ gap: spacing.sm }}>
      {tree.roots().map((cat) => {
        const state = nodeState(cat);
        const children = tree.children(cat.id);
        const isOpen = expanded.has(cat.id);
        return (
          <View
            key={cat.id}
            style={[styles.group, { borderColor: colors.border, borderRadius: radius.md }]}
          >
            <View style={styles.row}>
              <Checkbox state={state} onPress={() => toggle(cat.id)} label={`${verb} ${cat.name}`} />
              <Pressable style={styles.rowLabel} onPress={() => toggle(cat.id)}>
                <Text>{cat.emoji ? `${cat.emoji}  ` : ''}{cat.name}</Text>
              </Pressable>
              {children.length > 0 && (
                <Pressable
                  onPress={() =>
                    setExpanded((e) => {
                      const n = new Set(e);
                      if (n.has(cat.id)) n.delete(cat.id);
                      else n.add(cat.id);
                      return n;
                    })
                  }
                  hitSlop={8}
                  accessibilityLabel={isOpen ? 'Réduire' : 'Développer'}
                >
                  <Text muted>{isOpen ? '▾' : '▸'}</Text>
                </Pressable>
              )}
            </View>

            {isOpen && children.length > 0 && (
              <View style={{ paddingLeft: spacing.xl, gap: spacing.xs, paddingBottom: spacing.sm }}>
                {state === 'on' ? (
                  <Pressable onPress={() => customize(cat)}>
                    <Text variant="caption" color={colors.primary}>
                      Toute la catégorie est sélectionnée · Personnaliser les sous-catégories
                    </Text>
                  </Pressable>
                ) : (
                  children.map((child) => (
                    <View key={child.id} style={styles.row}>
                      <Checkbox
                        state={sel.has(child.id) ? 'on' : 'off'}
                        onPress={() => toggle(child.id)}
                        label={`${verb} ${child.name}`}
                      />
                      <Pressable style={styles.rowLabel} onPress={() => toggle(child.id)}>
                        <Text variant="label">
                          {child.emoji ? `${child.emoji}  ` : ''}
                          {child.name}
                        </Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function Checkbox({
  state,
  onPress,
  label,
}: {
  state: NodeState;
  onPress: () => void;
  label: string;
}) {
  const { colors, radius } = useTheme();
  const filled = state !== 'off';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: state === 'on' }}
      accessibilityLabel={label}
      hitSlop={8}
      style={[
        styles.checkbox,
        {
          borderRadius: radius.sm,
          borderColor: filled ? colors.primary : colors.border,
          backgroundColor: filled ? colors.primary : 'transparent',
        },
      ]}
    >
      <Text color={colors.primaryText} style={styles.checkMark}>
        {state === 'on' ? '✓' : state === 'mixed' ? '–' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowLabel: { flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 14, fontWeight: '800', lineHeight: 18 },
});
