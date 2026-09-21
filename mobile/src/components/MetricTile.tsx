import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/src/theme';

interface MetricTileProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function MetricTile({ label, value, valueColor = colors.onSurface }: MetricTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  label: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  value: {
    ...typography.headlineSm,
    fontSize: 16,
  },
});
