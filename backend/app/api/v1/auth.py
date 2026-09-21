from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.core.deps import get_current_user
from app.models.user import User
from app.services.auth_service import login_user, logout_user, refresh_tokens, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    user = register_user(db, data)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return login_user(db, data)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return refresh_tokens(db, data.refresh_token)


@router.post("/logout", status_code=204)
def logout(
    data: RefreshRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    logout_user(db, data.refresh_token)
