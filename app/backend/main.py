from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from routers import analytics, auth, cards, inventory, orders
from seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(
    title="Heritage Slabs API",
    description="Vintage baseball card inventory, commerce, and CEO analytics",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cards.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(inventory.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "heritage-slabs-api"}
