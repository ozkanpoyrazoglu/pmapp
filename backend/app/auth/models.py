# backend/app/auth/models.py

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from bson import ObjectId

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Ad soyad boş olamaz')
        if len(v.strip()) < 2:
            raise ValueError('Ad soyad en az 2 karakter olmalıdır')
        return v.strip()

class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Şifre en az 6 karakter olmalıdır')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Ad soyad boş olamaz')
            if len(v.strip()) < 2:
                raise ValueError('Ad soyad en az 2 karakter olmalıdır')
            return v.strip()
        return v

class User(UserBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
    )
    
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return str(v)

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None