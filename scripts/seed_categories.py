"""Seed system categories. Run after migrations: python scripts/seed_categories.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

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
