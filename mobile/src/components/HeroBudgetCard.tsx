import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

interface HeroBudgetCardProps {
  spent: number;
  budget: number | null;
  percentageUsed: number | null;
  remaining: number | null;
}

export function HeroBudgetCard({ spent, budget, percentageUsed, remaining }: HeroBudgetCardProps) {
  const pct = percentageUsed ?? (budget ? (spent / budget) * 100 : 0);
  const budgetLabel = budget ? formatCurrency(budget) : 'No budget set';

  return (
    <LinearGradient
      colors={[colors.primaryContainer, colors.secondaryContainer, colors.accentCyan]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>MONTHLY SPENDING</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatCurrency(spent)}</Text>
            <Text style={styles.budgetText}>/ {budgetLabel} budget</Text>
          </View>
        </View>
        {budget && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{Math.round(pct)}% used</Text>
          </View>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {remaining !== null ? `${formatCurrency(remaining)} remaining` : 'Set a budget in Goals'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelSm,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: 4,
  },
  amount: {
    ...typography.headlineLg,
    color: colors.onPrimaryContainer,
    fontSize: 28,
  },
  budgetText: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeText: {
    ...typography.labelSm,
    color: colors.onPrimaryContainer,
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: radii.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    opacity: 0.9,
  },
});
