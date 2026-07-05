import json
from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from routers.auth import get_current_admin
from database import get_db
from models import AnalyticsEvent, Card, CardStatus, Order, OrderStatus
from schemas import AdvancedAnalytics, AnalyticsEventCreate, AnalyticsEventOut, DashboardMetrics
from services.analytics_advanced import compute_cohorts, compute_funnel, compute_revenue_forecast

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/events", response_model=AnalyticsEventOut, status_code=201)
def track_event(payload: AnalyticsEventCreate, db: Session = Depends(get_db)):
    event = AnalyticsEvent(
        event_type=payload.event_type,
        metadata_json=json.dumps(payload.metadata),
        session_id=payload.session_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=list[AnalyticsEventOut])
def list_events(limit: int = 50, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return db.query(AnalyticsEvent).order_by(AnalyticsEvent.timestamp.desc()).limit(limit).all()


@router.get("/advanced", response_model=AdvancedAnalytics)
def advanced_analytics(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return AdvancedAnalytics(
        funnel=compute_funnel(db),
        cohorts=compute_cohorts(db),
        revenue_forecast=compute_revenue_forecast(db),
    )


@router.get("/dashboard", response_model=DashboardMetrics)
def ceo_dashboard(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).all()
    total_revenue = sum(o.total for o in orders)
    orders_count = len(orders)
    avg_order_value = total_revenue / orders_count if orders_count else 0

    sold_count = db.query(Card).filter(Card.status == CardStatus.SOLD).count()
    available_count = db.query(Card).filter(Card.status == CardStatus.AVAILABLE).count()
    turnover = sold_count / (sold_count + available_count) if (sold_count + available_count) else 0

    top_players_rows = (
        db.query(Card.player_name, Card.price)
        .filter(Card.status == CardStatus.SOLD)
        .all()
    )
    player_totals: dict[str, float] = {}
    for name, price in top_players_rows:
        player_totals[name] = player_totals.get(name, 0) + price
    top_players = [
        {"player": name, "revenue": revenue}
        for name, revenue in sorted(player_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    set_counts = Counter(c.set_name for c in db.query(Card).all())
    top_sets = [{"set": name, "count": count} for name, count in set_counts.most_common(5)]

    status_breakdown = {
        "available": db.query(Card).filter(Card.status == CardStatus.AVAILABLE).count(),
        "sold": db.query(Card).filter(Card.status == CardStatus.SOLD).count(),
        "reserved": db.query(Card).filter(Card.status == CardStatus.RESERVED).count(),
    }

    week_ago = datetime.utcnow() - timedelta(days=7)
    events = (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.timestamp >= week_ago)
        .order_by(AnalyticsEvent.timestamp.desc())
        .all()
    )

    daily_views: dict[str, int] = {}
    search_terms: Counter[str] = Counter()
    for event in events:
        day = event.timestamp.strftime("%Y-%m-%d")
        if event.event_type in ("page_view", "card_view"):
            daily_views[day] = daily_views.get(day, 0) + 1
        if event.event_type == "search":
            meta = json.loads(event.metadata_json or "{}")
            query = meta.get("query", "").strip().lower()
            if query:
                search_terms[query] += 1

    daily_views_list = [{"date": d, "views": daily_views[d]} for d in sorted(daily_views)]
    search_trends = [{"term": term, "count": count} for term, count in search_terms.most_common(8)]

    recent_events = db.query(AnalyticsEvent).order_by(AnalyticsEvent.timestamp.desc()).limit(12).all()

    return DashboardMetrics(
        total_revenue=round(total_revenue, 2),
        orders_count=orders_count,
        avg_order_value=round(avg_order_value, 2),
        inventory_turnover_rate=round(turnover * 100, 1),
        top_players=top_players,
        top_sets=top_sets,
        status_breakdown=status_breakdown,
        daily_views=daily_views_list,
        search_trends=search_trends,
        recent_events=recent_events,
    )
