from fastapi import Depends, HTTPException, status

from app.auth import get_current_user
from app.models.user import User


def require_manager(current: User = Depends(get_current_user)) -> User:
    if current.role != "Manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return current


def require_manager_or_leader(current: User = Depends(get_current_user)) -> User:
    if current.role not in ("Manager", "Leader"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return current


def require_any_role(current: User = Depends(get_current_user)) -> User:
    return current
