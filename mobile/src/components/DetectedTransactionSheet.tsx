import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '@/src/services/api';
import { listCategories, type Category } from '@/src/services/categories';
import { colors, radii, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/currency';

export interface PendingDetection {
  amount: number;
  merchant: string;
  paymentMethod: string;
  sourceApplication: string;
  timestamp: number;
  fingerprint?: string;
  type: string;
}

interface Props {
  detection: PendingDetection | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DetectedTransactionSheet({ detection, onClose, onSaved }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestedId, setSuggestedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!detection) return;
    listCategories().then(setCategories);
    apiRequest<{ category_id: string }>(
      `/api/v1/detection/suggest?merchant=${encodeURIComponent(detection.merchant)}`,
    )
      .then((s) => {
        setSuggestedId(s.category_id);
        setSelectedId(s.category_id);
      })
      .catch(() => {});
  }, [detection]);

  const handleSave = async () => {
    if (!detection || !selectedId) return;
    setError('');
    try {
      await apiRequest('/api/v1/detection/confirm', {
        method: 'POST',
        body: JSON.stringify({
          amount: detection.amount.toFixed(2),
          merchant: detection.merchant,
          transaction_type: detection.type,
          payment_method: detection.paymentMethod,
          source_application: detection.sourceApplication,
          transaction_date: new Date(detection.timestamp).toISOString(),
          fingerprint: detection.fingerprint,
          category_id: selectedId,
        }),
      });
      onSaved();
      onClose();
    } catch {
      setError('Could not save — may be a duplicate');
    }
  };

  if (!detection) return null;

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.amount}>{formatCurrency(detection.amount)}</Text>
          <Text style={styles.merchant}>{detection.merchant}</Text>
          <Text style={styles.suggested}>Suggested category</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.slice(0, 8).map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.chip,
                  selectedId === cat.id && styles.chipActive,
                  suggestedId === cat.id && styles.chipSuggested,
                ]}
                onPress={() => setSelectedId(cat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedId === cat.id && styles.chipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={styles.dismiss}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  amount: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
  },
  merchant: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  suggested: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
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
  chipSuggested: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  dismiss: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  error: {
    color: colors.negativeRed,
    ...typography.bodySm,
    marginTop: spacing.sm,
  },
});
