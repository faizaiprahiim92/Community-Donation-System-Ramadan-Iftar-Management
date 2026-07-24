from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(10), nullable=False)  # Photo | Video
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    campaign_day: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    uploaded_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    tags: Mapped[str] = mapped_column(Text, nullable=False, default="[]")  # JSON array of strings
    color: Mapped[str] = mapped_column(String(50), nullable=False, default="from-green-100 to-green-200")
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size: Mapped[str] = mapped_column(String(20), nullable=False)
    duration: Mapped[str | None] = mapped_column(String(20), nullable=True)  # Video only
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
