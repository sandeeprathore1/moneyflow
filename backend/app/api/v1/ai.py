from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.provider import get_ai_provider
from app.ai.tools import TOOL_REGISTRY
from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.analytics_service import get_category_analytics, get_monthly_analytics

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)


class ChatResponse(BaseModel):
    answer: str
    data_sources: list[str]


class InsightItem(BaseModel):
    type: str
    message: str
    label: str = "Analysis"


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context_parts = []
    sources = []
    q = data.question.lower()

    if any(w in q for w in ["month", "spend", "summary", "income", "save"]):
        result = TOOL_REGISTRY["get_monthly_summary"](db, current_user.id)
        context_parts.append(f"Monthly summary: {result}")
        sources.append("monthly_summary")

    if any(w in q for w in ["category", "food", "where", "went"]):
        result = TOOL_REGISTRY["get_category_spending"](db, current_user.id)
        context_parts.append(f"Category spending: {result}")
        sources.append("category_spending")

    if "subscription" in q:
        result = TOOL_REGISTRY["get_subscription_summary"](db, current_user.id)
        context_parts.append(f"Subscriptions: {result}")
        sources.append("subscriptions")

    if any(w in q for w in ["compare", "last month", "mom"]):
        result = TOOL_REGISTRY["get_mom_comparison"](db, current_user.id)
        context_parts.append(f"Month comparison: {result}")
        sources.append("mom_comparison")

    if not context_parts:
        result = TOOL_REGISTRY["get_monthly_summary"](db, current_user.id)
        context_parts.append(f"Monthly summary: {result}")
        sources.append("monthly_summary")

    provider = get_ai_provider(settings.OPENAI_API_KEY, settings.AI_MODEL)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a personal finance assistant. Answer using ONLY the provided data. "
                "Do not give investment advice. Distinguish data from analysis. Be concise."
            ),
        },
        {
            "role": "user",
            "content": f"Data:\n{chr(10).join(context_parts)}\n\nQuestion: {data.question}",
        },
    ]

    answer = await provider.chat(messages)
    return ChatResponse(answer=answer, data_sources=sources)


@router.get("/insights", response_model=list[InsightItem])
def insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items: list[InsightItem] = []
    monthly = get_monthly_analytics(db, current_user.id)
    if monthly.mom_change_percentage and monthly.mom_change_percentage > 5:
        items.append(
            InsightItem(
                type="spending_increase",
                message=f"Spending increased {monthly.mom_change_percentage:.1f}% compared with last month.",
                label="Data",
            )
        )

    cats = get_category_analytics(db, current_user.id)
    if cats.categories:
        top = cats.categories[0]
        items.append(
            InsightItem(
                type="top_category",
                message=f"Your top spending category is {top.category_name} at {top.percentage:.0f}% of expenses.",
                label="Analysis",
            )
        )

    subs = TOOL_REGISTRY["get_subscription_summary"](db, current_user.id)
    if subs["count"] > 0:
        items.append(
            InsightItem(
                type="subscriptions",
                message=f"Your subscription spending is approximately ₹{subs['monthly_total']:,.0f}/month.",
                label="Data",
            )
        )

    return items
