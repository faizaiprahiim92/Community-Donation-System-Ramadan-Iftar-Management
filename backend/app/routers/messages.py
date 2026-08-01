from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.message import Message, MessageThread
from app.models.user import User
from app.permissions import require_manager
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    MessageThreadCreate,
    MessageThreadResponse,
    MessageUpdate,
)

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("", response_model=list[MessageResponse])
def list_messages(
    search: str | None = None,
    is_announcement: bool | None = None,
    is_pinned: bool | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    q = db.query(Message)
    if search:
        q = q.filter(Message.subject.ilike(f"%{search}%"))
    if is_announcement is not None:
        q = q.filter(Message.is_announcement == is_announcement)
    if is_pinned is not None:
        q = q.filter(Message.is_pinned == is_pinned)
    return q.order_by(Message.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/stats/summary")
def message_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    total = db.query(Message).count()
    unread = db.query(Message).filter(Message.is_read == False).count()
    pinned = db.query(Message).filter(Message.is_pinned == True).count()
    announcements = db.query(Message).filter(Message.is_announcement == True).count()
    return {
        "total": total,
        "unread": unread,
        "pinned": pinned,
        "announcements": announcements,
    }


@router.get("/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return msg


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if data.is_announcement and current.role != "Manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only managers can create announcements")
    msg = Message(sender_id=current.id, **data.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    thread = MessageThread(message_id=msg.id, sender_id=current.id, content=data.content)
    db.add(thread)
    db.commit()
    return msg


@router.put("/{message_id}", response_model=MessageResponse)
def update_message(
    message_id: int,
    data: MessageUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    if msg.is_announcement and current.role != "Manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only managers can update announcements")
    if current.role == "Volunteer" and msg.sender_id != current.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(msg, key, value)
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    db.query(MessageThread).filter(MessageThread.message_id == message_id).delete()
    db.delete(msg)
    db.commit()
    return {"message": "Message deleted"}


@router.get("/{message_id}/thread", response_model=list[MessageThreadResponse])
def get_thread(
    message_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(get_current_user),
):
    return (
        db.query(MessageThread)
        .filter(MessageThread.message_id == message_id)
        .order_by(MessageThread.created_at.asc())
        .all()
    )


@router.post("/{message_id}/thread", response_model=MessageThreadResponse, status_code=status.HTTP_201_CREATED)
def add_thread_reply(
    message_id: int,
    data: MessageThreadCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    thread = MessageThread(message_id=message_id, sender_id=current.id, **data.model_dump())
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread
