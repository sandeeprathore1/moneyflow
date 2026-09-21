import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { askAssistant } from '@/src/services/ai';
import { colors, radii, spacing, typography } from '@/src/theme';

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What are my top spending categories?',
  'How do I compare to last month?',
];

export default function AssistantScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = async (q?: string) => {
    const text = (q ?? question).trim();
    if (!text) return;
    setLoading(true);
    setAnswer('');
    try {
      const resp = await askAssistant(text);
      setAnswer(resp.answer);
      setSources(resp.data_sources);
      setQuestion(text);
    } catch {
      setAnswer('Could not reach the assistant. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>AI Assistant</Text>
      <Text style={styles.subtitle}>
        Answers are grounded in your MoneyFlow data. Not investment advice.
      </Text>

      <View style={styles.chips}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => submit(s)}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ask about your spending..."
        placeholderTextColor={colors.onSurfaceVariant}
        value={question}
        onChangeText={setQuestion}
        onSubmitEditing={() => submit()}
      />

      <Pressable style={styles.btn} onPress={() => submit()} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.btnText}>Ask</Text>
        )}
      </Pressable>

      {answer && (
        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>AI Suggestion</Text>
          <Text style={styles.answer}>{answer}</Text>
          {sources.length > 0 && (
            <Text style={styles.sources}>Sources: {sources.join(', ')}</Text>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  chips: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm,
    borderRadius: radii.lg,
  },
  chipText: {
    ...typography.bodySm,
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  btnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  answerCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  answerLabel: {
    ...typography.labelSm,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  answer: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 22,
  },
  sources: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
  },
});
