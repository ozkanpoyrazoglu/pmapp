# backend/app/shared/object_id.py

from bson import ObjectId
from pydantic import Field
from typing import Any
from pydantic_core import core_schema
from typing_extensions import Annotated

class PyObjectId(str):
    """A string-based ObjectId that works seamlessly with Pydantic v2"""
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(cls.validate, core_schema.str_schema())

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return v
            else:
                raise ValueError("Invalid ObjectId format")
        raise ValueError("ObjectId must be a valid ObjectId string")

    @classmethod
    def __get_pydantic_json_schema__(cls, _source_type, _handler):
        return {"type": "string", "format": "objectid"}

# Helper function to convert to ObjectId when needed
def to_object_id(value: str) -> ObjectId:
    """Convert string to ObjectId"""
    return ObjectId(value)

def from_object_id(value: ObjectId) -> str:
    """Convert ObjectId to string"""
    return str(value)

# Type alias for easier use
PyObjectIdType = Annotated[PyObjectId, Field()]