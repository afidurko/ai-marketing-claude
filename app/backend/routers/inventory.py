import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import AnalyticsEvent
from schemas import AnalyticsEventCreate, AnalyticsEventOut

router = APIRouter(tags=["inventory"])


@router.get("/api/inventory/stats")
def inventory_stats_alias(db: Session = Depends(get_db)):
    from routers.cards import inventory_stats

    return inventory_stats(db=db)


@router.post("/api/track", response_model=AnalyticsEventOut, status_code=201)
def public_track(payload: AnalyticsEventCreate, db: Session = Depends(get_db)):
    event = AnalyticsEvent(
        event_type=payload.event_type,
        metadata_json=json.dumps(payload.metadata),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
