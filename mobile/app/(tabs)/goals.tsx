import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { colors, typography } from '@/src/theme';

export default function GoalsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Goals</Text>
      <Text style={styles.subtitle}>Budget and goals will load from the API.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
