package com.moneyflow.notifications

import android.os.Handler
import android.os.Looper
import java.lang.ref.WeakReference

object TransactionEventEmitter {
    private var moduleRef: WeakReference<MoneyflowNotificationsModule>? = null

    fun setModule(module: MoneyflowNotificationsModule) {
        moduleRef = WeakReference(module)
    }

    fun emit(payload: Map<String, Any?>) {
        Handler(Looper.getMainLooper()).post {
            moduleRef?.get()?.emitTransaction(payload)
        }
    }
}
