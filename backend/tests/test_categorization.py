from app.services.categorization_service import suggest_category
from app.services.seed_categories import seed_system_categories


def test_suggest_swiggy(db_session):
    seed_system_categories(db_session)
    from app.models.user import User
    from app.models.profile import Profile

    user = User(email="cat@example.com", hashed_password="x")
    db_session.add(user)
    db_session.add(Profile(user=user))
    db_session.commit()

    suggestion = suggest_category(db_session, user.id, "Swiggy")
    assert suggestion.category_name == "Food"
    assert suggestion.confidence >= 0.9
