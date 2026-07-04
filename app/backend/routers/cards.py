import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models import AnalyticsEvent, Card, CardStatus
from schemas import AnalyticsEventCreate, AnalyticsEventOut, CardCreate, CardOut, CardUpdate, InventoryStats

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.get("", response_model=list[CardOut])
def list_cards(
    q: str | None = None,
    year: int | None = None,
    set_name: str | None = None,
    grade: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    status: CardStatus | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Card)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Card.player_name.ilike(like),
                Card.set_name.ilike(like),
                Card.description.ilike(like),
            )
        )
    if year:
        query = query.filter(Card.year == year)
    if set_name:
        query = query.filter(Card.set_name.ilike(f"%{set_name}%"))
    if grade:
        query = query.filter(Card.grade == grade)
    if min_price is not None:
        query = query.filter(Card.price >= min_price)
    if max_price is not None:
        query = query.filter(Card.price <= max_price)
    if status:
        query = query.filter(Card.status == status)
    return query.order_by(Card.updated_at.desc()).all()


@router.get("/search", response_model=list[CardOut])
def search_cards(
    q: str = Query(default="", min_length=0),
    year: int | None = None,
    set_name: str | None = None,
    grade: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    status: CardStatus | None = None,
    db: Session = Depends(get_db),
):
    if q:
        event = AnalyticsEvent(
            event_type="search",
            metadata_json=json.dumps({"query": q, "year": year, "set_name": set_name}),
        )
        db.add(event)
        db.commit()
    return list_cards(q=q or None, year=year, set_name=set_name, grade=grade, min_price=min_price, max_price=max_price, status=status, db=db)


@router.get("/stats", response_model=InventoryStats)
def inventory_stats(db: Session = Depends(get_db)):
    cards = db.query(Card).all()
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent = db.query(Card).filter(Card.created_at >= week_ago).count()
    available = [c for c in cards if c.status == CardStatus.AVAILABLE]
    sold = [c for c in cards if c.status == CardStatus.SOLD]
    reserved = [c for c in cards if c.status == CardStatus.RESERVED]
    return InventoryStats(
        total_cards=len(cards),
        available=len(available),
        sold=len(sold),
        reserved=len(reserved),
        total_inventory_value=sum(c.price for c in cards),
        available_value=sum(c.price for c in available),
        recent_additions=recent,
    )


@router.get("/{card_id}", response_model=CardOut)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.add(AnalyticsEvent(event_type="card_view", metadata_json=json.dumps({"card_id": card_id})))
    db.commit()
    return card


@router.post("", response_model=CardOut, status_code=201)
def create_card(payload: CardCreate, db: Session = Depends(get_db)):
    card = Card(**payload.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{card_id}", response_model=CardOut)
def update_card(card_id: int, payload: CardUpdate, db: Session = Depends(get_db)):
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(card, key, value)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
