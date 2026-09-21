import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { FilterChip } from '@/src/components/FilterChip';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { TransactionRow } from '@/src/components/TransactionRow';
import { listTransactions, type Transaction } from '@/src/services/transactions';
import { colors, spacing, typography } from '@/src/theme';

const FILTERS = ['All', 'Expenses', 'Income', 'Transfers'] as const;

export default function ActivityScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const typeMap: Record<string, string | undefined> = {
        All: undefined,
        Expenses: 'EXPENSE',
        Income: 'INCOME',
        Transfers: 'TRANSFER',
      };
      const result = await listTransactions({
        type: typeMap[filter],
        page_size: 50,
      });
      setTransactions(result.items);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    if (!search) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) => t.merchant?.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q),
    );
  }, [transactions, search]);

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>Transactions</Text>

      <TextInput
        style={styles.search}
        placeholder="Search transactions..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={colors.onSurfaceVariant}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {FILTERS.map((f) => (
          <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No transactions"
          message="Once you add transactions, they will appear here."
        />
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              merchant={tx.merchant ?? 'Unknown'}
              subtitle={new Date(tx.transaction_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              amount={parseFloat(tx.amount)}
              type={tx.transaction_type}
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  search: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  chips: {
    marginBottom: spacing.md,
    maxHeight: 44,
  },
  list: {
    flex: 1,
  },
});
