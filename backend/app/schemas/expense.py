from datetime import datetime

from pydantic import BaseModel


class ExpenseBase(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    unit_price: float
    total_cost: float
    paid_by: int
    payment_method: str
    receipt_number: str | None = None
    date: datetime
    notes: str | None = None
    status: str = "Pending"


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    quantity: float | None = None
    unit: str | None = None
    unit_price: float | None = None
    total_cost: float | None = None
    paid_by: int | None = None
    payment_method: str | None = None
    receipt_number: str | None = None
    date: datetime | None = None
    notes: str | None = None
    status: str | None = None


class ExpenseResponse(ExpenseBase):
    id: int
    receipt_no: str
    paid_by_name: str = ""
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
