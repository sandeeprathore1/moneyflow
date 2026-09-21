"""Seed system categories. Run after migrations."""

from app.core.database import SessionLocal
from app.services.seed_categories import seed_system_categories


def main() -> None:
    db = SessionLocal()
    try:
        seed_system_categories(db)
        print("System categories seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
