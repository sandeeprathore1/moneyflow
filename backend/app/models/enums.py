import enum


class TransactionType(str, enum.Enum):
    EXPENSE = "EXPENSE"
    INCOME = "INCOME"
    REFUND = "REFUND"
    TRANSFER = "TRANSFER"
    INVESTMENT = "INVESTMENT"
    EMI = "EMI"
    OTHER = "OTHER"


class TransactionSource(str, enum.Enum):
    MANUAL = "MANUAL"
    NOTIFICATION = "NOTIFICATION"
    IMPORT = "IMPORT"
    OTHER = "OTHER"


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
