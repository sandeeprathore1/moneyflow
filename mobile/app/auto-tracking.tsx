import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { colors, radii, spacing, typography } from '@/src/theme';

export default function AutoTrackingScreen() {
  const [hasAccess, setHasAccess] = useState(false);
  const [packages, setPackages] = useState<string[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    try {
      const mod = require('moneyflow-notifications');
      setHasAccess(mod.hasNotificationAccess());
      setPackages(mod.getSupportedPackages());
    } catch {
      // Native module unavailable in Expo Go
    }
  }, []);

  const openSettings = () => {
    if (Platform.OS !== 'android') return;
    try {
      const mod = require('moneyflow-notifications');
      mod.openNotificationSettings();
    } catch {
      // unavailable
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Automatic Tracking</Text>

      {Platform.OS !== 'android' && (
        <Text style={styles.info}>
          Automatic transaction detection is available on Android only. On iOS, use manual entry
          or import.
        </Text>
      )}

      {Platform.OS === 'android' && (
        <>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Notification Access</Text>
            <Text style={[styles.statusValue, hasAccess ? styles.granted : styles.denied]}>
              {hasAccess ? 'Enabled' : 'Not enabled'}
            </Text>
          </View>

          <Text style={styles.privacy}>
            MoneyFlow parses payment notifications locally on your device. Raw notification content
            is never uploaded to our servers.
          </Text>

          {!hasAccess && (
            <Pressable style={styles.button} onPress={openSettings}>
              <Text style={styles.buttonText}>Enable Notification Access</Text>
            </Pressable>
          )}

          <Text style={styles.sectionTitle}>Supported Sources</Text>
          <ScrollView>
            {packages.map((pkg) => (
              <Text key={pkg} style={styles.packageItem}>{pkg}</Text>
            ))}
          </ScrollView>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  info: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  statusCard: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  statusLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  statusValue: {
    ...typography.headlineSm,
    marginTop: 4,
  },
  granted: {
    color: colors.positiveEmerald,
  },
  denied: {
    color: colors.negativeRed,
  },
  privacy: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
  sectionTitle: {
    ...typography.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  packageItem: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    paddingVertical: 4,
  },
});
