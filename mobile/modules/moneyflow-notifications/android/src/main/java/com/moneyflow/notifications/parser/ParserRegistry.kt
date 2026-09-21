package com.moneyflow.notifications.parser

object ParserRegistry {
    private val parsers: List<NotificationParser> = listOf(GenericUpiParser())

    fun parse(packageName: String, title: String, text: String): ParsedTransaction? {
        if (!FinancialNotificationDetector.isPotentiallyFinancial(title, text)) {
            return null
        }
        val parser = parsers.find { it.packageNames.contains(packageName) } ?: parsers.first()
        return parser.parse(title, text)
    }

    fun supportedPackages(): List<String> =
        parsers.flatMap { it.packageNames }.distinct().sorted()
}
