import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { getSubscriptions, syncSubscriptions, type Subscription } from '@/src/services/subscriptions';
import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

export default function SubscriptionsScreen() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const subs = await getSubscriptions();
      setItems(subs.filter((s) => s.status === 'ACTIVE'));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSync = async () => {
    setLoading(true);
    try {
      const subs = await syncSubscriptions();
      setItems(subs.filter((s) => s.status === 'ACTIVE'));
    } finally {
      setLoading(false);
    }
  };

  const monthlyTotal = items.reduce((sum, s) => sum + parseFloat(s.monthly_cost), 0);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Subscriptions</Text>
      <Text style={styles.subtitle}>
        Detected from recurring transactions
      </Text>

      <Pressable style={styles.syncBtn} onPress={handleSync}>
        <Text style={styles.syncText}>Detect Subscriptions</Text>
      </Pressable>

      {loading && <ActivityIndicator color={colors.primary} />}

      {!loading && items.length === 0 && (
        <EmptyState
          title="No subscriptions detected"
          message="Add recurring expenses or tap Detect to scan your transaction history."
        />
      )}

      {items.length > 0 && (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Monthly total</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(monthlyTotal)}</Text>
          </View>
          {items.map((sub) => (
            <View key={sub.id} style={styles.card}>
              <Text style={styles.name}>{sub.name}</Text>
              <Text style={styles.amount}>{formatCurrency(parseFloat(sub.amount))}</Text>
              <Text style={styles.cycle}>{sub.billing_cycle.toLowerCase()}</Text>
            </View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  syncBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  syncText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  summaryAmount: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  amount: {
    ...typography.bodyMd,
    color: colors.onSurface,
    marginTop: 4,
  },
  cycle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
