from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()


def _engine_kwargs(database_url: str) -> dict:
    url: URL = make_url(database_url)
    kwargs: dict = {"pool_pre_ping": True}
    host = (url.host or "").lower()
    if "supabase.co" in host or settings.DATABASE_SSL:
        kwargs["connect_args"] = {"sslmode": "require"}
    return kwargs


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
