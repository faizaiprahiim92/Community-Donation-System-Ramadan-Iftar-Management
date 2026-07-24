from datetime import datetime

from pydantic import BaseModel


class MessageBase(BaseModel):
    recipient_ids: str = "[]"
    subject: str
    content: str
    priority: str = "Medium"
    is_announcement: bool = False
    attachments: str = "[]"


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    is_read: bool | None = None
    is_pinned: bool | None = None
    status: str | None = None


class MessageResponse(MessageBase):
    id: int
    sender_id: int
    status: str
    is_read: bool
    is_pinned: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageThreadBase(BaseModel):
    content: str
    is_system: bool = False


class MessageThreadCreate(MessageThreadBase):
    pass


class MessageThreadResponse(MessageThreadBase):
    id: int
    message_id: int
    sender_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
