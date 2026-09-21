# Android Notification Detection

## Architecture

```
Payment App Notification
        ↓
MoneyFlowNotificationListenerService (Kotlin)
        ↓
FinancialNotificationDetector (filter promos/balance)
        ↓
ParserRegistry → GenericUpiParser (per-app extensible)
        ↓
TransactionFingerprint
        ↓
MoneyflowNotificationsModule → React Native event
        ↓
User confirmation UI → Backend API
```

## Privacy

- Parsing happens **locally on device**
- Production logs never include notification title/body
- Only structured fields emitted to JS layer

## Setup (Development Build Required)

1. `npx expo prebuild --platform android`
2. `npx expo run:android`
3. Open **Settings → Apps → Special access → Notification access**
4. Enable MoneyFlow

## Supported Apps (Initial)

- PhonePe, Google Pay, Paytm, BHIM
- Major bank apps (ICICI, SBI, Axis, HDFC PayZapp)

## Testing

### Unit tests (JUnit)

```bash
cd mobile/android
./gradlew :moneyflow-notifications:test
```

### Device testing checklist

- [ ] Grant notification access
- [ ] Make UPI payment in PhonePe/GPay
- [ ] Verify detection event in app
- [ ] Confirm 1-tap categorization works
- [ ] Verify promo notifications are ignored
- [ ] Test with app in background/killed state

## Known Limitations

- Parser formats change when apps update — maintain fixture tests
- Some banks send SMS only (no notification) — not captured
- iOS does not support this approach
