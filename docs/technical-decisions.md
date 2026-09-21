# Technical Decision Records (ADRs)

## ADR-001: Modular Monolith over Microservices

**Status:** Accepted

**Context:** MVP needs fast iteration with clear boundaries.

**Decision:** Single FastAPI deployable with internal modules (`auth`, `transactions`, etc.).

**Consequences:** Simpler ops; can extract services later if scale demands.

---

## ADR-002: Notification-First Android Detection (No SMS)

**Status:** Accepted

**Context:** Google Play restricts SMS permissions; competitors rely on SMS with parsing fragility.

**Decision:** Use `NotificationListenerService` via custom Kotlin Expo module. Do not request `READ_SMS`/`RECEIVE_SMS`.

**Consequences:** Play Store compliance improved; may miss transactions that only arrive via SMS without notification. Document limitation clearly.

---

## ADR-003: Custom Kotlin Native Module

**Status:** Accepted

**Context:** Need full control over parser architecture, privacy, and testing.

**Decision:** Build `moneyflow-notifications` Expo module rather than depend on third-party notification listener packages.

**Consequences:** More initial work; better long-term maintainability.

---

## ADR-004: iOS Manual-First

**Status:** Accepted

**Context:** iOS has no API to read other apps' notifications.

**Decision:** Full manual tracking on iOS; `TransactionSource` abstraction for future import/bank paths.

**Consequences:** Platform parity messaging required in onboarding.

---

## ADR-005: OpenAI-Compatible AI Provider Abstraction

**Status:** Accepted

**Context:** AI provider may change; must not hallucinate financial numbers.

**Decision:** Tool-based architecture — LLM calls deterministic backend functions; OpenAI as first implementation.

**Consequences:** Requires robust tool layer tests; CI uses mock provider.

---

## ADR-006: PostgreSQL as Source of Truth

**Status:** Accepted

**Context:** Relational financial data with joins and aggregations.

**Decision:** PostgreSQL + SQLAlchemy 2.0 + Alembic. Redis for cache/rate limit only.

---

## ADR-007: Expo SDK 54 + Development Builds

**Status:** Accepted

**Context:** Native notification listener unavailable in Expo Go.

**Decision:** Expo managed workflow with dev builds and EAS for release.

---

## ADR-008: Offline Local Queue on Mobile

**Status:** Accepted

**Context:** Detection may occur without network.

**Decision:** MMKV-backed pending transaction queue; sync on reconnect with fingerprint dedup.

---

## ADR-009: Stitch Aurora Design System

**Status:** Accepted

**Context:** Provided DESIGN.md and HTML mockups are source of truth.

**Decision:** Map tokens to `mobile/src/theme/`; reproduce layouts faithfully; light mode first.

---

## ADR-010: Fingerprint-Based Duplicate Detection

**Status:** Accepted

**Context:** Same transaction may appear from multiple notifications.

**Decision:** `hash(normalized_merchant + amount + approximate_timestamp + type)` with configurable tolerance window.
