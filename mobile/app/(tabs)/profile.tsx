import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radii, spacing, typography } from '@/src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Link href="/auto-tracking" asChild>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Automatic Tracking Settings</Text>
        </Pressable>
      </Link>

      <Link href="/subscriptions" asChild>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Subscriptions</Text>
        </Pressable>
      </Link>

      <Link href="/assistant" asChild>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>AI Assistant</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: 8,
  },
  email: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  menuItem: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  menuText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  logoutBtn: {
    marginTop: spacing.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    ...typography.labelMd,
    color: colors.negativeRed,
  },
});
