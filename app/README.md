# Heritage Slabs — Vintage Baseball Card Platform

A full-stack vintage baseball card business built on the AI Marketing Suite foundation.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript + Framer Motion |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Database | SQLite (dev) → PostgreSQL (production) |
| Payments | Stripe Checkout (+ demo mode fallback) |
| Storage | Local uploads (dev) → S3 / Cloudflare R2 (production) |
| Analytics | Event tracking + CEO dashboard with funnel, cohorts, forecast |

## Quick Start

```bash
# Backend
cd app/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd app/frontend
npm install
npm run dev
```

Or run both: `./app/start.sh`

- **Storefront:** http://localhost:5173
- **API docs:** http://127.0.0.1:8000/docs
- **CEO login:** `ceo@heritageslabs.com` / `heritage2026`

## Production Database (PostgreSQL)

```bash
cd app
docker compose up -d postgres

# In app/backend/.env:
# DATABASE_URL=postgresql://heritage:heritage@localhost:5432/heritage_slabs

cd backend
./migrate.sh   # or: alembic upgrade head
uvicorn main:app --reload
```

Migrations run automatically on app startup. Existing SQLite databases are stamped and upgraded seamlessly.

## Stripe Checkout (deferred)

Live payments are **skipped for now**. The app uses **demo mode** — no Stripe keys required. Acquire completes instantly without redirect.

When you're ready to revisit, add to `app/backend/.env`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook endpoint: `POST /api/payments/webhook`

## Slab Photo CDN (S3 / Cloudflare R2)

```
S3_BUCKET=heritage-slabs
S3_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://cdn.heritageslabs.com
```

Without S3 config, uploads save to `./uploads` and serve at `/uploads/...`.

Upload via CEO Portal → Manage Inventory → Upload Image.

## Features

| Feature | Location |
|---------|----------|
| Shop with search/filters | Shop tab |
| Full inventory ledger | Full Inventory tab |
| Team roster & governance | Team tab |
| Stripe / demo checkout | Acquire button → checkout modal |
| CEO KPI dashboard | CEO Portal → Overview |
| Funnel, cohorts, forecast | CEO Portal → Advanced Analytics |
| Admin CRUD + photo upload | CEO Portal → Manage Inventory |
| Launch playbook | `LAUNCH-PLAYBOOK-HERITAGE-SLABS.md` |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health + config status |
| GET | `/api/cards/search` | — | Search inventory |
| POST | `/api/payments/checkout` | — | Stripe or demo checkout |
| POST | `/api/payments/webhook` | Stripe sig | Payment confirmation |
| POST | `/api/admin/uploads` | CEO JWT | Slab photo upload |
| POST | `/api/cards` | CEO JWT | Add card |
| PATCH | `/api/cards/{id}` | CEO JWT | Update card |
| DELETE | `/api/cards/{id}` | CEO JWT | Remove card |
| GET | `/api/analytics/dashboard` | CEO JWT | KPI dashboard |
| GET | `/api/analytics/advanced` | CEO JWT | Funnel, cohorts, forecast |

## Priority Roadmap (Completed)

1. ✅ PostgreSQL + Alembic migrations
2. ✅ Stripe checkout integration
3. ✅ Slab photo CDN (S3/R2 + local fallback)
4. ✅ Admin inventory management UI
5. ✅ Advanced analytics (funnels, cohorts, revenue forecast)
6. ✅ Marketing launch playbook

## Team (5 Specialists + You)

Full roster: **`app/TEAM.md`**

| Member | Role | Command |
|--------|------|---------|
| Victoria Mercer | Acquisitions & Authentication | `/heritage acquire` |
| Marcus Chen | Growth & Marketing | `/heritage grow` |
| Elena Rodriguez | Sales & Customer Experience | `/heritage sell` |
| Priya Sharma | Brand & Content | `/heritage brand` |
| James Okafor | Operations & Technology | `/heritage ops` |

**You are Founder & CEO** — ultimate authority on acquisitions, pricing, campaigns, content, and deployments. Team orchestrator: `app/team/SKILL.md`

View the team in the app: **Team tab**

## Next Steps

- Replace placeholder images with real slab photography
- Deploy to production (Railway, Fly.io, or AWS)
- Configure live Stripe + R2 credentials (Stripe **deferred** — demo checkout active)
- Run email sequences from `LAUNCH-PLAYBOOK-HERITAGE-SLABS.md`
