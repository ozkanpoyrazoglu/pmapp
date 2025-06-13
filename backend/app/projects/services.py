from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
import logging

from app.database import get_database
from app.projects.models import (
    Project, ProjectCreate, ProjectUpdate,
    Task, TaskCreate, TaskUpdate,
    TaskStatus, TaskType
)

logger = logging.getLogger(__name__)

class ProjectService:
    def __init__(self):
        self.db = get_database()

    async def create_project(self, project_data: ProjectCreate, owner_email: str) -> Project:
        """Yeni proje oluştur"""
        try:
            project_dict = project_data.dict()
            project_dict["owner"] = owner_email
            project_dict["created_at"] = datetime.utcnow()
            project_dict["updated_at"] = datetime.utcnow()
            
            result = await self.db.projects.insert_one(project_dict)
            created_project = await self.db.projects.find_one({"_id": result.inserted_id})
            
            logger.info(f"Project created: {created_project['name']} by {owner_email}")
            return Project(**created_project)
            
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            raise

    async def get_user_projects(self, user_email: str, skip: int, limit: int) -> List[Project]:
        """Kullanıcının projelerini getir"""
        try:
            cursor = self.db.projects.find({
                "$or": [
                    {"owner": user_email},
                    {"team_members": user_email}
                ]
            }).sort("updated_at", -1).skip(skip).limit(limit)
            
            projects = []
            async for project_data in cursor:
                projects.append(Project(**project_data))
            
            return projects
            
        except Exception as e:
            logger.error(f"Error getting user projects: {e}")
            raise

    async def get_project_by_id(self, project_id: str, user_email: str) -> Optional[Project]:
        """ID ile proje getir"""
        try:
            if not ObjectId.is_valid(project_id):
                return None
                
            project_data = await self.db.projects.find_one({
                "_id": ObjectId(project_id),
                "$or": [
                    {"owner": user_email},
                    {"team_members": user_email}
                ]
            })
            
            if project_data:
                return Project(**project_data)
            return None
            
        except Exception as e:
            logger.error(f"Error getting project by ID: {e}")
            return None

    async def update_project(self, project_id: str, project_data: ProjectUpdate, user_email: str) -> Optional[Project]:
        """Proje güncelle"""
        try:
            if not ObjectId.is_valid(project_id):
                return None
                
            update_data = {k: v for k, v in project_data.dict().items() if v is not None}
            if not update_data:
                return await self.get_project_by_id(project_id, user_email)
                
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.db.projects.update_one(
                {
                    "_id": ObjectId(project_id),
                    "owner": user_email  # Sadece sahip güncelleyebilir
                },
                {"$set": update_data}
            )
            
            if result.modified_count:
                logger.info(f"Project updated: {project_id} by {user_email}")
                return await self.get_project_by_id(project_id, user_email)
            return None
            
        except Exception as e:
            logger.error(f"Error updating project: {e}")
            return None

    async def delete_project(self, project_id: str, user_email: str) -> bool:
        """Proje sil"""
        try:
            if not ObjectId.is_valid(project_id):
                return False
                
            # Önce proje ile ilişkili taskları sil
            await self.db.tasks.delete_many({"project_id": ObjectId(project_id)})
            
            result = await self.db.projects.delete_one({
                "_id": ObjectId(project_id),
                "owner": user_email
            })
            
            if result.deleted_count > 0:
                logger.info(f"Project deleted: {project_id} by {user_email}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting project: {e}")
            return False

class TaskService:
    def __init__(self):
        self.db = get_database()

    async def create_task(self, project_id: str, task_data: TaskCreate, user_email: str) -> Task:
        """Yeni task oluştur"""
        try:
            # Proje erişim kontrolü
            project_service = ProjectService()
            project = await project_service.get_project_by_id(project_id, user_email)
            if not project:
                raise ValueError("Proje bulunamadı veya erişim yetkiniz yok")
            
            task_dict = task_data.dict()
            task_dict["project_id"] = ObjectId(project_id)
            task_dict["created_by"] = user_email
            task_dict["created_at"] = datetime.utcnow()
            task_dict["updated_at"] = datetime.utcnow()
            
            result = await self.db.tasks.insert_one(task_dict)
            created_task = await self.db.tasks.find_one({"_id": result.inserted_id})
            
            logger.info(f"Task created: {created_task['name']} in project {project_id} by {user_email}")
            return Task(**created_task)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            raise

    async def get_project_tasks(
        self, 
        project_id: str, 
        user_email: str, 
        task_type: Optional[TaskType] = None,
        status: Optional[TaskStatus] = None
    ) -> List[Task]:
        """Proje tasklarını getir"""
        try:
            # Proje erişim kontrolü
            project_service = ProjectService()
            project = await project_service.get_project_by_id(project_id, user_email)
            if not project:
                return []
            
            filter_dict = {"project_id": ObjectId(project_id)}
            if task_type:
                filter_dict["task_type"] = task_type
            if status:
                filter_dict["status"] = status
            
            cursor = self.db.tasks.find(filter_dict).sort("created_at", 1)
            
            tasks = []
            async for task_data in cursor:
                tasks.append(Task(**task_data))
            
            return tasks
            
        except Exception as e:
            logger.error(f"Error getting project tasks: {e}")
            return []

    async def get_task_by_id(self, project_id: str, task_id: str, user_email: str) -> Optional[Task]:
        """ID ile task getir"""
        try:
            if not ObjectId.is_valid(task_id) or not ObjectId.is_valid(project_id):
                return None
                
            # Proje erişim kontrolü
            project_service = ProjectService()
            project = await project_service.get_project_by_id(project_id, user_email)
            if not project:
                return None
            
            task_data = await self.db.tasks.find_one({
                "_id": ObjectId(task_id),
                "project_id": ObjectId(project_id)
            })
            
            if task_data:
                return Task(**task_data)
            return None
            
        except Exception as e:
            logger.error(f"Error getting task by ID: {e}")
            return None

    async def update_task(
        self, 
        project_id: str, 
        task_id: str, 
        task_data: TaskUpdate, 
        user_email: str
    ) -> Optional[Task]:
        """Task güncelle"""
        try:
            if not ObjectId.is_valid(task_id) or not ObjectId.is_valid(project_id):
                return None
                
            # Proje erişim kontrolü
            project_service = ProjectService()
            project = await project_service.get_project_by_id(project_id, user_email)
            if not project:
                return None
            
            update_data = {k: v for k, v in task_data.dict().items() if v is not None}
            if not update_data:
                return await self.get_task_by_id(project_id, task_id, user_email)
                
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.db.tasks.update_one(
                {
                    "_id": ObjectId(task_id),
                    "project_id": ObjectId(project_id)
                },
                {"$set": update_data}
            )
            
            if result.modified_count:
                logger.info(f"Task updated: {task_id} in project {project_id} by {user_email}")
                return await self.get_task_by_id(project_id, task_id, user_email)
            return None
            
        except Exception as e:
            logger.error(f"Error updating task: {e}")
            return None

    async def delete_task(self, project_id: str, task_id: str, user_email: str) -> bool:
        """Task sil"""
        try:
            if not ObjectId.is_valid(task_id) or not ObjectId.is_valid(project_id):
                return False
                
            # Proje erişim kontrolü
            project_service = ProjectService()
            project = await project_service.get_project_by_id(project_id, user_email)
            if not project:
                return False
            
            result = await self.db.tasks.delete_one({
                "_id": ObjectId(task_id),
                "project_id": ObjectId(project_id)
            })
            
            if result.deleted_count > 0:
                logger.info(f"Task deleted: {task_id} in project {project_id} by {user_email}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting task: {e}")
            return False

    async def get_project_timeline(self, project_id: str, user_email: str) -> Dict[str, Any]:
        """Proje timeline'ını oluştur"""
        try:
            tasks = await self.get_project_tasks(project_id, user_email)
            
            timeline_data = {
                "project_id": project_id,
                "tasks": [],
                "dependencies": [],
                "milestones": []
            }
            
            for task in tasks:
                task_item = {
                    "id": str(task.id),
                    "name": task.name,
                    "start_date": task.start_date.isoformat() if task.start_date else None,
                    "end_date": task.end_date.isoformat() if task.end_date else None,
                    "duration_days": task.duration_days,
                    "status": task.status,
                    "completion_percentage": task.completion_percentage,
                    "type": task.task_type,
                    "dependencies": task.dependencies,
                    "assigned_to": task.assigned_to,
                    "priority": task.priority
                }
                
                if task.task_type == TaskType.MILESTONE:
                    timeline_data["milestones"].append(task_item)
                else:
                    timeline_data["tasks"].append(task_item)
                
                # Bağımlılıkları ekle
                for dep_id in task.dependencies:
                    timeline_data["dependencies"].append({
                        "from": dep_id,
                        "to": str(task.id)
                    })
            
            return timeline_data
            
        except Exception as e:
            logger.error(f"Error generating project timeline: {e}")
            return {
                "project_id": project_id,
                "tasks": [],
                "dependencies": [],
                "milestones": []
            }