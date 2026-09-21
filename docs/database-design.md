# Database Design

> PostgreSQL schema for MoneyFlow MVP+. UUIDs for primary keys. Timestamps in UTC.

## Entity Relationship (Core)

```
users ──┬── profiles
        ├── categories
        ├── transactions ── categories
        ├── budgets ── budget_categories ── categories
        ├── merchant_category_rules
        ├── income_sources
        ├── recurring_transactions
        ├── subscriptions
        ├── financial_goals
        ├── accounts
        ├── user_preferences
        ├── ai_insights
        └── audit_logs
```

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| hashed_password | VARCHAR | bcrypt |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | UNIQUE |
| display_name | VARCHAR | |
| currency | VARCHAR(3) | default INR |
| monthly_income | DECIMAL(15,2) | |
| salary_day | INT | 1–31 |
| onboarding_completed | BOOLEAN | |
| created_at / updated_at | TIMESTAMPTZ | |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK NULL | NULL = system default |
| parent_id | UUID FK NULL | hierarchy |
| name | VARCHAR | |
| slug | VARCHAR | |
| icon | VARCHAR | |
| color | VARCHAR | |
| is_system | BOOLEAN | |
| created_at / updated_at | TIMESTAMPTZ | |

### transactions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| amount | DECIMAL(15,2) | |
| currency | VARCHAR(3) | |
| merchant | VARCHAR | |
| category_id | UUID FK NULL | |
| transaction_type | ENUM | EXPENSE, INCOME, REFUND, TRANSFER, INVESTMENT, EMI, OTHER |
| payment_method | VARCHAR | UPI, CARD, CASH, etc. |
| source | ENUM | MANUAL, NOTIFICATION, IMPORT, etc. |
| source_application | VARCHAR | package name |
| transaction_date | TIMESTAMPTZ | |
| detected_at | TIMESTAMPTZ NULL | |
| notes | TEXT | |
| status | ENUM | PENDING, COMPLETED, etc. |
| confidence_score | FLOAT NULL | categorization |
| is_recurring | BOOLEAN | |
| is_confirmed | BOOLEAN | |
| external_reference | VARCHAR | UPI ref |
| transaction_fingerprint | VARCHAR | dedup hash |
| created_at / updated_at | TIMESTAMPTZ | |

### merchant_category_rules
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| merchant_pattern | VARCHAR | normalized |
| category_id | UUID FK | |
| created_at | TIMESTAMPTZ | |

### budgets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| month | DATE | first of month |
| total_amount | DECIMAL(15,2) | |
| currency | VARCHAR(3) | |
| created_at / updated_at | TIMESTAMPTZ | |

### budget_categories
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| budget_id | UUID FK | |
| category_id | UUID FK | |
| limit_amount | DECIMAL(15,2) | |

### income_sources
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| name | VARCHAR | Salary, Bonus, etc. |
| amount | DECIMAL(15,2) | |
| frequency | ENUM | MONTHLY, etc. |
| is_primary | BOOLEAN | |

### recurring_transactions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| merchant | VARCHAR | |
| amount | DECIMAL(15,2) | |
| category_id | UUID FK | |
| frequency | ENUM | WEEKLY, MONTHLY, etc. |
| next_expected_date | DATE | |
| is_active | BOOLEAN | |

### subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| name | VARCHAR | |
| amount | DECIMAL(15,2) | |
| billing_cycle | ENUM | MONTHLY, YEARLY |
| status | ENUM | ACTIVE, CANCELLED, IGNORED |
| recurring_transaction_id | UUID FK NULL | |

### financial_goals
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| name | VARCHAR | |
| target_amount | DECIMAL(15,2) | |
| current_amount | DECIMAL(15,2) | |
| target_date | DATE NULL | |
| goal_type | VARCHAR | |
| created_at / updated_at | TIMESTAMPTZ | |

### refresh_tokens
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| token_hash | VARCHAR | |
| expires_at | TIMESTAMPTZ | |
| revoked | BOOLEAN | |

### ai_insights
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| insight_type | VARCHAR | |
| content | TEXT | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

### audit_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK NULL | |
| action | VARCHAR | |
| resource_type | VARCHAR | |
| resource_id | UUID | |
| ip_address | VARCHAR | |
| created_at | TIMESTAMPTZ | |

## Indexes

| Index | Rationale |
|-------|-----------|
| `transactions(user_id)` | All user transaction lists |
| `transactions(user_id, transaction_date DESC)` | Date-filtered lists, dashboard |
| `transactions(user_id, category_id)` | Category analytics |
| `transactions(user_id, merchant)` | Merchant search, rules |
| `transactions(user_id, created_at DESC)` | Recent activity |
| `transactions(user_id, transaction_type)` | Type filters |
| `transactions(transaction_fingerprint)` UNIQUE per user | Dedup |
| `categories(user_id)` | User custom categories |
| `budgets(user_id, month)` UNIQUE | One budget per month |
| `merchant_category_rules(user_id, merchant_pattern)` | Fast lookup |

## Migration Strategy

- Alembic revision per phase.
- Seed system categories on first user registration or migration seed script.
