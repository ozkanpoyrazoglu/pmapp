import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status

# Logging
logger = logging.getLogger(__name__)

# BCrypt context - Güvenli şifreleme için optimized
try:
    pwd_context = CryptContext(
        schemes=["bcrypt"],
        deprecated="auto",
        bcrypt__rounds=12,  # Güvenlik için rounds sayısı
    )
    logger.info("BCrypt context initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize BCrypt context: {e}")
    # Fallback: Basit bcrypt context
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT ayarları
SECRET_KEY = os.getenv("SECRET_KEY", "your-fallback-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Şifre doğrulama"""
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        logger.debug(f"Password verification result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error during password verification: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Şifre hash'leme"""
    try:
        hashed = pwd_context.hash(password)
        logger.debug("Password hashed successfully")
        return hashed
    except Exception as e:
        logger.error(f"Error during password hashing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Şifre işleme sırasında hata oluştu"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Access token oluştur"""
    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.debug("Access token created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token oluşturma sırasında hata oluştu"
        )

def verify_token(token: str) -> Optional[str]:
    """Token doğrulama"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {e}")
        return None

def create_credentials_exception():
    """Kimlik doğrulama hatası exception'ı oluştur"""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulama bilgileri geçersiz",
        headers={"WWW-Authenticate": "Bearer"},
    )
