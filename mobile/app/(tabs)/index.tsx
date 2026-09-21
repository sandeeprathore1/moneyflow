import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DetectedTransactionSheet,
  type PendingDetection,
} from '@/src/components/DetectedTransactionSheet';
import { EmptyState } from '@/src/components/EmptyState';
import { HeroBudgetCard } from '@/src/components/HeroBudgetCard';
import { MetricTile } from '@/src/components/MetricTile';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { TransactionRow } from '@/src/components/TransactionRow';
import { useAuth } from '@/src/hooks/useAuth';
import { getDashboard, type DashboardData } from '@/src/services/analytics';
import { getInsights, type Insight } from '@/src/services/ai';
import { colors, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

export default function HomeScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingDetection | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    try {
      const { addNotificationListener } = require('moneyflow-notifications');
      const sub = addNotificationListener((event: PendingDetection & { fingerprint?: string }) => {
        setPending({
          amount: event.amount,
          merchant: event.merchant,
          paymentMethod: event.paymentMethod,
          sourceApplication: event.sourceApplication,
          timestamp: event.timestamp,
          fingerprint: event.fingerprint,
          type: event.type,
        });
      });
      return () => sub.remove();
    } catch {
      return undefined;
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboard, insightList] = await Promise.all([getDashboard(), getInsights()]);
      setData(dashboard);
      setInsights(insightList);
    } catch {
      setError('Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const name = user?.profile?.display_name ?? user?.email?.split('@')[0] ?? 'there';
  const monthLabel = data
    ? new Date(data.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.month}>{monthLabel}</Text>
          <Text style={styles.greeting}>Good morning, {name}</Text>
        </View>
        <Link href="/add-expense" asChild>
          <Pressable style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </Link>
      </View>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}

      {error && !loading && (
        <EmptyState title="Couldn't sync" message={error} />
      )}

      {data && !loading && (
        <>
          <HeroBudgetCard
            spent={parseFloat(data.budget_spent)}
            budget={data.budget_total ? parseFloat(data.budget_total) : null}
            percentageUsed={data.budget_percentage_used}
            remaining={data.budget_remaining ? parseFloat(data.budget_remaining) : null}
          />

          <View style={styles.metrics}>
            <MetricTile
              label="Income"
              value={formatCurrency(data.total_income)}
              valueColor={colors.positiveEmerald}
            />
            <MetricTile label="Spent" value={formatCurrency(data.total_expenses)} />
            <MetricTile
              label="Saved"
              value={formatCurrency(data.total_saved)}
              valueColor={colors.secondary}
            />
          </View>

          {insights.length > 0 && (
            <View style={styles.insightBanner}>
              <Text style={styles.insightLabel}>{insights[0].label}</Text>
              <Text style={styles.insightText}>{insights[0].message}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Top Categories</Text>
          {data.top_categories.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              message="Add your first transaction to see spending insights."
            />
          ) : (
            data.top_categories.map((cat) => (
              <View key={cat.category_name} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat.category_name}</Text>
                <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
              </View>
            ))
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>
          {data.recent_transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              merchant={tx.merchant ?? 'Unknown'}
              subtitle={tx.category_name ?? undefined}
              amount={parseFloat(tx.amount)}
              type={tx.transaction_type}
            />
          ))}
        </>
      )}
      <DetectedTransactionSheet
        detection={pending}
        onClose={() => setPending(null)}
        onSaved={load}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  month: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  greeting: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.onPrimary,
    fontSize: 24,
    lineHeight: 28,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  insightBanner: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  insightLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginBottom: 4,
  },
  insightText: {
    ...typography.bodySm,
    color: colors.onSurface,
  },
  sectionTitle: {
    ...typography.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  categoryName: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  categoryAmount: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
});
