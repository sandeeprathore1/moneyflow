from fastapi import APIRouter

from app.api.v1 import (
    account,
    ai,
    analytics,
    auth,
    budgets,
    categories,
    detection,
    goals,
    onboarding,
    subscriptions,
    transactions,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(onboarding.router)
api_router.include_router(users.router)
api_router.include_router(transactions.router)
api_router.include_router(categories.router)
api_router.include_router(budgets.router)
api_router.include_router(analytics.router)
api_router.include_router(detection.router)
api_router.include_router(goals.router)
api_router.include_router(subscriptions.router)
api_router.include_router(ai.router)
api_router.include_router(account.router)
