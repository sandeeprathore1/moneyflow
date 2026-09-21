import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CategoryProgressCard } from '@/src/components/CategoryProgressCard';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { getBudget, type Budget } from '@/src/services/budgets';
import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

export default function GoalsScreen() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const b = await getBudget();
      setBudget(b);
    } catch {
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const monthLabel = budget
    ? new Date(budget.month).toLocaleDateString('en-IN', { month: 'long' })
    : new Date().toLocaleDateString('en-IN', { month: 'long' });

  return (
    <ScreenContainer>
      <Text style={styles.title}>Goals</Text>

      {loading && <ActivityIndicator color={colors.primary} />}

      {!loading && !budget && (
        <EmptyState
          title="No budget set"
          message="Set a monthly budget to track your spending goals."
        />
      )}

      {budget && (
        <>
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>TOTAL MONTHLY BUDGET</Text>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetAmount}>{formatCurrency(budget.total_amount)}</Text>
              <View style={styles.monthBadge}>
                <Text style={styles.monthText}>{monthLabel}</Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.spentLabel}>
                Spent: {formatCurrency(budget.spent_amount)}
              </Text>
              <Text style={styles.pctLabel}>{Math.round(budget.percentage_used)}%</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(budget.percentage_used, 100)}%`,
                    backgroundColor:
                      budget.percentage_used > 100 ? colors.negativeRed : colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.remaining}>
              Remaining: {formatCurrency(budget.remaining_amount)}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {budget.categories.map((cat) => (
            <CategoryProgressCard
              key={cat.category_id}
              name={cat.category_name}
              spent={parseFloat(cat.spent_amount)}
              limit={parseFloat(cat.limit_amount)}
              overBudget={cat.percentage_used > 100}
            />
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  budgetCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  budgetLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  budgetAmount: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  monthBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  monthText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  spentLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  pctLabel: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
  remaining: {
    ...typography.bodySm,
    color: colors.positiveEmerald,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
});
