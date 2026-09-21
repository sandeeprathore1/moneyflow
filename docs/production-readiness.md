# MoneyFlow Production Readiness

## Security

- JWT access + refresh tokens with bcrypt password hashing
- User data isolated by `user_id` on all queries
- CORS restricted via `CORS_ORIGINS` environment variable
- No raw notification text logged in production (Android module)
- Account deletion cascades user-owned data via `/api/v1/account/me`
- Data export available as JSON and CSV

## Privacy

- Notification parsing happens locally on device
- Only structured transaction payloads sync to backend
- No SMS permissions requested
- OpenAI used only when `OPENAI_API_KEY` is configured; mock provider in dev/CI

## Performance

- Database indexes on `(user_id)`, `(user_id, transaction_date)`, `(user_id, category_id)`, `(user_id, merchant)`
- Pagination on transaction list endpoints
- Redis available for future rate limiting and dashboard caching

## Test Matrix

| Area | Command |
|------|---------|
| Backend | `docker compose run --rm api pytest -v` |
| Backend lint | `docker compose run --rm api ruff check .` |
| Mobile types | `cd mobile && npx tsc --noEmit` |
| Mobile lint | `cd mobile && npm run lint` |
| Android parsers | `cd mobile/modules/moneyflow-notifications/android && ./gradlew test` |

## Pre-Launch Checklist

- [ ] Rotate `JWT_SECRET` and database credentials
- [ ] Set production `CORS_ORIGINS`
- [ ] Configure `OPENAI_API_KEY` (optional)
- [ ] Run EAS release build
- [ ] Complete Play Store Data Safety form
- [ ] Verify notification access disclosure in-app
- [ ] Manual QA: register → add expense → budget → analytics → export → delete account
