import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

interface CategoryProgressCardProps {
  name: string;
  spent: number;
  limit: number;
  color?: string;
  overBudget?: boolean;
}

export function CategoryProgressCard({
  name,
  spent,
  limit,
  color = colors.primary,
  overBudget,
}: CategoryProgressCardProps) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = overBudget || spent > limit;

  return (
    <View style={[styles.card, isOver && styles.cardOver]}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={[styles.spent, isOver && { color: colors.negativeRed }]}>
          {formatCurrency(spent)}
        </Text>
      </View>
      <Text style={styles.limit}>of {formatCurrency(limit)}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: isOver ? colors.negativeRed : color },
          ]}
        />
      </View>
      {isOver && (
        <Text style={styles.overText}>
          {formatCurrency(spent - limit)} over budget
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardOver: {
    borderLeftWidth: 4,
    borderLeftColor: colors.negativeRed,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    ...typography.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
  },
  spent: {
    ...typography.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
  },
  limit: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  track: {
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
  overText: {
    ...typography.bodySm,
    color: colors.negativeRed,
    marginTop: spacing.xs,
  },
});
