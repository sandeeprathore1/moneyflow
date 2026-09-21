import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { EmptyState } from '@/src/components/EmptyState';
import { FilterChip } from '@/src/components/FilterChip';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import {
  formatMonthParam,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  shiftMonth,
  type CategoryAnalytics,
  type MonthlyAnalytics,
} from '@/src/services/analytics';
import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

const CHART_COLORS = [colors.primary, colors.secondary, colors.accentCyan, '#943700', colors.outline];

function LineChart({ data }: { data: MonthlyAnalytics['trend'] }) {
  if (data.length < 2) return null;
  const values = data.map((d) => parseFloat(d.amount));
  const max = Math.max(...values, 1);
  const width = 300;
  const height = 100;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={`${pathD} L ${width},${height} L 0,${height} Z`} fill="url(#grad)" />
      <Path d={pathD} stroke={colors.primary} strokeWidth={2} fill="none" />
    </Svg>
  );
}

function DonutChart({ categories }: { categories: CategoryAnalytics['categories'] }) {
  const top = categories.slice(0, 5);
  const total = top.reduce((s, c) => s + parseFloat(c.amount), 0);
  if (total === 0) return null;

  let offset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <Svg width={100} height={100} viewBox="0 0 100 100">
      {top.map((cat, i) => {
        const pct = parseFloat(cat.amount) / total;
        const dash = pct * circumference;
        const circle = (
          <Circle
            key={cat.category_name}
            cx={50}
            cy={50}
            r={radius}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={12}
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += dash;
        return circle;
      })}
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'expenses' | 'income'>('expenses');
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const monthParam = formatMonthParam(selectedMonth);
  const monthLabel = selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        getMonthlyAnalytics(monthParam),
        getCategoryAnalytics(monthParam),
      ]);
      setMonthly(m);
      setCategories(c);
    } catch {
      setMonthly(null);
      setCategories(null);
    } finally {
      setLoading(false);
    }
  }, [monthParam]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const primaryAmount =
    viewMode === 'expenses'
      ? monthly?.total_spent
      : monthly?.total_income;

  return (
    <ScreenContainer>
      <View style={styles.monthRow}>
        <Pressable onPress={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}>
          <Text style={styles.monthNav}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{monthLabel}</Text>
        <Pressable onPress={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}>
          <Text style={styles.monthNav}>›</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        <FilterChip
          label="Expenses"
          active={viewMode === 'expenses'}
          onPress={() => setViewMode('expenses')}
        />
        <FilterChip
          label="Income"
          active={viewMode === 'income'}
          onPress={() => setViewMode('income')}
        />
      </View>

      {loading && <ActivityIndicator color={colors.primary} />}

      {!loading && monthly && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {viewMode === 'expenses' ? 'Total Spent' : 'Total Income'}
          </Text>
          <Text style={styles.cardAmount}>
            {formatCurrency(primaryAmount ?? '0')}
          </Text>
          {viewMode === 'expenses' && monthly.mom_change_percentage !== null && (
            <Text style={styles.mom}>
              {monthly.mom_change_percentage > 0 ? '+' : ''}
              {monthly.mom_change_percentage.toFixed(1)}% vs last month
            </Text>
          )}
          {viewMode === 'expenses' && (
            <>
              <Text style={styles.meta}>
                Avg daily: {formatCurrency(monthly.average_daily_spending)} · Savings rate:{' '}
                {monthly.savings_rate.toFixed(0)}%
              </Text>
              <LineChart data={monthly.trend} />
            </>
          )}
        </View>
      )}

      {!loading && monthly && viewMode === 'expenses' && monthly.top_merchants.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Top Merchants</Text>
          {monthly.top_merchants.slice(0, 5).map((m) => (
            <View key={m.merchant} style={styles.catRow}>
              <Text style={styles.catName}>{m.merchant}</Text>
              <Text style={styles.catAmount}>{formatCurrency(m.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {!loading && categories && categories.categories.length > 0 && viewMode === 'expenses' && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Category Breakdown</Text>
          <View style={styles.donutRow}>
            <DonutChart categories={categories.categories} />
            <View style={styles.legend}>
              {categories.categories.slice(0, 3).map((cat) => (
                <Text key={cat.category_name} style={styles.legendItem}>
                  {cat.category_name}: {formatCurrency(cat.amount)} ({cat.percentage.toFixed(0)}%)
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {!loading && !monthly && (
        <EmptyState title="No analytics yet" message="Add transactions to see spending trends." />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthNav: {
    fontSize: 28,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  chips: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  cardAmount: {
    ...typography.headlineLg,
    color: colors.onSurface,
    marginVertical: spacing.xs,
  },
  mom: {
    ...typography.bodySm,
    color: colors.negativeRed,
    marginBottom: spacing.sm,
  },
  meta: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  legend: { flex: 1 },
  legendItem: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  catName: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  catAmount: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
