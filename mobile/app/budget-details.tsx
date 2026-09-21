import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CategoryProgressCard } from '@/src/components/CategoryProgressCard';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { getBudget, type Budget } from '@/src/services/budgets';
import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

export default function BudgetDetailsScreen() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBudget(await getBudget());
    } catch {
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <ScreenContainer><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  if (!budget) {
    return (
      <ScreenContainer>
        <EmptyState title="No budget" message="Set a monthly budget to see details." />
      </ScreenContainer>
    );
  }

  const monthLabel = new Date(budget.month).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScreenContainer>
      <Text style={styles.title}>Budget Details</Text>
      <Text style={styles.month}>{monthLabel}</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total budget</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(budget.total_amount)}</Text>
        <Text style={styles.meta}>
          Spent {formatCurrency(budget.spent_amount)} · {Math.round(budget.percentage_used)}% used
        </Text>
        <Text style={styles.meta}>
          Remaining {formatCurrency(budget.remaining_amount)}
        </Text>
        {budget.projected_month_end_spending && (
          <Text style={styles.projected}>
            Projected month-end: {formatCurrency(budget.projected_month_end_spending)}
          </Text>
        )}
      </View>

      <Text style={styles.section}>Category Limits</Text>
      {budget.categories.map((cat) => (
        <CategoryProgressCard
          key={cat.category_id}
          name={cat.category_name}
          spent={parseFloat(cat.spent_amount)}
          limit={parseFloat(cat.limit_amount)}
          overBudget={cat.percentage_used > 100}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineMd, color: colors.onSurface },
  month: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  summary: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  summaryAmount: { ...typography.headlineLg, color: colors.onSurface, marginVertical: spacing.xs },
  meta: { ...typography.bodySm, color: colors.onSurfaceVariant },
  projected: {
    ...typography.bodySm,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  section: {
    ...typography.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
});
