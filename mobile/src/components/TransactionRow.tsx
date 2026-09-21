import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

interface TransactionRowProps {
  merchant: string;
  subtitle?: string;
  amount: number;
  type: string;
}

export function TransactionRow({ merchant, subtitle, amount, type }: TransactionRowProps) {
  const isIncome = type === 'INCOME';
  const amountColor = isIncome ? colors.positiveEmerald : colors.negativeRed;
  const prefix = isIncome ? '+' : '-';

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{merchant.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.merchant}>{merchant}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {prefix}{formatCurrency(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  merchant: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  amount: {
    ...typography.labelMd,
    fontWeight: '600',
  },
});
