from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    action: str,
    resource_type: str,
    user_id: UUID | None = None,
    resource_id: UUID | None = None,
    ip_address: str | None = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
        )
    )
