import { TextStyle } from 'react-native';

export const typography = {
  headlineXl: {
    fontSize: 40,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontSize: 32,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 40,
    letterSpacing: -0.32,
  },
  headlineMd: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 32,
  },
  headlineSm: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  labelMd: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
} as const;
