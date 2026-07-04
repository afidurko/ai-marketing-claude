import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class CardStatus(str, enum.Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    RESERVED = "reserved"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_name: Mapped[str] = mapped_column(String(120), index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    set_name: Mapped[str] = mapped_column(String(160), index=True)
    grade: Mapped[str] = mapped_column(String(20))
    grader: Mapped[str] = mapped_column(String(40), default="PSA")
    condition: Mapped[str] = mapped_column(String(80), default="Near Mint")
    price: Mapped[float] = mapped_column(Float)
    status: Mapped[CardStatus] = mapped_column(Enum(CardStatus), default=CardStatus.AVAILABLE, index=True)
    image_url: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text, default="")
    rarity: Mapped[str] = mapped_column(String(40), default="Common")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="card")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_email: Mapped[str] = mapped_column(String(200))
    customer_name: Mapped[str] = mapped_column(String(200))
    total: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    card_id: Mapped[int] = mapped_column(ForeignKey("cards.id"))
    price_at_sale: Mapped[float] = mapped_column(Float)

    order: Mapped["Order"] = relationship(back_populates="items")
    card: Mapped["Card"] = relationship(back_populates="order_items")


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    metadata_json: Mapped[str] = mapped_column(Text, default="{}")
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
