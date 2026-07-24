from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    receipt_no: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    donor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    donation_type: Mapped[str] = mapped_column(String(20), nullable=False)  # Cash | In-Kind
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    item_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    estimated_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(20), nullable=True)  # Cash | EVC Plus | Bank
    reference_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Completed")  # Completed | Pending | Cancelled
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
