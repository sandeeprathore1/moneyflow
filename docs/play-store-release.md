# Play Store Release Guide

## App Identity

- **Application ID:** `com.moneyflow.app`
- **App name:** MoneyFlow
- **Category:** Finance

## Build

```bash
cd mobile
npx eas build --platform android --profile production
```

## Data Safety

Declare the following:

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | No | Account authentication |
| Financial info (transactions) | Yes | No | Core app functionality |
| Device notifications (parsed locally) | Yes | No | Automatic expense detection |

**Notification access justification:** Core feature — MoneyFlow reads payment app notifications locally to detect UPI/bank transactions. Raw notification text is never uploaded.

## Required Assets

- App icon (1024×1024)
- Feature graphic (1024×500)
- Phone screenshots: Home, Activity, Analytics, Goals, Auto-tracking settings
- Privacy policy URL (see `docs/privacy-policy-template.md`)

## Release Steps

1. Create Google Play Developer account
2. Upload AAB from EAS build
3. Complete store listing and Data Safety
4. Submit for internal testing first
5. Promote to production after QA

## Do Not Publish Without

- Production API URL in `EXPO_PUBLIC_API_URL`
- Signed release keystore (managed by EAS)
- Privacy policy hosted at public URL
