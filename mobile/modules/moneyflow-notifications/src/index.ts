import { NativeModule, requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export interface DetectedTransaction {
  amount: number;
  merchant: string;
  type: 'EXPENSE' | 'INCOME' | 'REFUND';
  paymentMethod: string;
  source: 'NOTIFICATION';
  sourceApplication: string;
  packageName: string;
  timestamp: number;
  reference?: string;
}

export interface NotificationPermissionStatus {
  granted: boolean;
}

declare class MoneyflowNotificationsModule extends NativeModule {
  hasNotificationAccess(): boolean;
  openNotificationSettings(): void;
  getSupportedPackages(): string[];
}

const NativeNotifications =
  Platform.OS === 'android'
    ? requireNativeModule<MoneyflowNotificationsModule>('MoneyflowNotifications')
    : null;

export function hasNotificationAccess(): boolean {
  return NativeNotifications?.hasNotificationAccess() ?? false;
}

export function openNotificationSettings(): void {
  NativeNotifications?.openNotificationSettings();
}

export function getSupportedPackages(): string[] {
  return NativeNotifications?.getSupportedPackages() ?? [];
}

export { addNotificationListener } from './events';
