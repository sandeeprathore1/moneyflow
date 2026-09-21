# Hosting MoneyFlow on Supabase

Supabase hosts the **PostgreSQL database**. The FastAPI backend still runs as a separate service (Docker locally, or Railway/Fly/Render in production) and connects to Supabase via `DATABASE_URL`.

## 1. Create a Supabase project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → name: `moneyflow`
3. Choose region (e.g. **South Asia (Mumbai)** for India)
4. Set a strong database password and save it

## 2. Configure environment

```powershell
copy .env.supabase.example .env
```

Edit `.env`:

| Variable | Where to find it |
|----------|------------------|
| `SUPABASE_PROJECT_REF` | Project Settings → General → Reference ID |
| `SUPABASE_DB_PASSWORD` | Password you chose at project creation |
| `DATABASE_URL` | Project Settings → Database → URI (direct, port **5432**) |

Example URI:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

Set `DATABASE_SSL=true`.

## 3. Run migrations

```powershell
.\scripts\supabase_deploy.ps1
```

Or manually:

```powershell
docker compose -f docker-compose.supabase.yml run --rm api alembic upgrade head
docker compose -f docker-compose.supabase.yml run --rm api python -m scripts.seed_categories
```

## 4. Start the API (local, using Supabase DB)

```powershell
docker compose -f docker-compose.supabase.yml up api
```

Health check: http://localhost:8000/health

## 5. Production API (optional)

Supabase does not run FastAPI apps. Deploy the `backend/` Docker image to:

- [Railway](https://railway.app)
- [Fly.io](https://fly.io)
- [Render](https://render.com)

Set these environment variables on the host:

- `DATABASE_URL` — Supabase URI (pooler port **6543** is fine for the API)
- `DATABASE_SSL=true`
- `JWT_SECRET` — strong random secret
- `REDIS_URL` — Upstash Redis or omit if not using cache yet
- `CORS_ORIGINS` — your mobile/web origins

Update `EXPO_PUBLIC_API_URL` in the mobile app to your deployed API URL.

## 6. Supabase CLI (optional)

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

The repo includes `supabase/config.toml` for local Supabase tooling. Schema migrations are managed by **Alembic**, not Supabase SQL migrations.

## Security checklist

- Never commit `.env` or database passwords
- Rotate `JWT_SECRET` for production
- Use Supabase **Row Level Security** only if you add a Supabase client; this app uses FastAPI with its own auth layer
- Keep the repo public only if no secrets are in git history
