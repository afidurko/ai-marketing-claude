from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from database import engine


def run_migrations() -> None:
    alembic_cfg = Config(str(Path(__file__).parent / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(Path(__file__).parent / "alembic"))

    insp = inspect(engine)
    has_tables = insp.has_table("cards")
    has_alembic = insp.has_table("alembic_version")

    if has_tables and not has_alembic:
        command.stamp(alembic_cfg, "001")

    command.upgrade(alembic_cfg, "head")
