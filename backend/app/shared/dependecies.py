from fastapi import Depends, HTTPException, status
from app.auth.routes import get_current_user
from app.auth.models import User

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Aktif kullanıcı kontrolü"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user