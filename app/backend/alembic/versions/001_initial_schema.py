"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-07-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("player_name", sa.String(length=120), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("set_name", sa.String(length=160), nullable=False),
        sa.Column("grade", sa.String(length=20), nullable=False),
        sa.Column("grader", sa.String(length=40), nullable=False),
        sa.Column("condition", sa.String(length=80), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("status", sa.Enum("available", "sold", "reserved", name="cardstatus", native_enum=False), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("image_key", sa.String(length=300), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("rarity", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cards_id", "cards", ["id"])
    op.create_index("ix_cards_player_name", "cards", ["player_name"])
    op.create_index("ix_cards_year", "cards", ["year"])
    op.create_index("ix_cards_set_name", "cards", ["set_name"])
    op.create_index("ix_cards_status", "cards", ["status"])

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_email", sa.String(length=200), nullable=False),
        sa.Column("customer_name", sa.String(length=200), nullable=False),
        sa.Column("total", sa.Float(), nullable=False),
        sa.Column("status", sa.Enum("pending", "completed", "cancelled", name="orderstatus", native_enum=False), nullable=False),
        sa.Column("stripe_session_id", sa.String(length=200), nullable=True),
        sa.Column("payment_method", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_id", "orders", ["id"])
    op.create_index("ix_orders_stripe_session_id", "orders", ["stripe_session_id"])

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("card_id", sa.Integer(), nullable=False),
        sa.Column("price_at_sale", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["cards.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "analytics_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("metadata_json", sa.Text(), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("timestamp", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analytics_events_event_type", "analytics_events", ["event_type"])
    op.create_index("ix_analytics_events_session_id", "analytics_events", ["session_id"])
    op.create_index("ix_analytics_events_timestamp", "analytics_events", ["timestamp"])


def downgrade() -> None:
    op.drop_table("analytics_events")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("cards")
