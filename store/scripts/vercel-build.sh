#!/usr/bin/env bash
# Build script used by Vercel (package.json → "vercel-build").
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "✖ DATABASE_URL is not set. Add a Postgres database (Vercel → Project → Storage → Neon) and redeploy." >&2
  exit 1
fi

# Vercel's Neon integration provides DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED.
# Migrations need a direct connection: fall back sensibly if DIRECT_URL isn't set.
export DIRECT_URL="${DIRECT_URL:-${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}}"

npx prisma generate
npx prisma migrate deploy

# First-run setup: creates the first admin (from INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD)
# only when no admin exists yet, and — if SEED_EXAMPLE_PRODUCTS=true — the example catalogue.
npx tsx scripts/bootstrap.ts

npx next build
