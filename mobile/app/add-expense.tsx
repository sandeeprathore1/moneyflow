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

import { listCategories, type Category } from '@/src/services/categories';
import { createTransaction } from '@/src/services/transactions';
import { colors, radii, spacing, typography } from '@/src/theme';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [merchant, setMerchant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSave = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!selectedCategory) {
      setError('Select a category');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createTransaction({
        amount: value.toFixed(2),
        merchant: merchant || undefined,
        category_id: selectedCategory,
        transaction_type: 'EXPENSE',
        payment_method: 'UPI',
        transaction_date: new Date().toISOString(),
      });
      router.back();
    } catch {
      setError('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.amountInput}
        placeholder="0"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        autoFocus
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.id && styles.chipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Merchant (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Swiggy"
        value={merchant}
        onChangeText={setMerchant}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.saveText}>Save</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  amountInput: {
    ...typography.headlineXl,
    color: colors.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    padding: spacing.md,
    ...typography.bodyMd,
  },
  chips: {
    maxHeight: 44,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  error: {
    color: colors.negativeRed,
    ...typography.bodySm,
    marginTop: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
