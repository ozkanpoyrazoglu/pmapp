# backend/app/projects/models.py

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
from bson import ObjectId
import re

class TaskStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TaskType(str, Enum):
    TASK = "task"
    EPIC = "epic"
    MILESTONE = "milestone"

class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    task_type: TaskType = TaskType.TASK
    status: TaskStatus = TaskStatus.NOT_STARTED
    priority: Priority = Priority.MEDIUM
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: Optional[int] = None
    effort_hours: Optional[float] = None
    completion_percentage: float = 0.0
    assigned_to: Optional[str] = None
    dependencies: List[str] = []
    parent_epic: Optional[str] = None
    tags: List[str] = []
    custom_fields: Dict[str, Any] = {}

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Task adı boş olamaz')
        return v.strip()

    @field_validator('completion_percentage')
    @classmethod
    def completion_percentage_must_be_valid(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Tamamlanma yüzdesi 0-100 arasında olmalıdır')
        return v

    @field_validator('duration_days')
    @classmethod
    def duration_days_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Süre günü negatif olamaz')
        return v

    @field_validator('effort_hours')
    @classmethod
    def effort_hours_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Efor saati negatif olamaz')
        return v

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_default=True,
    )

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: Optional[int] = None
    effort_hours: Optional[float] = None
    completion_percentage: Optional[float] = None
    assigned_to: Optional[str] = None
    dependencies: Optional[List[str]] = None
    parent_epic: Optional[str] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Task adı boş olamaz')
        return v.strip() if v else v

    @field_validator('completion_percentage')
    @classmethod
    def completion_percentage_must_be_valid(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Tamamlanma yüzdesi 0-100 arasında olmalıdır')
        return v

    model_config = ConfigDict(
        str_strip_whitespace=True,
    )

class Task(TaskBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
    )
    
    id: str = Field(alias="_id")
    project_id: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', 'project_id', mode='before')
    @classmethod
    def validate_object_ids(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return str(v)

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    team_members: List[str] = []
    settings: Dict[str, Any] = {}

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Proje adı boş olamaz')
        return v.strip()

    @field_validator('team_members')
    @classmethod
    def validate_team_members(cls, v):
        email_pattern = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
        for email in v:
            if not email_pattern.match(email):
                raise ValueError(f'Geçersiz email adresi: {email}')
        return v

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_default=True,
    )

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[TaskStatus] = None
    team_members: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Proje adı boş olamaz')
        return v.strip() if v else v

    model_config = ConfigDict(
        str_strip_whitespace=True,
    )

class Project(ProjectBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
    )
    
    id: str = Field(alias="_id")
    owner: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return str(v)