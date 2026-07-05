"""Add stripe and image fields (existing DBs)

Revision ID: 002
Revises: 001
Create Date: 2026-07-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(table: str) -> set[str]:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    card_cols = _column_names("cards")
    if "image_key" not in card_cols:
        with op.batch_alter_table("cards") as batch:
            batch.add_column(sa.Column("image_key", sa.String(length=300), nullable=True))

    order_cols = _column_names("orders")
    if "stripe_session_id" not in order_cols:
        with op.batch_alter_table("orders") as batch:
            batch.add_column(sa.Column("stripe_session_id", sa.String(length=200), nullable=True))
            batch.add_column(sa.Column("payment_method", sa.String(length=40), server_default="demo", nullable=False))
        op.create_index("ix_orders_stripe_session_id", "orders", ["stripe_session_id"], unique=False)

    event_cols = _column_names("analytics_events")
    if "session_id" not in event_cols:
        with op.batch_alter_table("analytics_events") as batch:
            batch.add_column(sa.Column("session_id", sa.String(length=64), nullable=True))
        op.create_index("ix_analytics_events_session_id", "analytics_events", ["session_id"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("analytics_events") as batch:
        batch.drop_column("session_id")
    with op.batch_alter_table("orders") as batch:
        batch.drop_column("payment_method")
        batch.drop_column("stripe_session_id")
    with op.batch_alter_table("cards") as batch:
        batch.drop_column("image_key")
