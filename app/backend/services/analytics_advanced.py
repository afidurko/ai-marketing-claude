import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models import AnalyticsEvent, Order, OrderStatus


FUNNEL_STEPS = [
    ("page_view", "Site Visit"),
    ("search", "Search"),
    ("card_view", "Card View"),
    ("checkout_start", "Checkout Started"),
    ("purchase", "Purchase"),
]


def compute_funnel(db: Session, days: int = 30) -> list[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    events = db.query(AnalyticsEvent).filter(AnalyticsEvent.timestamp >= since).all()

    counts = Counter(e.event_type for e in events)
    first_step = counts.get("page_view", 0) or 1

    funnel = []
    for event_type, label in FUNNEL_STEPS:
        count = counts.get(event_type, 0)
        funnel.append(
            {
                "step": label,
                "event_type": event_type,
                "count": count,
                "rate": round(count / first_step * 100, 1),
            }
        )
    return funnel


def compute_cohorts(db: Session, weeks: int = 8) -> list[dict]:
    since = datetime.utcnow() - timedelta(weeks=weeks)
    events = (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.timestamp >= since, AnalyticsEvent.session_id.isnot(None))
        .all()
    )

    cohort_sessions: dict[str, set[str]] = defaultdict(set)
    session_weeks: dict[str, str] = {}

    for event in events:
        if not event.session_id:
            continue
        week = event.timestamp.strftime("%Y-W%W")
        cohort_sessions[week].add(event.session_id)
        session_weeks[event.session_id] = week

    cohorts = []
    sorted_weeks = sorted(cohort_sessions.keys())
    for i, cohort_week in enumerate(sorted_weeks):
        sessions = cohort_sessions[cohort_week]
        retention = []
        for offset in range(min(4, len(sorted_weeks) - i)):
            target_week = sorted_weeks[i + offset]
            active = sum(1 for s in sessions if session_weeks.get(s) == target_week or _session_active_in_week(events, s, target_week))
            rate = round(active / len(sessions) * 100, 1) if sessions else 0
            retention.append({"week_offset": offset, "rate": rate, "active": active})
        cohorts.append({"cohort_week": cohort_week, "size": len(sessions), "retention": retention})

    return cohorts[-6:]


def _session_active_in_week(events: list[AnalyticsEvent], session_id: str, week: str) -> bool:
    for e in events:
        if e.session_id == session_id and e.timestamp.strftime("%Y-W%W") == week:
            return True
    return False


def compute_revenue_forecast(db: Session, days_ahead: int = 30) -> dict:
    since = datetime.utcnow() - timedelta(days=90)
    orders = (
        db.query(Order)
        .filter(Order.created_at >= since, Order.status == OrderStatus.COMPLETED)
        .order_by(Order.created_at)
        .all()
    )

    daily: dict[str, float] = defaultdict(float)
    for order in orders:
        day = order.created_at.strftime("%Y-%m-%d")
        daily[day] += order.total

    if not daily:
        return {
            "historical_daily": [],
            "forecast_daily": [],
            "projected_revenue_30d": 0,
            "growth_rate_pct": 0,
            "method": "insufficient_data",
        }

    sorted_days = sorted(daily.keys())
    values = [daily[d] for d in sorted_days]
    n = len(values)

    if n >= 2:
        x_mean = (n - 1) / 2
        y_mean = sum(values) / n
        numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((i - x_mean) ** 2 for i in range(n)) or 1
        slope = numerator / denominator
        intercept = y_mean - slope * x_mean
    else:
        slope = 0
        intercept = values[0]

    last_date = datetime.strptime(sorted_days[-1], "%Y-%m-%d")
    forecast = []
    projected = 0.0
    for i in range(1, days_ahead + 1):
        future = last_date + timedelta(days=i)
        predicted = max(0, intercept + slope * (n - 1 + i))
        projected += predicted
        forecast.append({"date": future.strftime("%Y-%m-%d"), "predicted": round(predicted, 2)})

    growth = round(slope / (y_mean or 1) * 100, 1) if n >= 2 else 0

    return {
        "historical_daily": [{"date": d, "revenue": round(daily[d], 2)} for d in sorted_days[-14:]],
        "forecast_daily": forecast[:14],
        "projected_revenue_30d": round(projected, 2),
        "growth_rate_pct": growth,
        "method": "linear_regression",
    }
