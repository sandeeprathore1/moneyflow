import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/src/hooks/useAuth';
import { colors, radii, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MoneyFlow</Text>
      <Text style={styles.subtitle}>Sign in to track your spending</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>

      <Link href="/(auth)/register" style={styles.link}>
        <Text style={styles.linkText}>Create an account</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.headlineLg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.bodyMd,
  },
  button: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
  error: {
    color: colors.negativeRed,
    ...typography.bodySm,
    marginBottom: spacing.sm,
  },
  link: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    ...typography.labelMd,
  },
});
