import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/src/hooks/useAuth';
import { listCategories, type Category } from '@/src/services/categories';
import { completeOnboarding } from '@/src/services/onboarding';
import { colors, radii, spacing, typography } from '@/src/theme';

const STEPS = ['Income', 'Salary Day', 'Budget', 'Categories'];

export default function OnboardingScreen() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState('');
  const [salaryDay, setSalaryDay] = useState('1');
  const [budget, setBudget] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listCategories()
      .then((cats) => {
        const defaults = cats.filter((c) =>
          ['food', 'groceries', 'transport'].includes(c.slug),
        );
        setCategories(defaults);
        const initial: Record<string, string> = {};
        defaults.forEach((c) => {
          initial[c.id] = c.slug === 'food' ? '10000' : c.slug === 'groceries' ? '8000' : '5000';
        });
        setLimits(initial);
      })
      .catch(() => setCategories([]));
  }, []);

  const finish = async () => {
    setLoading(true);
    setError('');
    try {
      await completeOnboarding({
        monthly_income: income,
        salary_day: parseInt(salaryDay, 10),
        currency: 'INR',
        total_budget: budget,
        category_limits: Object.entries(limits).map(([category_id, limit_amount]) => ({
          category_id,
          limit_amount,
        })),
      });
      await refreshUser();
      router.replace('/(tabs)');
    } catch {
      setError('Could not complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome to MoneyFlow</Text>
      <Text style={styles.stepLabel}>
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </Text>

      {step === 0 && (
        <View>
          <Text style={styles.label}>Monthly income (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="100000"
            value={income}
            onChangeText={setIncome}
          />
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.label}>Salary day of month (1–31)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="1"
            value={salaryDay}
            onChangeText={setSalaryDay}
          />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Total monthly budget (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="50000"
            value={budget}
            onChangeText={setBudget}
          />
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.label}>Category limits</Text>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.catRow}>
              <Text style={styles.catName}>{cat.name}</Text>
              <TextInput
                style={styles.catInput}
                keyboardType="numeric"
                value={limits[cat.id] ?? ''}
                onChangeText={(v) => setLimits((prev) => ({ ...prev, [cat.id]: v }))}
              />
            </View>
          ))}
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.btn} onPress={next} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.btnText}>{step === STEPS.length - 1 ? 'Finish' : 'Continue'}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.headlineMd, color: colors.primary, marginBottom: spacing.sm },
  stepLabel: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  label: { ...typography.labelMd, color: colors.onSurface, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...typography.bodyMd,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  catName: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  catInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    padding: spacing.sm,
    width: 120,
    textAlign: 'right',
  },
  btn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnText: { ...typography.labelMd, color: colors.onPrimary, fontWeight: '600' },
  error: { color: colors.negativeRed, marginBottom: spacing.sm },
});
