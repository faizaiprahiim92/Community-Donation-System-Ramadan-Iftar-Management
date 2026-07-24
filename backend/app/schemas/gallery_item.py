from datetime import datetime

from pydantic import BaseModel


class GalleryItemBase(BaseModel):
    type: str
    title: str
    description: str
    campaign_day: int
    location: str
    date: datetime
    tags: str = "[]"
    color: str = "from-green-100 to-green-200"
    file_name: str | None = None
    file_path: str | None = None
    file_size: str
    duration: str | None = None


class GalleryItemCreate(GalleryItemBase):
    pass


class GalleryItemUpdate(BaseModel):
    type: str | None = None
    title: str | None = None
    description: str | None = None
    campaign_day: int | None = None
    location: str | None = None
    date: datetime | None = None
    tags: str | None = None
    color: str | None = None
    file_name: str | None = None
    file_path: str | None = None
    file_size: str | None = None
    duration: str | None = None


class GalleryItemResponse(GalleryItemBase):
    id: int
    uploaded_by_id: int
    uploaded_by_name: str = ""
    created_at: datetime

    model_config = {"from_attributes": True}
