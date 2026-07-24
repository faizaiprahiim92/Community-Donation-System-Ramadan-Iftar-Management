from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.security import hash_password
from app.database.database import get_db
from app.models.user import User
from app.permissions import require_manager, require_manager_or_leader
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreateRequest(BaseModel):
    full_name: str
    username: str
    phone: str
    role: str
    password: str


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    username: str | None = None
    phone: str | None = None
    role: str | None = None
    is_active: bool | None = None


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager_or_leader),
):
    return db.query(User).order_by(User.id).all()


@router.get("/stats/summary")
def user_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    from sqlalchemy import func

    total = db.query(User).count()
    managers = db.query(User).filter(User.role == "Manager").count()
    leaders = db.query(User).filter(User.role == "Leader").count()
    volunteers = db.query(User).filter(User.role == "Volunteer").count()
    active = db.query(User).filter(User.is_active == True).count()
    return {
        "total": total,
        "managers": managers,
        "leaders": leaders,
        "volunteers": volunteers,
        "active": active,
    }


@router.get("/names")
def user_names(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    users = db.query(User.id, User.full_name).order_by(User.id).all()
    return [{"id": u.id, "full_name": u.full_name} for u in users]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager_or_leader),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreateRequest,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    if len(data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )
    user = User(
        full_name=data.full_name,
        username=data.username,
        phone=data.phone,
        role=data.role,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    update_data = data.model_dump(exclude_unset=True)
    if "username" in update_data:
        existing = db.query(User).filter(
            User.username == update_data["username"], User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists",
            )
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(require_manager),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
