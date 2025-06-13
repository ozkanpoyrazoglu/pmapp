from typing import Dict, Any, List, Optional
from datetime import datetime, date
from bson import ObjectId
import re

def to_camel_case(snake_str: str) -> str:
    """Snake case'i camel case'e çevir"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.capitalize() for x in components[1:])

def to_snake_case(camel_str: str) -> str:
    """Camel case'i snake case'e çevir"""
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def serialize_datetime(dt: datetime) -> str:
    """Datetime'ı ISO string'e çevir"""
    return dt.isoformat()

def serialize_date(d: date) -> str:
    """Date'i ISO string'e çevir"""
    return d.isoformat()

def serialize_object_id(obj_id: ObjectId) -> str:
    """ObjectId'yi string'e çevir"""
    return str(obj_id)

def validate_email(email: str) -> bool:
    """Email formatını doğrula"""
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(email_pattern, email) is not None

def validate_object_id(obj_id: str) -> bool:
    """ObjectId formatını doğrula"""
    return ObjectId.is_valid(obj_id)

def clean_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """Dict'ten None değerlerini temizle"""
    return {k: v for k, v in data.items() if v is not None}

def parse_sort_params(sort_by: Optional[str] = None, sort_order: Optional[str] = None) -> List[tuple]:
    """Sort parametrelerini parse et"""
    if not sort_by:
        return [("created_at", -1)]  # Default: en yeni önce
    
    direction = -1 if sort_order == "desc" else 1
    return [(sort_by, direction)]

def create_pagination_info(total: int, skip: int, limit: int) -> Dict[str, Any]:
    """Pagination bilgilerini oluştur"""
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_next": skip + limit < total,
        "has_previous": skip > 0,
        "page": (skip // limit) + 1,
        "total_pages": (total + limit - 1) // limit
    }

def format_error_message(field: str, error: str) -> str:
    """Error mesajını formatla"""
    field_map = {
        "email": "Email adresi",
        "password": "Şifre",
        "full_name": "Ad soyad",
        "name": "İsim",
        "description": "Açıklama",
        "start_date": "Başlangıç tarihi",
        "end_date": "Bitiş tarihi",
        "status": "Durum",
        "priority": "Öncelik",
        "task_type": "Görev tipi"
    }
    
    field_name = field_map.get(field, field)
    return f"{field_name}: {error}"

def calculate_duration_days(start_date: date, end_date: date) -> int:
    """İki tarih arasındaki gün sayısını hesapla"""
    if start_date and end_date:
        return (end_date - start_date).days + 1
    return 0

def is_work_day(date_obj: date) -> bool:
    """Tarih iş günü mü kontrol et (Pazartesi-Cuma)"""
    return date_obj.weekday() < 5

def calculate_work_days(start_date: date, end_date: date) -> int:
    """İki tarih arasındaki iş günü sayısını hesapla"""
    if not start_date or not end_date:
        return 0
    
    work_days = 0
    current_date = start_date
    
    while current_date <= end_date:
        if is_work_day(current_date):
            work_days += 1
        current_date = current_date.replace(day=current_date.day + 1)
    
    return work_days

def normalize_text(text: str) -> str:
    """Metni normalize et (trim, lowercase)"""
    if not text:
        return ""
    return text.strip().lower()

def truncate_text(text: str, max_length: int = 100) -> str:
    """Metni belirtilen uzunlukta kes"""
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

def safe_float(value: Any, default: float = 0.0) -> float:
    """Güvenli float dönüşümü"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_int(value: Any, default: int = 0) -> int:
    """Güvenli int dönüşümü"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def generate_slug(text: str) -> str:
    """Text'ten slug oluştur"""
    # Türkçe karakterleri değiştir
    tr_chars = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    }
    
    for tr_char, en_char in tr_chars.items():
        text = text.replace(tr_char, en_char)
    
    # Küçük harfe çevir ve özel karakterleri temizle
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text)
    text = text.strip('-')
    
    return text

def mask_email(email: str) -> str:
    """Email adresini maskele"""
    if not email or '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    if len(local) <= 2:
        masked_local = local
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"