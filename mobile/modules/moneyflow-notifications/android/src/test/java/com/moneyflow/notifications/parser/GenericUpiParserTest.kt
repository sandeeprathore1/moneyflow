package com.moneyflow.notifications.parser

import org.junit.Assert.*
import org.junit.Test

class GenericUpiParserTest {
    private val parser = GenericUpiParser()

    @Test
    fun parse_phonepe_payment() {
        val result = parser.parse(
            "PhonePe",
            "Payment of Rs 850 to Swiggy was successful",
        )
        assertNotNull(result)
        assertEquals(850.0, result!!.amount, 0.01)
        assertTrue(result.merchant.contains("Swiggy", ignoreCase = true))
        assertEquals("EXPENSE", result.type)
    }

    @Test
    fun parse_google_pay() {
        val result = parser.parse(
            "GPay",
            "You paid ₹1,299 to Amazon",
        )
        assertNotNull(result)
        assertEquals(1299.0, result!!.amount, 0.01)
    }

    @Test
    fun parse_credit_income() {
        val result = parser.parse(
            "Bank",
            "₹1,50,000 credited to your account",
        )
        assertNotNull(result)
        assertEquals("INCOME", result!!.type)
    }

    @Test
    fun reject_promo_notification() {
        val isFinancial = FinancialNotificationDetector.isPotentiallyFinancial(
            "Offer",
            "Get 50% cashback on your next purchase ₹500",
        )
        assertFalse(isFinancial)
    }

    @Test
    fun reject_balance_only() {
        val isFinancial = FinancialNotificationDetector.isPotentiallyFinancial(
            "Bank",
            "Available balance in your account is ₹25,000",
        )
        assertFalse(isFinancial)
    }

    @Test
    fun fingerprint_consistency() {
        val fp1 = TransactionFingerprint.generate("Swiggy", 850.0, 1000000L, "EXPENSE")
        val fp2 = TransactionFingerprint.generate("swiggy", 850.0, 1000000L + 60000, "EXPENSE")
        assertEquals(fp1, fp2)
    }
}
