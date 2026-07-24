from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.donation import Donation
from app.models.user import User
from app.permissions import require_manager, require_manager_or_leader
from app.schemas.donation import DonationCreate, DonationResponse, DonationUpdate

router = APIRouter(prefix="/api/donations", tags=["donations"])


def _next_receipt(db: Session) -> str:
    last = db.query(Donation).order_by(Donation.id.desc()).first()
    num = (last.id + 1) if last else 1
    return f"REC-{num:03d}"


@router.get("", response_model=list[DonationResponse])
def list_donations(
    search: str | None = None,
    donation_type: str | None = None,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    q = db.query(Donation)
    if search:
        q = q.filter(Donation.donor_name.ilike(f"%{search}%"))
    if donation_type:
        q = q.filter(Donation.donation_type == donation_type)
    if status_filter:
        q = q.filter(Donation.status == status_filter)
    return q.order_by(Donation.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/stats/summary")
def donation_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    from sqlalchemy import func

    total = db.query(Donation).count()
    total_amount = db.query(func.coalesce(func.sum(Donation.amount), 0.0)).scalar()
    completed = db.query(Donation).filter(Donation.status == "Completed").count()
    pending = db.query(Donation).filter(Donation.status == "Pending").count()
    return {
        "total": total,
        "total_amount": float(total_amount),
        "completed": completed,
        "pending": pending,
    }


@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")
    return donation


@router.post("", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    data: DonationCreate,
    db: Session = Depends(get_db),
    current: User = Depends(require_manager_or_leader),
):
    donation = Donation(
        receipt_no=_next_receipt(db),
        created_by=current.id,
        **data.model_dump(),
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


@router.put("/{donation_id}", response_model=DonationResponse)
def update_donation(
    donation_id: int,
    data: DonationUpdate,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager_or_leader),
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(donation, key, value)
    db.commit()
    db.refresh(donation)
    return donation


@router.delete("/{donation_id}")
def delete_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")
    db.delete(donation)
    db.commit()
    return {"message": "Donation deleted"}
