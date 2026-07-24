from datetime import datetime

from pydantic import BaseModel


class DonationBase(BaseModel):
    donor_name: str
    donation_type: str
    amount: float | None = None
    item_name: str | None = None
    category: str | None = None
    quantity: float | None = None
    unit: str | None = None
    estimated_value: float | None = None
    payment_method: str | None = None
    reference_number: str | None = None
    date: datetime
    notes: str | None = None
    status: str = "Completed"


class DonationCreate(DonationBase):
    pass


class DonationUpdate(BaseModel):
    donor_name: str | None = None
    donation_type: str | None = None
    amount: float | None = None
    item_name: str | None = None
    category: str | None = None
    quantity: float | None = None
    unit: str | None = None
    estimated_value: float | None = None
    payment_method: str | None = None
    reference_number: str | None = None
    date: datetime | None = None
    notes: str | None = None
    status: str | None = None


class DonationResponse(DonationBase):
    id: int
    receipt_no: str
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
