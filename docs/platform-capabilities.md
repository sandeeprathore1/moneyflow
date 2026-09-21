# Platform Capabilities & Policy Constraints

> Research snapshot as of 2026. Verify against current Google Play and Apple developer documentation before release.

## Android — Notification Access

### Capability
- `NotificationListenerService` can receive notifications from apps that post to the system shade.
- Requires user grant via **Settings → Apps → Special access → Notification access** (not a standard runtime permission dialog).
- Works on Android 10+ without SMS permissions.
- Can run in background/terminated state with headless JS (Expo dev build required).

### Google Play Policy
- Notification access is a **restricted/sensitive capability**.
- Must be **core functionality** of the app — expense auto-detection qualifies for MoneyFlow.
- Must disclose in Play Console **Data Safety** form what is collected and why.
- Must not use notification content for advertising or unrelated purposes.
- Must not exfiltrate OTPs, unrelated messages, or full notification dumps.

### MoneyFlow Compliance Approach
1. Parse notifications **locally on device** in Kotlin.
2. Emit only structured fields: amount, merchant, type, payment method, timestamp, source app package.
3. Never upload raw notification title/body to backend by default.
4. In-app disclosure before enabling notification access.
5. Allow user to disable automatic tracking at any time.
6. Sanitize production logs — no full notification text.

---

## Android — SMS Permissions

### Policy (2025–2026)
- `READ_SMS`, `RECEIVE_SMS`, and related permissions are **restricted**.
- Default handler (SMS app) or approved narrow use cases required.
- "SMS-based financial transactions" is a declared use case for some apps (e.g., legacy expense trackers) but requires Play Console declaration and review.
- Google explicitly discourages using alternative APIs to derive SMS data without permission.

### MoneyFlow Decision
- **Do NOT request SMS permissions for MVP.**
- Primary ingestion: notification listener.
- Future: optional user-initiated SMS import (share sheet / manual paste) without `READ_SMS`.

---

## iOS — Notification & Financial Data

### Limitations
- **No public API** for third-party apps to read notifications from other apps.
- OTP AutoFill is scoped to verification codes only — apps never see message content.
- `expo-notifications` handles **push to your app**, not other apps' notifications.

### Available Paths (future)
| Method | MVP | Notes |
|--------|-----|-------|
| Manual entry | Yes | Full feature parity for tracking |
| Share sheet / paste import | Later | User-initiated |
| FinanceKit | Later | Apple entitlement; limited bank scope |
| Open banking / aggregation APIs | Later | Partner-dependent |
| Email forwarding | Later | User opt-in |

### MoneyFlow iOS MVP
- Complete manual expense tracking, budgets, analytics, goals.
- Settings screen explaining platform limitation and manual-first workflow.
- Architecture: `TransactionSource` abstraction with `ManualTransactionSource` on iOS.

---

## React Native + Expo

### Requirements
- **Expo SDK 54+** with **development builds** (`npx expo run:android`, EAS Build).
- **Expo Go is insufficient** for `NotificationListenerService`.
- Custom Expo native module in `mobile/modules/moneyflow-notifications/`.
- Config plugin injects manifest service declaration.
- Headless listener registered at app entry for background capture.

### Testing
- Parser unit tests: JUnit on Android module (no device required).
- Integration: physical device or emulator with notification access granted.
- Release builds may behave differently from debug for notification launch — test both.

---

## Google Play — Financial Apps

- Accurate **Data Safety** section (financial info, personal info).
- Privacy policy URL required.
- Account deletion mechanism required.
- No misleading claims about guaranteed savings or investment advice.
- Sensitive permissions justification text for notification access.

---

## Apple App Store — Financial Apps

- Privacy nutrition labels.
- `NSFinancialDataUsageDescription` if using FinanceKit (future).
- No false claims about automatic transaction detection on iOS.
- Export compliance and encryption documentation as needed.

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Play rejects notification access | High | Core feature justification, local-only parsing, clear UX |
| Parser format changes | High | Configurable parsers + fixture tests |
| iOS user expectation gap | Medium | Honest onboarding copy |
| Battery concerns | Low | Filter irrelevant notifications early in native layer |
| OTP exposure in logs | Critical | Never log notification body; strip OTP patterns |
