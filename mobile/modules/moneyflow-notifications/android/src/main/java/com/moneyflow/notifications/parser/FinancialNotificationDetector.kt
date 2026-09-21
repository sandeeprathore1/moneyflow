package com.moneyflow.notifications.parser

object FinancialNotificationDetector {
    private val promoKeywords = listOf(
        "offer", "cashback", "sale", "discount", "loan", "credit card offer",
        "reminder", "due date", "bill reminder", "promotional", "win ",
        "congratulations", "avail now", "apply now", "pre-approved",
    )

    private val balanceKeywords = listOf(
        "available balance", "account balance", "avl bal", "a/c bal",
        "balance in your", "current balance",
    )

    fun isPotentiallyFinancial(title: String, text: String): Boolean {
        val combined = "$title $text".lowercase()
        if (!combined.contains("₹") && !combined.contains("rs") && !combined.contains("inr")) {
            return false
        }
        if (promoKeywords.any { combined.contains(it) }) return false
        if (balanceKeywords.any { combined.contains(it) } && !combined.contains("debited") &&
            !combined.contains("paid") && !combined.contains("sent")
        ) {
            return false
        }
        return combined.contains("paid") || combined.contains("debited") ||
            combined.contains("sent") || combined.contains("received") ||
            combined.contains("credited") || combined.contains("payment successful") ||
            combined.contains("upi")
    }
}
