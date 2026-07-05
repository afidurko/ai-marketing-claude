from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from migrate import run_migrations
from routers import analytics, auth, cards, inventory, orders, payments, uploads
from seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    run_migrations()
    seed_database()
    yield


app = FastAPI(
    title="Heritage Slabs API",
    description="Vintage baseball card inventory, commerce, and CEO analytics",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

app.include_router(cards.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(payments.router)
app.include_router(uploads.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "heritage-slabs-api",
        "database": "postgresql" if not settings.is_sqlite else "sqlite",
        "stripe": settings.stripe_enabled,
        "cdn": "s3" if settings.s3_enabled else "local",
    }
