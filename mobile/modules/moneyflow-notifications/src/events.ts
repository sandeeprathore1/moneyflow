import { EventEmitter, requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { DetectedTransaction } from './index';

const emitter =
  Platform.OS === 'android'
    ? new EventEmitter(requireNativeModule('MoneyflowNotifications'))
    : null;

export function addNotificationListener(
  listener: (event: DetectedTransaction) => void,
): { remove: () => void } {
  if (!emitter) {
    return { remove: () => {} };
  }
  const subscription = emitter.addListener('onTransactionDetected' as never, listener as never);
  return { remove: () => subscription.remove() };
}
