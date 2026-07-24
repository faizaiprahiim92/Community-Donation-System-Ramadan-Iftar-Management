from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.security import hash_password
from app.database.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.donation import Donation
from app.models.expense import Expense
from app.models.daily_report import DailyReport
from app.models.task import Task
from app.models.gallery_item import GalleryItem
from app.models.message import Message, MessageThread
from app.routers import auth, health, users, donations, expenses, daily_reports, tasks, gallery, messages

Base.metadata.create_all(bind=engine)


def _dt(y: int, m: int, d: int) -> datetime:
    return datetime(y, m, d, tzinfo=timezone.utc)


def seed_database():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        # --- Users (5 campaign team members) ---
        users_data = [
            {"full_name": "Usama Hassan Abdi", "username": "usama", "phone": "+252610000001", "role": "Manager"},
            {"full_name": "Ilhaam Omar Farah", "username": "ilhaam", "phone": "+252620000002", "role": "Leader"},
            {"full_name": "Faiza Ibrahiim Abdullahi", "username": "faiza", "phone": "+252630000003", "role": "Volunteer"},
            {"full_name": "Nasteha Mohamed Hassan", "username": "nasteha", "phone": "+252610000004", "role": "Volunteer"},
            {"full_name": "Sawda Mohamed Omar", "username": "sawda", "phone": "+252620000005", "role": "Volunteer"},
        ]
        pwd = hash_password("12345678")
        users = []
        for u in users_data:
            user = User(full_name=u["full_name"], username=u["username"], phone=u["phone"], role=u["role"], hashed_password=pwd)
            db.add(user)
            users.append(user)
        db.flush()

        # --- Donations ($20 × 5 = $100 total, all Completed) ---
        donations_data = [
            {"donor_name": "Usama Hassan Abdi", "donation_type": "Cash", "amount": 20, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Ramadan Iftar Campaign contribution", "status": "Completed"},
            {"donor_name": "Ilhaam Omar Farah", "donation_type": "Cash", "amount": 20, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Ramadan Iftar Campaign contribution", "status": "Completed"},
            {"donor_name": "Faiza Ibrahiim Abdullahi", "donation_type": "Cash", "amount": 20, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Ramadan Iftar Campaign contribution", "status": "Completed"},
            {"donor_name": "Nasteha Mohamed Hassan", "donation_type": "Cash", "amount": 20, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Ramadan Iftar Campaign contribution", "status": "Completed"},
            {"donor_name": "Sawda Mohamed Omar", "donation_type": "Cash", "amount": 20, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Ramadan Iftar Campaign contribution", "status": "Completed"},
        ]
        for i, d in enumerate(donations_data, 1):
            db.add(Donation(receipt_no=f"REC-{i:03d}", created_by=users[i - 1].id, **d))

        # --- Expenses ($100 total, all Approved) ---
        expenses_data = [
            {"name": "Sambuus", "category": "Food", "quantity": 200, "unit": "pieces", "unit_price": 0.15, "total_cost": 30, "paid_by": users[0].id, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Sambuus for 5-day campaign", "status": "Approved"},
            {"name": "Bur", "category": "Food", "quantity": 100, "unit": "pieces", "unit_price": 0.20, "total_cost": 20, "paid_by": users[1].id, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Bur bread for 5-day campaign", "status": "Approved"},
            {"name": "Macsharo", "category": "Food", "quantity": 100, "unit": "pieces", "unit_price": 0.20, "total_cost": 20, "paid_by": users[2].id, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Macsharo for 5-day campaign", "status": "Approved"},
            {"name": "Timir", "category": "Food", "quantity": 300, "unit": "pieces", "unit_price": 0.05, "total_cost": 15, "paid_by": users[3].id, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Timir dates for 5-day campaign", "status": "Approved"},
            {"name": "Biyo Caafi", "category": "Water", "quantity": 100, "unit": "bottles", "unit_price": 0.15, "total_cost": 15, "paid_by": users[4].id, "payment_method": "Cash", "date": _dt(2026, 7, 19), "notes": "Drinking water for 5-day campaign", "status": "Approved"},
        ]
        for i, e in enumerate(expenses_data, 1):
            db.add(Expense(receipt_no=f"EXP-{i:03d}", created_by=users[0].id, **e))

        # --- Daily Reports (5 days, 20 people/day, 100 total) ---
        # Team Leader: Ilhaam Omar Farah for all days, 3 volunteers
        menu = "2 Sambuus, 1 Bur, 1 Macsharo, 3 Timir, 1 Bottle of Water"
        reports_data = [
            {"date": _dt(2026, 7, 19), "location": "Banadir", "people_served": 20, "meals_prepared": 20, "meals_remaining": 0, "food_menu": menu, "team_leader_id": users[1].id, "volunteers_count": 3, "weather": "Sunny", "start_time": "4:00 PM", "end_time": "7:30 PM", "notes": "Day 1", "status": "Completed"},
            {"date": _dt(2026, 7, 20), "location": "Banadir", "people_served": 20, "meals_prepared": 20, "meals_remaining": 0, "food_menu": menu, "team_leader_id": users[1].id, "volunteers_count": 3, "weather": "Clear", "start_time": "4:00 PM", "end_time": "7:30 PM", "notes": "Day 2", "status": "Completed"},
            {"date": _dt(2026, 7, 21), "location": "Banadir", "people_served": 20, "meals_prepared": 20, "meals_remaining": 0, "food_menu": menu, "team_leader_id": users[1].id, "volunteers_count": 3, "weather": "Hot", "start_time": "4:00 PM", "end_time": "7:30 PM", "notes": "Day 3", "status": "Completed"},
            {"date": _dt(2026, 7, 22), "location": "Xamar Bile", "people_served": 20, "meals_prepared": 20, "meals_remaining": 0, "food_menu": menu, "team_leader_id": users[1].id, "volunteers_count": 3, "weather": "Partly Cloudy", "start_time": "4:00 PM", "end_time": "7:30 PM", "notes": "Day 4", "status": "Completed"},
            {"date": _dt(2026, 7, 23), "location": "Xamar Bile", "people_served": 20, "meals_prepared": 20, "meals_remaining": 0, "food_menu": menu, "team_leader_id": users[1].id, "volunteers_count": 3, "weather": "Sunny", "start_time": "4:00 PM", "end_time": "7:30 PM", "notes": "Day 5", "status": "Completed"},
        ]
        for r in reports_data:
            db.add(DailyReport(created_by=users[0].id, **r))

        # --- Tasks (5 tasks, all Completed) ---
        tasks_data = [
            {"name": "Collect Donations", "description": "Collect donations from team members for the Ramadan Iftar campaign.", "assigned_to_id": users[0].id, "priority": "High", "start_date": _dt(2026, 7, 19), "due_date": _dt(2026, 7, 19), "status": "Completed", "progress": 100},
            {"name": "Buy Food", "description": "Purchase all food items including sambuus, bur, macsharo, timir, and biyo caafi.", "assigned_to_id": users[2].id, "priority": "High", "start_date": _dt(2026, 7, 19), "due_date": _dt(2026, 7, 19), "status": "Completed", "progress": 100},
            {"name": "Prepare Meals", "description": "Cook and prepare iftar meals for 20 people per day.", "assigned_to_id": users[3].id, "priority": "High", "start_date": _dt(2026, 7, 19), "due_date": _dt(2026, 7, 23), "status": "Completed", "progress": 100},
            {"name": "Serve Iftar", "description": "Distribute iftar meals to 20 community members at Block A Main Hall.", "assigned_to_id": users[4].id, "priority": "High", "start_date": _dt(2026, 7, 19), "due_date": _dt(2026, 7, 23), "status": "Completed", "progress": 100},
            {"name": "Clean Up", "description": "Clean up the venue after iftar distribution each day.", "assigned_to_id": users[1].id, "priority": "Medium", "start_date": _dt(2026, 7, 19), "due_date": _dt(2026, 7, 23), "status": "Completed", "progress": 100},
        ]
        for t in tasks_data:
            db.add(Task(created_by=users[0].id, **t))

        # --- Gallery Items (5 videos, one per campaign day) ---
        gallery_data = [
            {"type": "Video", "title": "Day 1 Video", "description": "Ramadan Iftar Campaign Day 1. Team prepares and serves 20 iftar meals.", "campaign_day": 1, "location": "Block A - Main Hall", "date": _dt(2026, 7, 19), "uploaded_by_id": users[0].id, "tags": '["iftar","day-1"]', "color": "from-green-700 to-green-800", "file_name": "day1.mp4", "file_path": "/uploads/videos/day1.mp4", "file_size": "11.2 KB", "duration": "8:24"},
            {"type": "Video", "title": "Day 2 Video", "description": "Ramadan Iftar Campaign Day 2. Kitchen team preparing sambuus and bur.", "campaign_day": 2, "location": "Block A - Main Hall", "date": _dt(2026, 7, 20), "uploaded_by_id": users[0].id, "tags": '["iftar","day-2"]', "color": "from-green-700 to-green-800", "file_name": "day2.mp4", "file_path": "/uploads/videos/day2.mp4", "file_size": "13.3 KB", "duration": "10:15"},
            {"type": "Video", "title": "Day 3 Video", "description": "Ramadan Iftar Campaign Day 3. Community gathers for iftar.", "campaign_day": 3, "location": "Block A - Main Hall", "date": _dt(2026, 7, 21), "uploaded_by_id": users[0].id, "tags": '["iftar","day-3"]', "color": "from-green-700 to-green-800", "file_name": "day3.mp4", "file_path": "/uploads/videos/day3.mp4", "file_size": "10.1 KB", "duration": "7:45"},
            {"type": "Video", "title": "Day 4 Video", "description": "Ramadan Iftar Campaign Day 4. Volunteers coordinate meal distribution.", "campaign_day": 4, "location": "Block A - Main Hall", "date": _dt(2026, 7, 22), "uploaded_by_id": users[0].id, "tags": '["iftar","day-4"]', "color": "from-green-700 to-green-800", "file_name": "day4.mp4", "file_path": "/uploads/videos/day4.mp4", "file_size": "9.1 KB", "duration": "6:50"},
            {"type": "Video", "title": "Day 5 Video", "description": "Ramadan Iftar Campaign Day 5. Final day, 100 people served.", "campaign_day": 5, "location": "Block A - Main Hall", "date": _dt(2026, 7, 23), "uploaded_by_id": users[0].id, "tags": '["iftar","day-5"]', "color": "from-green-700 to-green-800", "file_name": "day5.mp4", "file_path": "/uploads/videos/day5.mp4", "file_size": "16.1 KB", "duration": "12:30"},
        ]
        for g in gallery_data:
            db.add(GalleryItem(**g))

        # --- Messages (5 campaign messages) ---
        all_user_ids = f"[{users[1].id},{users[2].id},{users[3].id},{users[4].id}]"
        messages_data = [
            {"sender_id": users[0].id, "recipient_ids": all_user_ids, "subject": "Campaign Started Successfully", "content": "Assalamu Alaikum team! Our Ramadan Iftar campaign has officially started. Please arrive at Block A by 4:00 PM daily for preparation.", "priority": "High", "status": "Read", "is_read": True, "is_announcement": True, "created_at": _dt(2026, 7, 19)},
            {"sender_id": users[1].id, "recipient_ids": all_user_ids, "subject": "Today's Iftar Preparation is Complete", "content": "Alhamdulillah, today's iftar meals have been prepared. 20 sambuus, 20 bur, 20 macsharo, 60 timir, and 20 bottles of water are ready for distribution.", "priority": "Medium", "status": "Read", "is_read": True, "is_announcement": False, "created_at": _dt(2026, 7, 20)},
            {"sender_id": users[0].id, "recipient_ids": all_user_ids, "subject": "Food Distribution Completed Successfully", "content": "Alhamdulillah, all 20 meals have been distributed today. Jazak Allahu Khairan to all volunteers for their hard work.", "priority": "Medium", "status": "Read", "is_read": True, "is_announcement": False, "created_at": _dt(2026, 7, 21)},
            {"sender_id": users[0].id, "recipient_ids": all_user_ids, "subject": "Thank You Volunteers", "content": "Team, your dedication to this campaign has been incredible. We are almost done. Keep up the amazing work!", "priority": "Low", "status": "Read", "is_read": True, "is_announcement": False, "created_at": _dt(2026, 7, 22)},
            {"sender_id": users[0].id, "recipient_ids": all_user_ids, "subject": "Ramadan Iftar Campaign Completed Successfully", "content": "Alhamdulillah! We have successfully completed our 5-day Ramadan Iftar campaign. 100 community members have been served. May Allah reward all of you. Jazak Allahu Khairan!", "priority": "Urgent", "status": "Delivered", "is_read": False, "is_announcement": True, "created_at": _dt(2026, 7, 23)},
        ]
        for i, m in enumerate(messages_data):
            db.add(Message(attachments='[]', **m))

        db.commit()
    finally:
        db.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(donations.router)
app.include_router(expenses.router)
app.include_router(daily_reports.router)
app.include_router(tasks.router)
app.include_router(gallery.router)
app.include_router(messages.router)

uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def _scan_existing_media():
    """Scan uploads/ directory and create DB records for files not yet in DB."""
    db = SessionLocal()
    try:
        existing_names = {item.file_name for item in db.query(GalleryItem.file_name).all()}
        existing_names.discard(None)

        video_exts = {".mp4", ".mov", ".avi", ".webm"}
        photo_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

        for sub_dir, exts, media_type in [
            (uploads_dir / "videos", video_exts, "Video"),
            (uploads_dir / "photos", photo_exts, "Photo"),
        ]:
            if not sub_dir.exists():
                continue
            for fp in sub_dir.iterdir():
                if fp.name in existing_names or fp.suffix.lower() not in exts:
                    continue
                fsize = fp.stat().st_size
                slug = fp.stem.replace("_", " ").replace("-", " ").title()
                item = GalleryItem(
                    type=media_type,
                    title=slug,
                    description=f"Auto-scanned {media_type.lower()}: {fp.name}",
                    campaign_day=1,
                    location="Block A - Main Hall",
                    date=_dt(2026, 7, 19),
                    uploaded_by_id=1,
                    tags='["auto-scan"]',
                    color="from-green-200 to-green-300" if media_type == "Photo" else "from-green-700 to-green-800",
                    file_name=fp.name,
                    file_path=f"/uploads/{'videos' if media_type == 'Video' else 'photos'}/{fp.name}",
                    file_size=_format_size(fsize),
                )
                db.add(item)
                existing_names.add(fp.name)
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_database()
    _scan_existing_media()


@app.get("/api")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
    }
