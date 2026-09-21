package com.moneyflow.notifications

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.moneyflow.notifications.parser.ParserRegistry
import com.moneyflow.notifications.parser.TransactionFingerprint

class MoneyFlowNotificationListenerService : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        try {
            val extras = sbn.notification.extras
            val title = extras.getCharSequence("android.title")?.toString() ?: ""
            val text = extras.getCharSequence("android.text")?.toString() ?: ""
            val packageName = sbn.packageName

            val parsed = ParserRegistry.parse(packageName, title, text) ?: return

            val fingerprint = TransactionFingerprint.generate(
                parsed.merchant,
                parsed.amount,
                sbn.postTime,
                parsed.type,
            )

            TransactionEventEmitter.emit(
                mapOf(
                    "amount" to parsed.amount,
                    "merchant" to parsed.merchant,
                    "type" to parsed.type,
                    "paymentMethod" to parsed.paymentMethod,
                    "source" to "NOTIFICATION",
                    "sourceApplication" to packageName,
                    "packageName" to packageName,
                    "timestamp" to sbn.postTime,
                    "fingerprint" to fingerprint,
                    "reference" to parsed.reference,
                )
            )
        } catch (e: Exception) {
            Log.w(TAG, "Failed to process notification (package only logged)")
            Log.w(TAG, "Package: ${sbn.packageName}")
        }
    }

    companion object {
        private const val TAG = "MoneyFlowNLS"
    }
}
