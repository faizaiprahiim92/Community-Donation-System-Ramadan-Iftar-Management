from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class DailyReport(Base):
    __tablename__ = "daily_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    people_served: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    meals_prepared: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    meals_remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    food_menu: Mapped[str] = mapped_column(String(255), nullable=False)
    team_leader_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    volunteers_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    weather: Mapped[str] = mapped_column(String(50), nullable=False)
    start_time: Mapped[str] = mapped_column(String(20), nullable=False)
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending")  # Completed | Pending | In Progress
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
