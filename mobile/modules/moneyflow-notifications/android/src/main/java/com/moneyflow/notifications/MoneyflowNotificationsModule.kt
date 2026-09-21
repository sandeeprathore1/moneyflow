package com.moneyflow.notifications

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.moneyflow.notifications.parser.ParserRegistry

class MoneyflowNotificationsModule : Module() {
    fun emitTransaction(payload: Map<String, Any?>) {
        sendEvent("onTransactionDetected", payload)
    }

    override fun definition() = ModuleDefinition {
        Name("MoneyflowNotifications")

        Events("onTransactionDetected")

        OnCreate {
            TransactionEventEmitter.setModule(this@MoneyflowNotificationsModule)
        }

        Function("hasNotificationAccess") {
            val enabled = Settings.Secure.getString(
                appContext.reactContext?.contentResolver,
                "enabled_notification_listeners",
            ) ?: ""
            val component = ComponentName(
                appContext.reactContext!!.packageName,
                MoneyFlowNotificationListenerService::class.java.name,
            )
            enabled.contains(component.flattenToString())
        }

        Function("openNotificationSettings") {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            appContext.reactContext?.startActivity(intent)
        }

        Function("getSupportedPackages") {
            ParserRegistry.supportedPackages()
        }
    }
}
