import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """MongoDB bağlantısını oluştur"""
    try:
        mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        db_name = os.getenv("DATABASE_NAME", "project_management")
        
        logger.info(f"Connecting to MongoDB: {mongo_url}")
        db.client = AsyncIOMotorClient(mongo_url)
        db.database = db.client[db_name]
        
        # Bağlantıyı test et
        await db.client.admin.command('ping')
        logger.info("MongoDB bağlantısı başarılı")
        
        # Indexes oluştur
        await create_indexes()
        
    except ConnectionFailure as e:
        logger.error(f"MongoDB bağlantı hatası: {e}")
        raise
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

async def close_mongo_connection():
    """MongoDB bağlantısını kapat"""
    if db.client:
        db.client.close()
        logger.info("MongoDB bağlantısı kapatıldı")

def get_database():
    """Database instance'ını döndür"""
    return db.database

async def create_indexes():
    """Veritabanı indexlerini oluştur"""
    try:
        database = get_database()
        
        # Users collection indexes
        await database.users.create_index("email", unique=True)
        await database.users.create_index("created_at")
        
        # Projects collection indexes
        await database.projects.create_index("owner")
        await database.projects.create_index("team_members")
        await database.projects.create_index("status")
        await database.projects.create_index("created_at")
        await database.projects.create_index("updated_at")
        
        # Tasks collection indexes
        await database.tasks.create_index("project_id")
        await database.tasks.create_index("created_by")
        await database.tasks.create_index("status")
        await database.tasks.create_index("task_type")
        await database.tasks.create_index("priority")
        await database.tasks.create_index("assigned_to")
        await database.tasks.create_index("parent_epic")
        await database.tasks.create_index("tags")
        await database.tasks.create_index("start_date")
        await database.tasks.create_index("end_date")
        await database.tasks.create_index("created_at")
        await database.tasks.create_index("updated_at")
        
        # Compound indexes for common queries
        await database.tasks.create_index([("project_id", 1), ("status", 1)])
        await database.tasks.create_index([("project_id", 1), ("task_type", 1)])
        await database.tasks.create_index([("project_id", 1), ("assigned_to", 1)])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        # Don't raise here as indexes are not critical for basic functionality