from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
import logging

from app.database import get_database
from app.auth.models import User, UserCreate, UserInDB, Token, TokenData
from app.auth.utils import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    verify_token,
    create_credentials_exception,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

logger = logging.getLogger(__name__)

auth_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Email ile kullanıcı getir"""
    try:
        db = get_database()
        user_data = await db.users.find_one({"email": email})
        if user_data:
            return UserInDB(**user_data)
        return None
    except Exception as e:
        logger.error(f"Error getting user by email {email}: {e}")
        return None

async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """Kullanıcı doğrula"""
    user = await get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Mevcut kullanıcıyı getir"""
    credentials_exception = create_credentials_exception()
    
    email = verify_token(token, credentials_exception)
    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return User(**user.dict())

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Aktif kullanıcıyı getir"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@auth_router.post("/register", response_model=User)
async def register(user_data: UserCreate):
    """Yeni kullanıcı kaydı"""
    db = get_database()
    
    try:
        # Email kontrolü
        existing_user = await get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kayıtlı"
            )
        
        # Password validation
        if len(user_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Şifre en az 6 karakter olmalıdır"
            )
        
        # Full name validation
        if len(user_data.full_name.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ad soyad en az 2 karakter olmalıdır"
            )
        
        # Kullanıcı oluştur
        hashed_password = get_password_hash(user_data.password)
        user_dict = user_data.dict()
        del user_dict["password"]
        user_dict["hashed_password"] = hashed_password
        user_dict["full_name"] = user_dict["full_name"].strip()
        
        result = await db.users.insert_one(user_dict)
        created_user = await db.users.find_one({"_id": result.inserted_id})
        
        logger.info(f"New user registered: {user_data.email}")
        return User(**created_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kayıt sırasında bir hata oluştu"
        )

@auth_router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Kullanıcı girişi"""
    try:
        user = await authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email veya şifre hatalı",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Hesap aktif değil",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        logger.info(f"User logged in: {user.email}")
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Giriş sırasında bir hata oluştu"
        )

@auth_router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Mevcut kullanıcı bilgilerini getir"""
    return current_user