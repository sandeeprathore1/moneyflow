import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { colors, typography } from '@/src/theme';

export default function ProfileScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Settings and account management.</Text>
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
