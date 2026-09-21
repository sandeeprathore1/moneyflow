# MoneyFlow — Project Specification

> Temporary internal product name. See master build prompt for full product vision.

## Vision

**"Know where your salary goes without manually maintaining an expense spreadsheet."**

Mobile-first personal finance for salaried Indian professionals. Android prioritizes automatic UPI/payment detection via notifications. iOS provides full manual tracking.

## Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, TypeScript, Expo SDK 54, Expo Router |
| Android native | Kotlin, NotificationListenerService |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Database | PostgreSQL |
| Cache | Redis |
| AI | OpenAI-compatible (provider abstraction) |

## Core Features (MVP)

1. Expense & income tracking
2. Android automatic transaction detection (notifications)
3. Category suggestions + user learning
4. Duplicate detection
5. Monthly budgets (total + per-category)
6. Dashboard & analytics
7. Recurring expenses & subscriptions
8. Financial goals
9. AI spending insights (tool-grounded)
10. Account deletion & data export

## Transaction Model

Required fields: id, user_id, amount, currency, merchant, category_id, transaction_type, payment_method, source, source_application, transaction_date, detected_at, notes, status, confidence_score, is_recurring, is_confirmed, external_reference, transaction_fingerprint, created_at, updated_at.

Types: EXPENSE, INCOME, REFUND, TRANSFER, INVESTMENT, EMI, OTHER.

## Platform Rules

- **Android:** Notification listener, local parsing, no raw notification upload.
- **iOS:** Manual entry; no fake notification access.
- **SMS:** Do not use READ_SMS for MVP.

## API Overview

- `POST /api/v1/auth/register`, `/login`, `/refresh`
- `GET /api/v1/users/me`
- CRUD `/api/v1/transactions`, `/categories`, `/budgets`, `/goals`
- `GET /api/v1/analytics/dashboard`, `/monthly`, `/categories`, `/trends`
- `POST /api/v1/ai/chat`
- `GET /health`, `GET /ready`

## Design

UI source of truth: `docs/design-reference/DESIGN.md` and HTML mockups. Aurora Fintech theme — Inter typography, primary blue `#004ac6`, aurora gradients on hero cards.

## Phases

0. Research & docs  
1. Foundation (monorepo, auth, docker, CI)  
3. Core expense tracker + UI  
5. Android detection  
6. Dedup + categorization  
7. Recurring, subscriptions, goals  
8. AI  
9. Production hardening  
10. Play Store prep  

## Quality Bar

Each phase: implement → test → lint → fix → commit. No fake APIs. No hardcoded dashboard data in production screens.
