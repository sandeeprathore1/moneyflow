# MoneyFlow System Architecture

## Overview

MoneyFlow is a **modular monolith**: one FastAPI deployable with clear internal module boundaries, plus a React Native (Expo) mobile client and a custom Android native module for notification-based transaction detection.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile (Expo RN)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Screens  │ │  Store   │ │ API Cli  │ │ Offline Sync Queue   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┬───────────┘ │
│       │            │            │                   │              │
│  ┌────┴────────────┴────────────┴───────────────────┴──────────┐ │
│  │              moneyflow-notifications (Kotlin)                  │ │
│  │  NotificationListener → Detector → Parser → Normalizer        │ │
│  └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / REST
┌───────────────────────────────┴─────────────────────────────────┐
│                     FastAPI Modular Monolith                      │
│  ┌──────┐ ┌────────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐ │
│  │ auth │ │transactions│ │ budgets │ │analytics│ │     ai     │ │
│  └──────┘ └────────────┘ └─────────┘ └─────────┘ └────────────┘ │
│  ┌──────────┐ ┌─────────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │categories│ │subscriptions│ │  goals   │ │ recurring       │ │
│  └──────────┘ └─────────────┘ └──────────┘ └─────────────────┘ │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
         ┌──────┴──────┐               ┌──────┴──────┐
         │ PostgreSQL  │               │    Redis    │
         │ (source of  │               │ cache/rate  │
         │   truth)    │               │   limit     │
         └─────────────┘               └─────────────┘
```

## Transaction Ingestion Abstraction

```python
class TransactionSource(Protocol):
    def ingest(self, raw: RawEvent) -> DetectedTransaction: ...

# Implementations
NotificationTransactionSource  # Android native bridge
ManualTransactionSource        # User form / iOS primary
ImportTransactionSource        # CSV/share (future)
BankTransactionSource          # Aggregation (future)
```

### Android Flow
1. Payment app posts notification.
2. `MoneyFlowNotificationListenerService` receives event.
3. `FinancialNotificationDetector` filters non-financial notifications.
4. `NotificationParser` (per-app config) extracts amount, merchant, type.
5. `TransactionNormalizer` produces canonical `DetectedTransaction`.
6. `TransactionFingerprint` computed for dedup.
7. Event emitted to RN; stored in local queue if offline.
8. User confirms category in 1-tap UI.
9. Structured transaction POSTed to backend.

### iOS Flow
1. User adds expense manually or confirms imported entry.
2. Same backend APIs and categorization engine apply.

## Backend Module Boundaries

| Module | Responsibility |
|--------|----------------|
| `auth` | Register, login, JWT access/refresh, password hashing |
| `users` | Profile, preferences, salary, currency |
| `transactions` | CRUD, filters, dedup, confirmation |
| `categories` | Hierarchy, defaults, custom categories |
| `budgets` | Monthly total, per-category limits |
| `analytics` | Aggregations for dashboard/charts |
| `recurring` | Pattern detection, next payment |
| `subscriptions` | Recurring subscription lifecycle |
| `goals` | Financial goals progress |
| `ai` | Provider abstraction, tools, chat, insights |
| `notifications` | In-app notification records (not Android system) |

## API Versioning

- Base path: `/api/v1`
- Health: `GET /health`, `GET /ready` (unversioned)

## Authentication

- Email/password registration and login.
- JWT access token (short TTL) + refresh token (stored hashed server-side).
- Mobile: `expo-secure-store` for tokens.
- All user-scoped queries filter by `current_user.id` from token — never trust client `user_id`.

## Offline-First Mobile

1. Detected transactions → local queue (MMKV/SQLite).
2. Sync worker retries on connectivity restore.
3. Idempotent backend endpoints use client-generated UUID or fingerprint.

## Caching Strategy

- Redis caches `GET /analytics/dashboard` per user (TTL 60–300s).
- Invalidate on transaction create/update/delete.
- Rate limiting: Redis sliding window per IP/user.

## AI Architecture

```
User question → Intent router → Tool selector → Structured queries (PostgreSQL)
                                              → Tool results → LLM (OpenAI) → Response
```

- LLM never invents numbers — only interprets tool-returned data.
- Provider interface allows swapping OpenAI for other compatible APIs.

## Deployment (MVP)

- Docker Compose: FastAPI + PostgreSQL + Redis for local dev.
- Single container image for API in production.
- Mobile: EAS Build for Android release.

## Observability

- Structured JSON logging with request ID.
- `GET /health` — process alive.
- `GET /ready` — DB + Redis connectivity.
- No sensitive data in logs.
