# Security

## Authentication

- Passwords hashed with **bcrypt** (cost factor ≥ 12).
- JWT access tokens: short TTL (15–30 min).
- Refresh tokens: stored hashed in DB; rotatable; revocable on logout.
- Google OAuth: optional future phase; design JWT flow to accept OAuth subjects.

## Authorization

- Every endpoint touching user data requires valid JWT.
- `user_id` derived from token — never from request body/query.
- Row-level isolation: all queries include `WHERE user_id = :current_user_id`.

## Transport

- HTTPS only in production.
- HSTS headers on API gateway.

## Input Validation

- Pydantic schemas on all request bodies.
- SQLAlchemy parameterized queries only — no raw string interpolation.
- Pagination limits enforced (max page_size).

## Secrets Management

- All secrets in environment variables.
- `.env` never committed; `.env.example` documents required keys.
- `JWT_SECRET` minimum 256-bit random value in production.

## Logging Rules — NEVER LOG

- Passwords or password hashes
- Access/refresh tokens
- Full notification content
- OTP codes
- Bank account numbers
- Complete transaction details at DEBUG in production

## Sanitized Logging

- Request ID, endpoint, status code, user_id (UUID), duration.
- Error messages without stack traces to client.

## Rate Limiting

- Redis-based per-IP and per-user limits on auth endpoints.
- Stricter limits on `/ai/chat`.

## CORS

- Explicit allowlist of mobile app origins in production.
- No `*` with credentials.

## Data Deletion

- Account deletion cascades all user-owned rows.
- Refresh tokens revoked immediately.

## Mobile

- Tokens in `expo-secure-store`, not AsyncStorage.
- Certificate pinning: future hardening phase.

## AI Privacy

- Send only structured aggregates to LLM, not raw transaction dumps.
- No notification text sent to AI provider.

## Audit

- `audit_logs` for account deletion, export, settings changes.
