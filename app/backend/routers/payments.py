import json

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import AnalyticsEvent, Card, CardStatus, Order, OrderItem, OrderStatus
from schemas import CheckoutRequest, CheckoutResponse, OrderOut

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _complete_order(db: Session, order: Order) -> None:
    order.status = OrderStatus.COMPLETED
    for item in order.items:
        card = db.get(Card, item.card_id)
        if card:
            card.status = CardStatus.SOLD
    db.add(
        AnalyticsEvent(
            event_type="purchase",
            metadata_json=json.dumps({"order_id": order.id, "total": order.total}),
        )
    )


@router.get("/config")
def payment_config():
    return {
        "stripe_enabled": settings.stripe_enabled,
        "publishable_key": settings.stripe_publishable_key or None,
    }


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(payload: CheckoutRequest, db: Session = Depends(get_db)):
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
        status=OrderStatus.PENDING,
        payment_method="stripe" if settings.stripe_enabled else "demo",
    )
    db.add(order)
    db.flush()

    for card in cards:
        db.add(OrderItem(order_id=order.id, card_id=card.id, price_at_sale=card.price))
        card.status = CardStatus.RESERVED

    db.add(
        AnalyticsEvent(
            event_type="checkout_start",
            metadata_json=json.dumps({"order_id": order.id, "card_ids": payload.card_ids, "total": total}),
            session_id=payload.session_id,
        )
    )
    db.commit()
    db.refresh(order)

    if not settings.stripe_enabled:
        _complete_order(db, order)
        db.commit()
        db.refresh(order)
        return CheckoutResponse(
            order_id=order.id,
            checkout_url=None,
            demo_mode=True,
            message="Stripe not configured — order completed in demo mode",
        )

    stripe.api_key = settings.stripe_secret_key
    line_items = []
    for card in cards:
        line_items.append(
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(card.price * 100),
                    "product_data": {
                        "name": f"{card.year} {card.set_name} {card.player_name}",
                        "description": f"{card.grader} {card.grade} — {card.condition}",
                        "images": [card.image_url] if card.image_url.startswith("http") else [],
                    },
                },
                "quantity": 1,
            }
        )

    session = stripe.checkout.Session.create(
        mode="payment",
        customer_email=payload.customer_email,
        line_items=line_items,
        success_url=f"{settings.frontend_url}/?checkout=success&order_id={order.id}",
        cancel_url=f"{settings.frontend_url}/?checkout=cancelled&order_id={order.id}",
        metadata={"order_id": str(order.id)},
    )

    order.stripe_session_id = session.id
    db.commit()

    return CheckoutResponse(order_id=order.id, checkout_url=session.url, demo_mode=False)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not settings.stripe_enabled:
        raise HTTPException(status_code=400, detail="Stripe not configured")

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook") from exc

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order = db.query(Order).filter(Order.stripe_session_id == session["id"]).first()
        if order and order.status == OrderStatus.PENDING:
            _complete_order(db, order)
            db.commit()

    return {"received": True}


@router.post("/cancel/{order_id}")
def cancel_checkout(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order or order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=404, detail="Pending order not found")

    for item in order.items:
        card = db.get(Card, item.card_id)
        if card and card.status == CardStatus.RESERVED:
            card.status = CardStatus.AVAILABLE

    order.status = OrderStatus.CANCELLED
    db.commit()
    return {"status": "cancelled"}
