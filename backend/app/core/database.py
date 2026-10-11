from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()


def sqlalchemy_url(database_url: str) -> str:
    """SQLAlchemy 2.1 treats plain postgresql:// as the psycopg v3 driver."""
    if database_url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + database_url[len("postgresql://") :]
    if database_url.startswith("postgres://"):
        return "postgresql+psycopg2://" + database_url[len("postgres://") :]
    return database_url


def _engine_kwargs(database_url: str) -> dict:
    url: URL = make_url(database_url)
    kwargs: dict = {"pool_pre_ping": True}
    host = (url.host or "").lower()
    if "supabase.co" in host or "pooler.supabase.com" in host or settings.DATABASE_SSL:
        kwargs["connect_args"] = {"sslmode": "require"}
    return kwargs


engine = create_engine(sqlalchemy_url(settings.DATABASE_URL), **_engine_kwargs(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
