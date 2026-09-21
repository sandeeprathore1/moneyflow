package com.moneyflow.notifications.parser

import java.util.regex.Pattern

class GenericUpiParser : NotificationParser {
    override val packageNames: Set<String> = setOf(
        "com.phonepe.app",
        "com.google.android.apps.nbu.paisa.user",
        "net.one97.paytm",
        "in.org.npci.upiapp",
        "com.csam.icici.bank.imobile",
        "com.sbi.lotusintouch",
        "com.axis.mobile",
        "com.hdfcbank.payzapp",
    )

    private val amountPattern = Pattern.compile(
        """(?:₹|rs\.?|inr)\s*([0-9,]+(?:\.[0-9]{1,2})?)""",
        Pattern.CASE_INSENSITIVE,
    )

    private val merchantPatterns = listOf(
        Pattern.compile("""(?:paid|sent|to)\s+(?:rs\.?|₹)?[0-9,.]+\s+(?:to\s+)?([A-Za-z0-9@.\s&'-]+?)(?:\s+on|\s+via|\s+using|\.|$)""", Pattern.CASE_INSENSITIVE),
        Pattern.compile("""(?:to|at)\s+([A-Za-z0-9@.\s&'-]{2,40})""", Pattern.CASE_INSENSITIVE),
    )

    override fun parse(title: String, text: String): ParsedTransaction? {
        val combined = "$title $text"
        val amountMatcher = amountPattern.matcher(combined)
        if (!amountMatcher.find()) return null

        val amount = amountMatcher.group(1)?.replace(",", "")?.toDoubleOrNull() ?: return null
        if (amount <= 0) return null

        var merchant = "Unknown"
        for (pattern in merchantPatterns) {
            val m = pattern.matcher(combined)
            if (m.find()) {
                merchant = m.group(1)?.trim()?.take(80) ?: merchant
                break
            }
        }

        val type = when {
            combined.contains("credited", ignoreCase = true) ||
                combined.contains("received", ignoreCase = true) -> "INCOME"
            combined.contains("refund", ignoreCase = true) -> "REFUND"
            else -> "EXPENSE"
        }

        val paymentMethod = when {
            combined.contains("upi", ignoreCase = true) -> "UPI"
            combined.contains("card", ignoreCase = true) -> "CARD"
            else -> "UPI"
        }

        return ParsedTransaction(amount, merchant, type, paymentMethod)
    }
}
