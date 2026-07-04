# Heritage Slabs — Vintage Baseball Card Platform

A full-stack vintage baseball card business built on the AI Marketing Suite foundation. Features a warm vintage UI with interactive tabs, live inventory, purchase flow, and a CEO analytics command center.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript + Framer Motion |
| Backend | FastAPI + SQLAlchemy + SQLite |
| Analytics | Event tracking + CEO dashboard with KPIs |

## Quick Start

### 1. Backend

```bash
cd app/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd app/frontend
npm install
npm run dev
```

App: http://localhost:5173

### CEO Portal Login

- **Email:** `ceo@heritageslabs.com`
- **Password:** `heritage2026`

## Features

- **Shop tab** — Browse available graded cards with search, year, and grade filters
- **Full Inventory** — Real-time view of available, sold, and reserved stock
- **Our Story** — Brand narrative aligned with vintage collector positioning
- **CEO Portal** — Revenue, turnover, search trends, page views, activity log
- **Visual effects** — Card hover animations, tab transitions, vintage parchment aesthetic

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/cards/search` | Search & filter inventory |
| GET | `/api/inventory/stats` | Live inventory statistics |
| POST | `/api/orders` | Complete a purchase |
| POST | `/api/track` | Public analytics events |
| POST | `/api/auth/login` | CEO authentication |
| GET | `/api/analytics/dashboard` | CEO metrics (auth required) |

## Critical Next Steps

1. **Production database** — Migrate SQLite → PostgreSQL; add Alembic migrations
2. **Payment integration** — Stripe checkout for card acquisitions
3. **Image CDN** — Upload real slab photos to S3/Cloudflare R2
4. **Advanced analytics** — Funnel tracking, cohort analysis, revenue forecasting
5. **Inventory admin** — CRUD UI for adding/editing cards without API calls
6. **Marketing launch** — Use `/market launch Heritage Slabs` from the parent repo

## Brand Voice (from Marketing Suite)

- **Tone:** Warm, knowledgeable, nostalgic — like a trusted dealer at a card show
- **Audience:** Serious collectors and investors who value provenance
- **Differentiator:** Curated slabs with live inventory transparency and CEO-backed analytics
