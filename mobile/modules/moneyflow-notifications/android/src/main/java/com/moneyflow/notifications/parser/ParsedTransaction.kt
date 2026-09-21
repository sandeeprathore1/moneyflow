package com.moneyflow.notifications.parser

data class ParsedTransaction(
    val amount: Double,
    val merchant: String,
    val type: String = "EXPENSE",
    val paymentMethod: String = "UPI",
    val reference: String? = null,
)
