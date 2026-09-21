# Deploy MoneyFlow schema to Supabase Postgres
# Prerequisites: copy .env.supabase.example → .env and fill credentials

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
    Write-Host "Create .env from .env.supabase.example first." -ForegroundColor Red
    exit 1
}

Write-Host "Running Alembic migrations against Supabase..." -ForegroundColor Cyan
docker compose -f docker-compose.supabase.yml run --rm api alembic upgrade head

Write-Host "Seeding system categories..." -ForegroundColor Cyan
docker compose -f docker-compose.supabase.yml run --rm api python -m scripts.seed_categories

Write-Host "Done. Start API with: docker compose -f docker-compose.supabase.yml up api" -ForegroundColor Green
