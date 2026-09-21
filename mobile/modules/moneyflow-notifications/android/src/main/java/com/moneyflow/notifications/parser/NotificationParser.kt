package com.moneyflow.notifications.parser

interface NotificationParser {
    val packageNames: Set<String>
    fun parse(title: String, text: String): ParsedTransaction?
}
