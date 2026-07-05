from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models import CardStatus, OrderStatus


class CardBase(BaseModel):
    player_name: str
    year: int
    set_name: str
    grade: str
    grader: str = "PSA"
    condition: str = "Near Mint"
    price: float = Field(gt=0)
    status: CardStatus = CardStatus.AVAILABLE
    image_url: str
    description: str = ""
    rarity: str = "Common"


class CardCreate(CardBase):
    image_key: str | None = None


class CardUpdate(BaseModel):
    player_name: str | None = None
    year: int | None = None
    set_name: str | None = None
    grade: str | None = None
    grader: str | None = None
    condition: str | None = None
    price: float | None = Field(default=None, gt=0)
    status: CardStatus | None = None
    image_url: str | None = None
    image_key: str | None = None
    description: str | None = None
    rarity: str | None = None


class CardOut(CardBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_key: str | None = None
    created_at: datetime
    updated_at: datetime


class OrderItemCreate(BaseModel):
    card_id: int


class OrderCreate(BaseModel):
    customer_email: EmailStr
    customer_name: str
    card_ids: list[int]


class CheckoutRequest(BaseModel):
    customer_email: EmailStr
    customer_name: str
    card_ids: list[int]
    session_id: str | None = None


class CheckoutResponse(BaseModel):
    order_id: int
    checkout_url: str | None = None
    demo_mode: bool = False
    message: str | None = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_id: int
    price_at_sale: float
    card: CardOut | None = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_email: str
    customer_name: str
    total: float
    status: OrderStatus
    stripe_session_id: str | None = None
    payment_method: str
    created_at: datetime
    items: list[OrderItemOut] = []


class InventoryStats(BaseModel):
    total_cards: int
    available: int
    sold: int
    reserved: int
    total_inventory_value: float
    available_value: float
    recent_additions: int


class AnalyticsEventCreate(BaseModel):
    event_type: str
    metadata: dict[str, Any] = {}
    session_id: str | None = None


class AnalyticsEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    metadata_json: str
    session_id: str | None = None
    timestamp: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UploadResponse(BaseModel):
    key: str
    url: str
    width: int | None = None
    height: int | None = None
    photography_tips: list[str] = []


class DashboardMetrics(BaseModel):
    total_revenue: float
    orders_count: int
    avg_order_value: float
    inventory_turnover_rate: float
    top_players: list[dict[str, Any]]
    top_sets: list[dict[str, Any]]
    status_breakdown: dict[str, int]
    daily_views: list[dict[str, Any]]
    search_trends: list[dict[str, Any]]
    recent_events: list[AnalyticsEventOut]


class AdvancedAnalytics(BaseModel):
    funnel: list[dict[str, Any]]
    cohorts: list[dict[str, Any]]
    revenue_forecast: dict[str, Any]
