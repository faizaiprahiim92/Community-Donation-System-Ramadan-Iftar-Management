from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.task import Task
from app.models.user import User
from app.permissions import require_manager, require_manager_or_leader
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate


def _enrich_tasks(tasks: list[Task], db: Session) -> list[dict]:
    assignee_ids = {t.assigned_to_id for t in tasks}
    users = db.query(User.id, User.full_name, User.role).filter(User.id.in_(assignee_ids)).all() if assignee_ids else []
    name_map = {u.id: u.full_name for u in users}
    role_map = {u.id: u.role for u in users}
    return [
        {
            **TaskResponse.model_validate(t).model_dump(),
            "assigned_to_name": name_map.get(t.assigned_to_id, f"User #{t.assigned_to_id}"),
            "assigned_to_role": role_map.get(t.assigned_to_id, "Volunteer"),
        }
        for t in tasks
    ]

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    search: str | None = None,
    priority: str | None = None,
    status_filter: str | None = None,
    assigned_to: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    q = db.query(Task)
    if search:
        q = q.filter(Task.name.ilike(f"%{search}%"))
    if priority:
        q = q.filter(Task.priority == priority)
    if status_filter:
        q = q.filter(Task.status == status_filter)
    if assigned_to:
        q = q.filter(Task.assigned_to_id == assigned_to)
    tasks = q.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return _enrich_tasks(tasks, db)


@router.get("/stats/summary")
def task_stats(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    from sqlalchemy import func

    q = db.query(Task)
    total = q.count()
    completed = q.filter(Task.status == "Completed").count()
    in_progress = q.filter(Task.status == "In Progress").count()
    pending = q.filter(Task.status == "Pending").count()
    avg_progress = q.with_entities(func.coalesce(func.avg(Task.progress), 0.0)).scalar()
    return {
        "total": total,
        "completed": completed,
        "in_progress": in_progress,
        "pending": pending,
        "avg_progress": float(avg_progress),
    }


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return _enrich_tasks([task], db)[0]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current: User = Depends(require_manager_or_leader),
):
    task = Task(created_by=current.id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current.role == "Volunteer":
        if task.assigned_to_id != current.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        allowed_fields = {"status", "progress"}
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if k in allowed_fields}
    else:
        update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _current: User = Depends(require_manager),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
