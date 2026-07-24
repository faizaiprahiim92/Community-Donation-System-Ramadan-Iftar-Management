from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.permissions import require_manager, require_manager_or_leader
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate


def _enrich_expenses(expenses: list[Expense], db: Session) -> list[dict]:
    paid_by_ids = {e.paid_by for e in expenses}
    users = db.query(User.id, User.full_name).filter(User.id.in_(paid_by_ids)).all() if paid_by_ids else []
    name_map = {u.id: u.full_name for u in users}
    return [
        {**ExpenseResponse.model_validate(e).model_dump(), "paid_by_name": name_map.get(e.paid_by, f"User #{e.paid_by}")}
        for e in expenses
    ]

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


def _next_receipt(db: Session) -> str:
    last = db.query(Expense).order_by(Expense.id.desc()).first()
    num = (last.id + 1) if last else 1
    return f"EXP-{num:03d}"


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    search: str | None = None,
    category: str | None = None,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    q = db.query(Expense)
    if search:
        q = q.filter(Expense.name.ilike(f"%{search}%"))
    if category:
        q = q.filter(Expense.category == category)
    if status_filter:
        q = q.filter(Expense.status == status_filter)
    expenses = q.order_by(Expense.created_at.desc()).offset(skip).limit(limit).all()
    return _enrich_expenses(expenses, db)


@router.get("/stats/summary")
def expense_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    from sqlalchemy import func

    total = db.query(Expense).count()
    total_cost = db.query(func.coalesce(func.sum(Expense.total_cost), 0.0)).scalar()
    approved = db.query(Expense).filter(Expense.status == "Approved").count()
    pending = db.query(Expense).filter(Expense.status == "Pending").count()
    return {
        "total": total,
        "total_cost": float(total_cost),
        "approved": approved,
        "pending": pending,
    }


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return _enrich_expenses([expense], db)[0]


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current: User = Depends(require_manager_or_leader),
):
    expense = Expense(
        receipt_no=_next_receipt(db),
        created_by=current.id,
        **data.model_dump(),
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager_or_leader),
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}
