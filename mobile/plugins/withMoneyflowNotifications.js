const {
  withAndroidManifest,
  AndroidConfig,
} = require('@expo/config-plugins');

const SERVICE_NAME = 'com.moneyflow.notifications.MoneyFlowNotificationListenerService';

function withMoneyflowNotifications(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const exists = mainApplication.service.some(
      (s) => s.$?.['android:name'] === SERVICE_NAME,
    );

    if (!exists) {
      mainApplication.service.push({
        $: {
          'android:name': SERVICE_NAME,
          'android:label': 'MoneyFlow Transaction Detection',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
}

module.exports = withMoneyflowNotifications;
