from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import logging

from app.database import get_database
from app.auth.routes import get_current_active_user
from app.auth.models import User
from app.projects.models import (
    Project, ProjectCreate, ProjectUpdate,
    Task, TaskCreate, TaskUpdate,
    TaskStatus, TaskType
)
from app.projects.services import ProjectService, TaskService

logger = logging.getLogger(__name__)

projects_router = APIRouter()

# Project endpoints
@projects_router.post("/", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Yeni proje oluştur"""
    try:
        service = ProjectService()
        return await service.create_project(project_data, current_user.email)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proje oluşturulurken bir hata oluştu"
        )

@projects_router.get("/", response_model=List[Project])
async def get_user_projects(
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Skip items"),
    limit: int = Query(100, ge=1, le=100, description="Limit items")
):
    """Kullanıcının projelerini getir"""
    try:
        service = ProjectService()
        return await service.get_user_projects(current_user.email, skip, limit)
    except Exception as e:
        logger.error(f"Error getting user projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Projeler getirilirken bir hata oluştu"
        )

@projects_router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Proje detayını getir"""
    try:
        service = ProjectService()
        project = await service.get_project_by_id(project_id, current_user.email)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proje bulunamadı"
            )
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proje getirilirken bir hata oluştu"
        )

@projects_router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Proje güncelle"""
    try:
        service = ProjectService()
        project = await service.update_project(project_id, project_data, current_user.email)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proje bulunamadı veya güncelleme yetkiniz yok"
            )
        return project
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proje güncellenirken bir hata oluştu"
        )

@projects_router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Proje sil"""
    try:
        service = ProjectService()
        success = await service.delete_project(project_id, current_user.email)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proje bulunamadı veya silme yetkiniz yok"
            )
        return {"message": "Proje başarıyla silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proje silinirken bir hata oluştu"
        )

# Task endpoints
@projects_router.post("/{project_id}/tasks", response_model=Task)
async def create_task(
    project_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Proje için yeni task oluştur"""
    try:
        service = TaskService()
        return await service.create_task(project_id, task_data, current_user.email)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task oluşturulurken bir hata oluştu"
        )

@projects_router.get("/{project_id}/tasks", response_model=List[Task])
async def get_project_tasks(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    task_type: Optional[TaskType] = Query(None, description="Filter by task type"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status")
):
    """Projenin tasklarını getir"""
    try:
        service = TaskService()
        return await service.get_project_tasks(project_id, current_user.email, task_type, status)
    except Exception as e:
        logger.error(f"Error getting project tasks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Tasklar getirilirken bir hata oluştu"
        )

@projects_router.get("/{project_id}/tasks/{task_id}", response_model=Task)
async def get_task(
    project_id: str,
    task_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Task detayını getir"""
    try:
        service = TaskService()
        task = await service.get_task_by_id(project_id, task_id, current_user.email)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task bulunamadı"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task getirilirken bir hata oluştu"
        )

@projects_router.put("/{project_id}/tasks/{task_id}", response_model=Task)
async def update_task(
    project_id: str,
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Task güncelle"""
    try:
        service = TaskService()
        task = await service.update_task(project_id, task_id, task_data, current_user.email)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task bulunamadı"
            )
        return task
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task güncellenirken bir hata oluştu"
        )

@projects_router.delete("/{project_id}/tasks/{task_id}")
async def delete_task(
    project_id: str,
    task_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Task sil"""
    try:
        service = TaskService()
        success = await service.delete_task(project_id, task_id, current_user.email)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task bulunamadı"
            )
        return {"message": "Task başarıyla silindi"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task silinirken bir hata oluştu"
        )

@projects_router.get("/{project_id}/timeline")
async def get_project_timeline(
    project_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Proje timeline'ını getir"""
    try:
        service = TaskService()
        timeline = await service.get_project_timeline(project_id, current_user.email)
        return timeline
    except Exception as e:
        logger.error(f"Error getting project timeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Timeline getirilirken bir hata oluştu"
        )