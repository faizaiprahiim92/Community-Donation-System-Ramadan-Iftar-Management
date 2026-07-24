from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.daily_report import DailyReport
from app.models.gallery_item import GalleryItem
from app.models.user import User
from app.permissions import require_manager, require_manager_or_leader
from app.schemas.daily_report import DailyReportCreate, DailyReportResponse, DailyReportUpdate


def _enrich_reports(reports: list[DailyReport], db: Session) -> list[dict]:
    leader_ids = {r.team_leader_id for r in reports}
    users = db.query(User.id, User.full_name).filter(User.id.in_(leader_ids)).all() if leader_ids else []
    name_map = {u.id: u.full_name for u in users}

    report_dates = {r.date.date() for r in reports}
    video_items = (
        db.query(GalleryItem.date)
        .filter(GalleryItem.type == "Video", GalleryItem.date.in_(report_dates))
        .all()
    )
    video_counts: dict = {}
    for vi in video_items:
        d = vi.date.date()
        video_counts[d] = video_counts.get(d, 0) + 1

    return [
        {
            **DailyReportResponse.model_validate(r).model_dump(),
            "team_leader_name": name_map.get(r.team_leader_id, f"User #{r.team_leader_id}"),
            "video_count": video_counts.get(r.date.date(), 0),
        }
        for r in reports
    ]

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("", response_model=list[DailyReportResponse])
def list_reports(
    search: str | None = None,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    q = db.query(DailyReport)
    if search:
        q = q.filter(DailyReport.location.ilike(f"%{search}%"))
    if status_filter:
        q = q.filter(DailyReport.status == status_filter)
    reports = q.order_by(DailyReport.created_at.desc()).offset(skip).limit(limit).all()
    return _enrich_reports(reports, db)


@router.get("/stats/summary")
def report_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    from sqlalchemy import func

    total = db.query(DailyReport).count()
    total_people = db.query(func.coalesce(func.sum(DailyReport.people_served), 0)).scalar()
    total_meals = db.query(func.coalesce(func.sum(DailyReport.meals_prepared), 0)).scalar()
    completed = db.query(DailyReport).filter(DailyReport.status == "Completed").count()
    campaign_days = db.query(func.count(func.distinct(DailyReport.date))).scalar()
    return {
        "total": total,
        "total_people_served": int(total_people),
        "total_meals_prepared": int(total_meals),
        "completed": completed,
        "campaign_days": int(campaign_days),
    }


@router.get("/{report_id}", response_model=DailyReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return _enrich_reports([report], db)[0]


@router.post("", response_model=DailyReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    data: DailyReportCreate,
    db: Session = Depends(get_db),
    current: User = Depends(require_manager_or_leader),
):
    report = DailyReport(created_by=current.id, **data.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.put("/{report_id}", response_model=DailyReportResponse)
def update_report(
    report_id: int,
    data: DailyReportUpdate,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager_or_leader),
):
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(report, key, value)
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted"}
