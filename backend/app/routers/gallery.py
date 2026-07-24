import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.gallery_item import GalleryItem
from app.models.user import User
from app.permissions import require_manager_or_leader
from app.schemas.gallery_item import GalleryItemCreate, GalleryItemResponse, GalleryItemUpdate

router = APIRouter(prefix="/api/gallery", tags=["gallery"])


def _enrich_gallery(items: list[GalleryItem], db: Session) -> list[dict]:
    uploader_ids = {i.uploaded_by_id for i in items}
    users = db.query(User.id, User.full_name).filter(User.id.in_(uploader_ids)).all() if uploader_ids else []
    name_map = {u.id: u.full_name for u in users}
    return [
        {**GalleryItemResponse.model_validate(i).model_dump(), "uploaded_by_name": name_map.get(i.uploaded_by_id, f"User #{i.uploaded_by_id}")}
        for i in items
    ]

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


VIDEOS_DIR = UPLOADS_DIR / "videos"
PHOTOS_DIR = UPLOADS_DIR / "photos"
ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".avi", ".webm"}
ALLOWED_PHOTO_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_UPLOAD_SIZE = 200 * 1024 * 1024  # 200 MB


def _can_delete(current: User, item: GalleryItem, db: Session) -> bool:
    if current.role == "Manager":
        return True
    if current.role == "Leader":
        from app.models.daily_report import DailyReport
        leader_reports = (
            db.query(DailyReport)
            .filter(DailyReport.team_leader_id == current.id)
            .all()
        )
        leader_dates = {r.date.date() for r in leader_reports}
        if item.date.date() in leader_dates:
            return True
    if item.uploaded_by_id == current.id:
        return True
    return False


@router.get("", response_model=list[GalleryItemResponse])
def list_gallery(
    search: str | None = None,
    type_filter: str | None = None,
    campaign_day: int | None = None,
    location: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    q = db.query(GalleryItem)
    if search:
        q = q.filter(GalleryItem.title.ilike(f"%{search}%"))
    if type_filter:
        q = q.filter(GalleryItem.type == type_filter)
    if campaign_day:
        q = q.filter(GalleryItem.campaign_day == campaign_day)
    if location:
        q = q.filter(GalleryItem.location.ilike(f"%{location}%"))
    items = q.order_by(GalleryItem.created_at.desc()).offset(skip).limit(limit).all()
    return _enrich_gallery(items, db)


@router.get("/{item_id}", response_model=GalleryItemResponse)
def get_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    return _enrich_gallery([item], db)[0]


@router.post("", response_model=GalleryItemResponse, status_code=status.HTTP_201_CREATED)
def create_gallery_item(
    data: GalleryItemCreate,
    db: Session = Depends(get_db),
    current: User = Depends(require_manager_or_leader),
):
    item = GalleryItem(uploaded_by_id=current.id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/upload", response_model=GalleryItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_gallery_item(
    file: UploadFile = File(...),
    type: str = Form("Video"),
    title: str = Form(...),
    description: str = Form(""),
    campaign_day: int = Form(1),
    location: str = Form("Block A - Main Hall"),
    date: str = Form(""),
    tags: str = Form("[]"),
    color: str = Form("from-green-100 to-green-200"),
    duration: str = Form(None),
    db: Session = Depends(get_db),
    current: User = Depends(require_manager_or_leader),
):
    ext = Path(file.filename or "file.mp4").suffix.lower()
    is_video = type == "Video" or ext in ALLOWED_VIDEO_EXT
    is_photo = type == "Photo" or ext in ALLOWED_PHOTO_EXT

    if is_video:
        allowed = ALLOWED_VIDEO_EXT
        target_dir = VIDEOS_DIR
        media_type = "Video"
    elif is_photo:
        allowed = ALLOWED_PHOTO_EXT
        target_dir = PHOTOS_DIR
        media_type = "Photo"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {ext} not allowed. Use: {', '.join(sorted(allowed))}",
        )

    if ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension {ext} not allowed for {media_type}s.",
        )

    target_dir.mkdir(parents=True, exist_ok=True)

    file_name = Path(file.filename or f"upload_{current.id}{ext}").name
    safe_name = f"{current.id}_{title.replace(' ', '_')}_{file_name}"
    save_path = target_dir / safe_name

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.",
        )

    with open(save_path, "wb") as f:
        f.write(content)

    file_size_str = _format_size(len(content))
    file_path_str = f"/uploads/{'videos' if media_type == 'Video' else 'photos'}/{safe_name}"

    from datetime import datetime as dt
    parsed_date = dt.fromisoformat(date.replace("Z", "+00:00")) if date else dt.now()

    item = GalleryItem(
        type=media_type,
        title=title,
        description=description,
        campaign_day=campaign_day,
        location=location,
        date=parsed_date,
        uploaded_by_id=current.id,
        tags=tags,
        color=color,
        file_name=safe_name,
        file_path=file_path_str,
        file_size=file_size_str,
        duration=duration,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=GalleryItemResponse)
def update_gallery_item(
    item_id: int,
    data: GalleryItemUpdate,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager_or_leader),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    if not _can_delete(current, item, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this item.",
        )
    if item.file_path:
        full_path = Path(__file__).resolve().parent.parent.parent / item.file_path.lstrip("/")
        if full_path.exists():
            os.remove(full_path)
    db.delete(item)
    db.commit()
    return {"message": "Gallery item deleted"}


@router.get("/stats/summary")
def gallery_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    from sqlalchemy import func

    total = db.query(GalleryItem).count()
    photos = db.query(GalleryItem).filter(GalleryItem.type == "Photo").count()
    videos = db.query(GalleryItem).filter(GalleryItem.type == "Video").count()
    return {
        "total": total,
        "photos": photos,
        "videos": videos,
    }
