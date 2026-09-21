package com.moneyflow.notifications.parser

import java.security.MessageDigest

object TransactionFingerprint {
    fun generate(
        merchant: String,
        amount: Double,
        timestampMs: Long,
        type: String,
        toleranceMinutes: Long = 5,
    ): String {
        val normalizedMerchant = merchant.lowercase().trim().replace(Regex("\\s+"), " ")
        val bucket = timestampMs / (toleranceMinutes * 60 * 1000)
        val raw = "$normalizedMerchant|$amount|$bucket|$type"
        val digest = MessageDigest.getInstance("SHA-256").digest(raw.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }.take(32)
    }
}
