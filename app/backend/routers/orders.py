import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import AnalyticsEvent, Card, CardStatus, Order, OrderItem, OrderStatus
from schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.card_ids:
        raise HTTPException(status_code=400, detail="No cards selected")

    cards = db.query(Card).filter(Card.id.in_(payload.card_ids)).all()
    if len(cards) != len(payload.card_ids):
        raise HTTPException(status_code=404, detail="One or more cards not found")

    unavailable = [c for c in cards if c.status != CardStatus.AVAILABLE]
    if unavailable:
        raise HTTPException(status_code=409, detail="One or more cards are not available")

    total = sum(c.price for c in cards)
    order = Order(
        customer_email=payload.customer_email,
        customer_name=payload.customer_name,
        total=total,
        status=OrderStatus.COMPLETED,
    )
    db.add(order)
    db.flush()

    for card in cards:
        db.add(OrderItem(order_id=order.id, card_id=card.id, price_at_sale=card.price))
        card.status = CardStatus.SOLD

    db.add(
        AnalyticsEvent(
            event_type="purchase",
            metadata_json=json.dumps(
                {"order_id": order.id, "total": total, "card_ids": payload.card_ids}
            ),
        )
    )
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()
