from calendar import monthrange
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.enums import TransactionType
from app.models.transaction import Transaction
from app.schemas.analytics import (
    CashflowPoint,
    CashflowResponse,
    CategoryAnalyticsResponse,
    CategorySpendItem,
    DashboardResponse,
    ExtendedMonthlyAnalyticsResponse,
    MerchantSpendItem,
    MonthlyAnalyticsResponse,
    RecentTransactionItem,
    TransactionHighlight,
    TrendPoint,
    TrendsResponse,
)

EXPENSE_TYPES = (TransactionType.EXPENSE, TransactionType.EMI)
INCOME_TYPES = (TransactionType.INCOME,)


def _month_bounds(month: date) -> tuple[datetime, datetime]:
    start = datetime(month.year, month.month, 1, tzinfo=UTC)
    last_day = monthrange(month.year, month.month)[1]
    end = datetime(month.year, month.month, last_day, 23, 59, 59, tzinfo=UTC)
    return start, end


def get_dashboard(db: Session, user_id: UUID, month: date | None = None) -> DashboardResponse:
    month = month or date.today().replace(day=1)
    start, end = _month_bounds(month)

    transactions = db.scalars(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.is_confirmed.is_(True),
        )
    ).all()

    income = sum(t.amount for t in transactions if t.transaction_type in INCOME_TYPES) or Decimal("0")
    gross_expenses = sum(t.amount for t in transactions if t.transaction_type in EXPENSE_TYPES) or Decimal("0")
    refunds = sum(t.amount for t in transactions if t.transaction_type == TransactionType.REFUND) or Decimal("0")
    expenses = gross_expenses - refunds

    budget = db.scalar(
        select(Budget).where(Budget.user_id == user_id, Budget.month == month)
    )

    category_totals: dict[str, tuple[UUID | None, Decimal]] = {}
    for t in transactions:
        if t.transaction_type not in (TransactionType.EXPENSE, TransactionType.EMI):
            continue
        name = t.category.name if t.category else "Uncategorized"
        cat_id = t.category_id
        if name not in category_totals:
            category_totals[name] = (cat_id, Decimal("0"))
        category_totals[name] = (cat_id, category_totals[name][1] + t.amount)

    top_categories = sorted(category_totals.items(), key=lambda x: x[1][1], reverse=True)[:5]
    top_items = [
        CategorySpendItem(
            category_id=cat_id,
            category_name=name,
            amount=amt,
            percentage=float(amt / expenses * 100) if expenses > 0 else 0,
        )
        for name, (cat_id, amt) in top_categories
    ]

    recent = sorted(transactions, key=lambda t: t.transaction_date, reverse=True)[:5]
    recent_items = [
        RecentTransactionItem(
            id=t.id,
            merchant=t.merchant,
            amount=t.amount,
            transaction_type=t.transaction_type.value,
            transaction_date=t.transaction_date.isoformat(),
            category_name=t.category.name if t.category else None,
        )
        for t in recent
    ]

    budget_total = budget.total_amount if budget else None
    budget_spent = expenses
    budget_remaining = (budget_total - budget_spent) if budget_total else None
    budget_pct = float(budget_spent / budget_total * 100) if budget_total and budget_total > 0 else None

    return DashboardResponse(
        month=month,
        currency="INR",
        total_income=income,
        total_expenses=expenses,
        total_saved=income - expenses,
        budget_total=budget_total,
        budget_spent=budget_spent,
        budget_remaining=budget_remaining,
        budget_percentage_used=budget_pct,
        top_categories=top_items,
        recent_transactions=recent_items,
    )


def get_monthly_analytics(db: Session, user_id: UUID, month: date | None = None) -> MonthlyAnalyticsResponse:
    month = month or date.today().replace(day=1)
    start, end = _month_bounds(month)
    prev_month = (month.replace(day=1) - timedelta(days=1)).replace(day=1)
    prev_start, prev_end = _month_bounds(prev_month)

    def sum_type(types: tuple[TransactionType, ...], s: datetime, e: datetime) -> Decimal:
        result = db.scalar(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= s,
                Transaction.transaction_date <= e,
                Transaction.transaction_type.in_(types),
                Transaction.is_confirmed.is_(True),
            )
        )
        return Decimal(str(result or 0))

    gross_spent = sum_type(EXPENSE_TYPES, start, end)
    refunds = sum_type((TransactionType.REFUND,), start, end)
    spent = gross_spent - refunds
    income = sum_type(INCOME_TYPES, start, end)
    prev_gross = sum_type(EXPENSE_TYPES, prev_start, prev_end)
    prev_refunds = sum_type((TransactionType.REFUND,), prev_start, prev_end)
    prev_spent = prev_gross - prev_refunds

    mom = None
    if prev_spent > 0:
        mom = float((spent - prev_spent) / prev_spent * 100)

    savings_rate = float((income - spent) / income * 100) if income > 0 else 0.0

    weeks = []
    for i in range(4):
        w_start = start + timedelta(days=i * 7)
        w_end = min(w_start + timedelta(days=6, hours=23, minutes=59, seconds=59), end)
        w_spent = sum_type((TransactionType.EXPENSE, TransactionType.EMI), w_start, w_end)
        weeks.append(TrendPoint(label=f"Week {i + 1}", amount=w_spent))

    return MonthlyAnalyticsResponse(
        month=month,
        total_spent=spent,
        total_income=income,
        savings_rate=savings_rate,
        mom_change_percentage=mom,
        trend=weeks,
    )


def get_category_analytics(db: Session, user_id: UUID, month: date | None = None) -> CategoryAnalyticsResponse:
    month = month or date.today().replace(day=1)
    start, end = _month_bounds(month)

    rows = db.execute(
        select(
            Transaction.category_id,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.transaction_type.in_((TransactionType.EXPENSE, TransactionType.EMI)),
            Transaction.is_confirmed.is_(True),
        )
        .group_by(Transaction.category_id)
    ).all()

    from app.models.category import Category

    items: list[CategorySpendItem] = []
    total = Decimal("0")
    for cat_id, amt in rows:
        amt = Decimal(str(amt))
        total += amt
        cat = db.get(Category, cat_id) if cat_id else None
        items.append(
            CategorySpendItem(
                category_id=cat_id,
                category_name=cat.name if cat else "Uncategorized",
                amount=amt,
                percentage=0,
            )
        )

    for item in items:
        item.percentage = float(item.amount / total * 100) if total > 0 else 0

    items.sort(key=lambda x: x.amount, reverse=True)
    return CategoryAnalyticsResponse(month=month, categories=items, total=total)


def get_extended_monthly_analytics(
    db: Session, user_id: UUID, month: date | None = None
) -> ExtendedMonthlyAnalyticsResponse:
    month = month or date.today().replace(day=1)
    base = get_monthly_analytics(db, user_id, month)
    start, end = _month_bounds(month)

    transactions = db.scalars(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.is_confirmed.is_(True),
        )
    ).all()

    today = date.today()
    if month.year == today.year and month.month == today.month:
        days_elapsed = max(today.day, 1)
    else:
        days_elapsed = monthrange(month.year, month.month)[1]

    avg_daily = base.total_spent / Decimal(days_elapsed) if days_elapsed > 0 else Decimal("0")

    expense_txs = [t for t in transactions if t.transaction_type in EXPENSE_TYPES]
    largest = sorted(expense_txs, key=lambda t: t.amount, reverse=True)[:5]
    largest_items = [
        TransactionHighlight(
            id=t.id,
            merchant=t.merchant,
            amount=t.amount,
            transaction_type=t.transaction_type.value,
            transaction_date=t.transaction_date.isoformat(),
        )
        for t in largest
    ]

    merchant_totals: dict[str, tuple[Decimal, int]] = {}
    for t in expense_txs:
        name = (t.merchant or "Unknown").strip()
        if name not in merchant_totals:
            merchant_totals[name] = (Decimal("0"), 0)
        merchant_totals[name] = (merchant_totals[name][0] + t.amount, merchant_totals[name][1] + 1)

    top_merchants = sorted(
        [
            MerchantSpendItem(merchant=name, amount=amt, transaction_count=count)
            for name, (amt, count) in merchant_totals.items()
        ],
        key=lambda m: m.amount,
        reverse=True,
    )[:10]

    total_refunds = sum(t.amount for t in transactions if t.transaction_type == TransactionType.REFUND) or Decimal("0")
    total_transfers = sum(t.amount for t in transactions if t.transaction_type == TransactionType.TRANSFER) or Decimal("0")

    return ExtendedMonthlyAnalyticsResponse(
        month=base.month,
        total_spent=base.total_spent,
        total_income=base.total_income,
        savings_rate=base.savings_rate,
        mom_change_percentage=base.mom_change_percentage,
        trend=base.trend,
        average_daily_spending=avg_daily,
        largest_transactions=largest_items,
        top_merchants=top_merchants,
        total_refunds=total_refunds,
        total_transfers=total_transfers,
    )


def get_trends(
    db: Session,
    user_id: UUID,
    date_from: date,
    date_to: date,
    granularity: str = "day",
) -> TrendsResponse:
    start = datetime(date_from.year, date_from.month, date_from.day, tzinfo=UTC)
    end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=UTC)
    points: list[TrendPoint] = []

    if granularity == "week":
        cursor = start
        week_num = 1
        while cursor <= end:
            w_end = min(cursor + timedelta(days=6, hours=23, minutes=59, seconds=59), end)
            spent = _sum_expenses(db, user_id, cursor, w_end)
            points.append(TrendPoint(label=f"Week {week_num}", amount=spent))
            cursor = w_end + timedelta(seconds=1)
            week_num += 1
    elif granularity == "month":
        cursor = date(date_from.year, date_from.month, 1)
        while cursor <= date_to:
            m_start, m_end = _month_bounds(cursor)
            m_start = max(m_start, start)
            m_end = min(m_end, end)
            spent = _sum_expenses(db, user_id, m_start, m_end)
            points.append(TrendPoint(label=cursor.strftime("%b %Y"), amount=spent))
            if cursor.month == 12:
                cursor = date(cursor.year + 1, 1, 1)
            else:
                cursor = date(cursor.year, cursor.month + 1, 1)
    else:
        cursor = start
        while cursor.date() <= date_to:
            day_end = datetime(cursor.year, cursor.month, cursor.day, 23, 59, 59, tzinfo=UTC)
            spent = _sum_expenses(db, user_id, cursor, min(day_end, end))
            points.append(TrendPoint(label=cursor.strftime("%d %b"), amount=spent))
            cursor += timedelta(days=1)

    return TrendsResponse(
        granularity=granularity,
        date_from=date_from,
        date_to=date_to,
        points=points,
    )


def get_cashflow(
    db: Session,
    user_id: UUID,
    date_from: date,
    date_to: date,
    granularity: str = "week",
) -> CashflowResponse:
    start = datetime(date_from.year, date_from.month, date_from.day, tzinfo=UTC)
    end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=UTC)
    points: list[CashflowPoint] = []

    def sum_types(types: tuple[TransactionType, ...], s: datetime, e: datetime) -> Decimal:
        result = db.scalar(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= s,
                Transaction.transaction_date <= e,
                Transaction.transaction_type.in_(types),
                Transaction.is_confirmed.is_(True),
            )
        )
        return Decimal(str(result or 0))

    if granularity == "day":
        cursor = start
        while cursor.date() <= date_to:
            day_end = datetime(cursor.year, cursor.month, cursor.day, 23, 59, 59, tzinfo=UTC)
            e = min(day_end, end)
            income = sum_types(INCOME_TYPES, cursor, e)
            gross = sum_types(EXPENSE_TYPES, cursor, e)
            refunds = sum_types((TransactionType.REFUND,), cursor, e)
            expenses = gross - refunds
            points.append(
                CashflowPoint(
                    label=cursor.strftime("%d %b"),
                    income=income,
                    expenses=expenses,
                    net=income - expenses,
                )
            )
            cursor += timedelta(days=1)
    else:
        cursor = start
        week_num = 1
        while cursor <= end:
            w_end = min(cursor + timedelta(days=6, hours=23, minutes=59, seconds=59), end)
            income = sum_types(INCOME_TYPES, cursor, w_end)
            gross = sum_types(EXPENSE_TYPES, cursor, w_end)
            refunds = sum_types((TransactionType.REFUND,), cursor, w_end)
            expenses = gross - refunds
            points.append(
                CashflowPoint(
                    label=f"Week {week_num}",
                    income=income,
                    expenses=expenses,
                    net=income - expenses,
                )
            )
            cursor = w_end + timedelta(seconds=1)
            week_num += 1

    total_income = sum(p.income for p in points)
    total_expenses = sum(p.expenses for p in points)
    return CashflowResponse(
        date_from=date_from,
        date_to=date_to,
        points=points,
        total_income=total_income,
        total_expenses=total_expenses,
        net_cashflow=total_income - total_expenses,
    )


def _sum_expenses(db: Session, user_id: UUID, start: datetime, end: datetime) -> Decimal:
    gross = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.transaction_type.in_(EXPENSE_TYPES),
            Transaction.is_confirmed.is_(True),
        )
    )
    refunds = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.transaction_type == TransactionType.REFUND,
            Transaction.is_confirmed.is_(True),
        )
    )
    return Decimal(str(gross or 0)) - Decimal(str(refunds or 0))
