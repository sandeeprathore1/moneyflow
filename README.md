# MoneyFlow

Privacy-conscious personal finance app for salaried professionals. Android automatic UPI detection via notifications; iOS manual tracking.

## Prerequisites

- **Docker Desktop** (for PostgreSQL, Redis, API)
- **Node.js 20+** (mobile)
- **Python 3.12** recommended for local backend (Python 3.15 may crash SQLAlchemy on Windows — use Docker)

## Quick Start

### 1. Environment

```bash
cp .env.example .env
```

### 2. Backend (Docker)

```bash
docker compose up -d postgres redis
docker compose up api
```

Run migrations:

```bash
docker compose exec api alembic upgrade head
```

Health check: http://localhost:8000/health

### 3. Backend tests

```bash
docker compose run --rm api pytest -v
```

### 4. Mobile

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (use `http://10.0.2.2:8000` for Android emulator).

## Project Structure

```
├── backend/     FastAPI modular monolith
├── mobile/      Expo React Native app
├── docs/        Architecture & research
└── scripts/     Utility scripts
```

## API

- `POST /api/v1/auth/register` — Register
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/users/me` — Current user
- `GET /health` — Health check
- `GET /ready` — Readiness (DB + Redis)

## License

Private — internal development.
