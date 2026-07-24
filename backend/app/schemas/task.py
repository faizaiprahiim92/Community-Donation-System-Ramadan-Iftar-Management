from datetime import datetime

from pydantic import BaseModel


class TaskBase(BaseModel):
    name: str
    description: str
    assigned_to_id: int
    priority: str = "Medium"
    start_date: datetime
    due_date: datetime
    status: str = "Pending"
    notes: str | None = None
    progress: int = 0


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    assigned_to_id: int | None = None
    priority: str | None = None
    start_date: datetime | None = None
    due_date: datetime | None = None
    status: str | None = None
    notes: str | None = None
    progress: int | None = None


class TaskResponse(TaskBase):
    id: int
    assigned_to_name: str = ""
    assigned_to_role: str = ""
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
